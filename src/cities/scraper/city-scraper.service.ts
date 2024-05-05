import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import puppeteer, { Browser } from 'puppeteer';
import { City } from '../entities/city.entity';
import {
  DropdownIdSelectors,
  getDropdownButtonIdSelector,
  getDropdownElementIdSelector,
} from './utils/typeUtils';
import { elementToCity } from './utils/parsing';
import { getLiElements } from './utils/html';

@Injectable()
export class CityScraperService {
  private readonly logger = new Logger('CityScraperService');
  static is_running: boolean = false;

  constructor(
    private configService: ConfigService,
    @InjectModel(City.name) private cities: Model<City>,
  ) {}

  /**
   * Gets the browser instance with some pre configured settings.
   *
   * @return {Promise<Browser>} Promise that resolves with the browser instance.
   */
  private async browser(): Promise<Browser> {
    const width = 1800,
      height = 1600;
    return await puppeteer.launch({
      headless: this.configService.get<boolean>('puppeteer.headless', true),
      slowMo: this.configService.get<number>('puppeteer.slowMoMs', null),
      defaultViewport: { width, height },
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  /**
   * Scrapes data from the specified endpoint, processes region and province data,
   * and creates city entries in the database.
   * This could be run in a cron job.
   *
   * @return {Promise<void>} Promise that resolves once scraping and processing are complete.
   */
  async scrape(): Promise<void> {
    const endpoint: string = this.configService.get<string>(
      'puppeteer.scrapingEndpoint',
    );
    this.logger.log(`Start scraping ${endpoint}`);
    const browser = await this.browser();
    const page = await browser.newPage();

    const begin = performance.now();

    CityScraperService.is_running = true;

    await page.goto(endpoint, {
      waitUntil: 'networkidle0',
    });

    await page.click(getDropdownButtonIdSelector(DropdownIdSelectors.REGION)); // open region dropdown

    const regions = await getLiElements(page, DropdownIdSelectors.REGION); // get region list
    this.logger.debug(regions);

    this.logger.debug(`Found ${regions.length} elements in region list`);

    // Iterate over each region element
    for (const region of regions) {
      try {
        this.logger.debug(`Scraping region ${region.name}`);
        await page.click(
          `${getDropdownElementIdSelector(DropdownIdSelectors.REGION)} li:nth-child(${region.index + 1})`,
        ); // select element i

        await page.click(
          getDropdownButtonIdSelector(DropdownIdSelectors.PROVINCE),
        ); // open province dropdown
        const provinces = await getLiElements(
          page,
          DropdownIdSelectors.PROVINCE,
        ); // get province list
        this.logger.debug(`Found ${provinces.length} elements in region list`);

        // Iterate over each province element
        for (const province of provinces) {
          this.logger.debug(`\tScraping province ${province.name}`);
          await page.click(
            `${getDropdownElementIdSelector(DropdownIdSelectors.PROVINCE)} li:nth-child(${province.index + 1})`,
          ); // select element i

          await page.click(
            getDropdownButtonIdSelector(DropdownIdSelectors.CITY),
          ); // open province dropdown
          const cities_ = await getLiElements(page, DropdownIdSelectors.CITY); // get province list

          this.logger.debug(`\tFound ${cities_.length} elements in city list`);

          const cities: City[] = cities_.map((c) =>
            elementToCity(c, region.name, province.name, province.id),
          );

          await this.cities.deleteMany({
            region: region.name,
            province: province.name,
          });
          await this.cities.create(cities);

          await page.click(
            getDropdownButtonIdSelector(DropdownIdSelectors.PROVINCE),
          ); // open province dropdown
        }
      } catch (error) {
        console.error(error);
        continue;
      } finally {
        await page.click(
          getDropdownButtonIdSelector(DropdownIdSelectors.REGION),
        );
      }
    }

    CityScraperService.is_running = false;
    const end = performance.now();
    this.logger.log(`Finish scraping ${endpoint} in ${end - begin} ms`);
    await browser.close();
  }
}
