import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer, { Browser } from 'puppeteer';
import { RegionResponse } from './dto/region.response';
import { HttpService } from '@nestjs/axios';
import { Province } from '../entities/province.entity';
import { ProvinceResponse } from './dto/province.response';
import { City } from '../entities/city.entity';
import { AxiosResponse } from 'axios';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private readonly mainApiEndpoint: string =
    'https://wms.cartografia.agenziaentrate.gov.it/inspire/ajax/ajax.php?';
  constructor(
    private configService: ConfigService,
    private readonly http: HttpService,
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

  async scrape(region: string): Promise<City[]> {
    const cities: City[] = [];
    this.logger.debug(`Scraping ${region}`);
    const provinces = await this.getProvinces(region);
    for (const province of provinces) {
      const _cities = await this.getCities(province);
      cities.push(..._cities);
    }
    return cities;
  }

  async getRegions() {
    const browser = await this.browser();
    const page = await browser.newPage();
    await page.goto(
      this.configService.get<string>('puppeteer.scrapingEndpoint'),
    );
    const regions = await page.$$eval('#lev1_ricercaCT > option', (el) =>
      el.map((opt) => opt.textContent),
    );
    regions.shift();
    await browser.close();
    return regions;
  }

  private async getProvinces(region: string): Promise<Province[]> {
    const _response: AxiosResponse<RegionResponse> =
      await this.http.axiosRef.get<RegionResponse>(
        this.mainApiEndpoint + `op=getProvince&reg=${region.toUpperCase()}`,
      );
    const response = _response.data;

    const provinces = response.SIGLA_PROVINCIA.map((prov, index) => ({
      shortName: prov,
      name: response.DENOMINAZIONE[index],
      region: region,
    }));
    return provinces;
  }

  private async getCities(province: Province): Promise<City[]> {
    const endpoint: string =
      this.mainApiEndpoint +
      `op=getComuniSez&prov=${province.shortName.toUpperCase()}`;
    const _response: AxiosResponse<ProvinceResponse> =
      await this.http.axiosRef.get<ProvinceResponse>(endpoint);
    const response = _response.data;

    return this.getCitiesFromResponse(province, response);
  }

  private async getCitiesFromResponse(
    province: Province,
    response: ProvinceResponse,
  ): Promise<City[]> {
    const cities = response.DENOMINAZIONE.map((city, index) => ({
      name: city.includes('/') ? city.substring(0, city.indexOf('/')) : city,
      code: response.COD_COMUNE[index],
      section: response.SEZIONE[index],
      province: province.name,
      provinceCode: province.shortName,
      region: province.region,
    }));
    return cities;
  }
}
