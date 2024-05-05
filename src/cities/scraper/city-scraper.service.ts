import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import puppeteer, { Browser, ElementHandle } from 'puppeteer';
import { City } from '../entities/city.entity';
import {
  CityLiElement,
  DropdownIdSelectors,
  LiElement,
  getDropdownButtonIdSelector,
  getDropdownElementIdSelector,
} from './utils/typeUtils';
import { getCities, getIds, getElementById, getListElement } from './utils/html';
import { parseCities } from './utils/parsing';

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
    const regionList = await getListElement(DropdownIdSelectors.REGION, page); // get region list (need number of regions)
    const numRegions = regionList.length;

    var ids_ = regionList.map(async (el) => el.evaluate((el) => el.id));
    var names_ = regionList.map(async (el) => el.evaluate((el) => el.textContent));
    var rIds: string[] = await Promise.all(ids_);
    var rNames: string[] = await Promise.all(names_);

    var numNonDegradedElements = rIds.filter((id) => (id !== '' && id !== null && id !== undefined)).length;

    var startingIndex = numRegions - numNonDegradedElements;

    this.logger.debug(`Found ${numNonDegradedElements} elements in region list`);

    // Iterate over each region element
    for (let i = startingIndex; i < numRegions; i++) {
      try {
        this.logger.debug(`Scraping region ${rNames[i]}`);
        await page.click(`${getDropdownElementIdSelector(DropdownIdSelectors.REGION)} li:nth-child(${i+1})`); // select element i

        await page.click(getDropdownButtonIdSelector(DropdownIdSelectors.PROVINCE)); // open province dropdown
        const provinceList = await getListElement(DropdownIdSelectors.PROVINCE, page); // get province list (need number of provinces)
        const numProvinces = provinceList.length;
        this.logger.debug(`Found ${numProvinces} provinces in region ${rNames[i]}:`);

        ids_ = provinceList.map(async (el) => el.evaluate((el) => el.id));
        names_ = provinceList.map(async (el) => el.evaluate((el) => el.textContent));
        var pNames: string[] = await Promise.all(names_);
        var pIds: string[] = await Promise.all(ids_);

        numNonDegradedElements = pIds.filter((id) => (id !== '' && id !== null && id !== undefined)).length;

        startingIndex = numProvinces - numNonDegradedElements;

        // Iterate over each province element
        for (let j = startingIndex; j < numProvinces; j++) {
          this.logger.debug(`\tScraping province ${pNames[j]}`);
          await page.click(`${getDropdownElementIdSelector(DropdownIdSelectors.PROVINCE)} li:nth-child(${j+1})`); // select element i

          await page.click(getDropdownButtonIdSelector(DropdownIdSelectors.CITY)); // open province dropdown
          const cityList = await getListElement(DropdownIdSelectors.CITY, page); // get province list (need number of provinces)
          const numCities = cityList.length;
          
          this.logger.debug(`\tFound ${numCities} cities in province ${pNames[j]}`);

          ids_ = cityList.map(async (el) => el.evaluate((el) => el.id));
          names_ = cityList.map(async (el) => el.evaluate((el) => el.textContent));
          var cNames: string[] = (await Promise.all(names_)).filter((name) => (name !== '' && name !== null && name !== undefined));
          var cIds: string[] = (await Promise.all(ids_)).filter((id) => (id !== '' && id !== null && id !== undefined));
          
          const cities_ : CityLiElement[] = [];

          for (let k = 0; k < cIds.length; k++) {
            cities_.push({ id: cIds[k], name: cNames[k] });
          }

          const cities: City[] = parseCities(cities_, rNames[i], pNames[j], pIds[j]);

          await this.cities.deleteMany({ region: rNames[i], province: pNames[j] });
          await this.cities.create(cities);

          await page.click(getDropdownButtonIdSelector(DropdownIdSelectors.PROVINCE)); // open province dropdown
        }

      } catch (error) {
        console.error(error);
        continue
      } finally {
        await page.click(getDropdownButtonIdSelector(DropdownIdSelectors.REGION))
      }
    }

    CityScraperService.is_running = false;
    const end = performance.now();
    this.logger.log(`Finish scraping ${endpoint} in ${end - begin} ms`);
    await browser.close();
    
  }
}
