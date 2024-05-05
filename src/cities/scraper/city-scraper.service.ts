import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import puppeteer, { Browser } from 'puppeteer';
import { City } from '../entities/city.entity';
import {
  DropdownIdSelectors,
  LiElement,
  getDropdownButtonIdSelector,
} from './utils/typeUtils';
import { getCities, getIds, getElementById } from './utils/html';

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
      headless: false,
      slowMo: this.configService.get<number>('puppeteer.slowMoMs', null),
      defaultViewport: { width, height },
      // executablePath: '/usr/bin/google-chrome',
      // args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
    try {
      CityScraperService.is_running = true;

      await page.goto(endpoint, {
        waitUntil: 'networkidle0',
      });

      var regionIds: string[] = await getIds(
        DropdownIdSelectors.REGION,
        page,
      );
      regionIds = regionIds.slice(regionIds.length -2);
      this.logger.debug('Found region IDs: ' + regionIds);

      for (const idR of regionIds) {
        this.logger.debug(`Processing region: ${idR}`);
        const { "el": liR, "content": regionName }: LiElement = await getElementById(idR, page);
        this.logger.debug(`Found: ${regionName} with id: ${idR}`);
        await liR.click();

        const provinceIds: string[] = await getIds(
          DropdownIdSelectors.PROVINCE,
          page,
        );

        for (const idP of provinceIds) {
          const { "el": liP, "content": provinceName }: LiElement = await getElementById(idP, page);
          this.logger.debug(`Found: ${provinceName} with id: ${idP}`);
          await liP.click();

          const cities = await getCities(regionName, provinceName, idP, page);

          await this.cities.deleteMany({
            region: regionName,
            province: provinceName,
          });
          await this.cities.create(cities);

          this.logger.debug(`Processed ${cities.length} cities`);
          await page.click(getDropdownButtonIdSelector(DropdownIdSelectors.PROVINCE));
        }
        await page.click(getDropdownButtonIdSelector(DropdownIdSelectors.REGION));
      }
    } catch (error) {
      this.logger.error(error.stack);
    } finally {
      await browser.close();
      CityScraperService.is_running = false;
      this.logger.log(`End scraping`);
      const end = performance.now();
      this.logger.log(`Scraping took ${(end - begin) / 1000} s`);
    }
  }
}
