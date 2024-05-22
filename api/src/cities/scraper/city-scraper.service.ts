import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import puppeteer, { Browser, HTTPResponse, Page } from 'puppeteer';
import { City } from '../entities/city.entity';
import { DropdownIdSelectors } from './utils/typeUtils';
import { elementToCity } from './utils/parsing';
import { clickBTN, clickLI, getLiElements } from './utils/html';

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

  async scrape() {
    CityScraperService.is_running = true;
    const begin = performance.now();
    const endpoint: string = this.configService.get<string>(
      'puppeteer.scrapingEndpoint',
    );
    let browser: Browser;
    try {
      this.logger.log(`Start scraping ${endpoint}`);
      browser = await this.browser();
      const page = await browser.newPage();

      await this._scrape(page, endpoint);
    } catch (error) {
      this.logger.error(`Raised Error while scraping: ${error}`);
    } finally {
      CityScraperService.is_running = false;
      const end = performance.now();
      this.logger.log(
        `Finish scraping ${endpoint} in ${(end - begin) / 1000} s`,
      );
      await browser?.close();
    }
  }

  /**
   * Scrapes data from the specified endpoint, processes region and province data,
   * and creates city entries in the database.
   * This could be run in a cron job.
   *
   * @return {Promise<void>} Promise that resolves once scraping and processing are complete.
   */
  async _scrape(page: Page, endpoint: string): Promise<void> {
    const response: HTTPResponse = await page.goto(endpoint, {
      waitUntil: 'networkidle0',
    });

    if (response.status() !== 200) {
      this.logger.error(
        `Failed to fetch data from ${endpoint}. Status code: ${response.status()}`,
      );
      return;
    }

    await clickBTN(page, DropdownIdSelectors.REGION); // open region dropdown

    const regions = await getLiElements(page, DropdownIdSelectors.REGION); // get region list

    this.logger.debug(`Found ${regions.length} elements in region list`);

    // Iterate over each region element
    for (const region of regions) {
      try {
        this.logger.debug(`Scraping region ${region.name}`);
        await clickLI(
          page,
          DropdownIdSelectors.REGION,
          `li:nth-child(${region.index})`,
        ); // select element i

        await clickBTN(page, DropdownIdSelectors.PROVINCE); // open province dropdown
        const provinces = await getLiElements(
          page,
          DropdownIdSelectors.PROVINCE,
        ); // get province list
        this.logger.debug(`Found ${provinces.length} elements in region list`);

        // Iterate over each province element
        for (const province of provinces) {
          this.logger.debug(`\tScraping province ${province.name}`);
          await clickLI(
            page,
            DropdownIdSelectors.PROVINCE,
            `li:nth-child(${province.index})`,
          ); // select element i

          await clickBTN(page, DropdownIdSelectors.CITY); // open cities dropdown
          const cities_ = await getLiElements(page, DropdownIdSelectors.CITY); // get cities list

          this.logger.debug(`\tFound ${cities_.length} elements in city list`);

          const cities: City[] = cities_.map((c) =>
            elementToCity(c, region.name, province.name, province.id),
          );

          await this.cities.deleteMany({
            region: region.name,
            province: province.name,
          });
          await this.cities.create(cities);

          await clickBTN(page, DropdownIdSelectors.PROVINCE); // open province dropdown
        }
      } catch (error) {
        console.error(error);
        continue;
      } finally {
        await clickBTN(page, DropdownIdSelectors.REGION);
      }
    }
  }
}
