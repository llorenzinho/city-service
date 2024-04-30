import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer, { Browser, ElementHandle, HTTPResponse, Page } from 'puppeteer';

enum DropdownIdSelectors {
    REGION = "reg",
    PROVINCE = "prov",
    CITY = "com",
}

function getDropdownButtonIdSelector(selector: DropdownIdSelectors): string {
    return `#div_sel_${selector} > span > span.selection > span`
}

function getDropdownElementIdSelector(selector: DropdownIdSelectors): string {
    switch (selector) {
        case DropdownIdSelectors.REGION:
            return "#select2-lev1_ricercaCT-results";
        case DropdownIdSelectors.PROVINCE:
            return "#select2-lev2_ricercaCT-results";
        case DropdownIdSelectors.CITY:
            return "#select2-lev3_ricercaCT-results";
    }
}

@Injectable()
export class CityScraperService {
    private readonly logger = new Logger("CityScraperService");

    constructor(private configService: ConfigService) {}
    private async browser(): Promise<Browser> {
        const width=1800, height=1600;
        return await puppeteer.launch({
            headless: this.configService.get<boolean>('PUPPETTEER_HEADLESS', true),
            slowMo: this.configService.get<number>('PUPPETTEER_SLOW_MO_MS', null),
            defaultViewport: {width, height},
        });
    }

    private async getDropdownElemets(page: Page, selector: DropdownIdSelectors): Promise<ElementHandle<HTMLLIElement>[]> {
        await page.click(getDropdownButtonIdSelector(selector));
        const dropdownElement = await page.waitForSelector(getDropdownElementIdSelector(selector));
        const dropdownList = await dropdownElement.$$('li');
        await page.click(getDropdownButtonIdSelector(selector));
        return dropdownList;
    }


    async scrape() {
        const endpoint: string = this.configService.get<string>('PUPPETTEER_CITY_SCRAPER_ENDPOINT');

        this.logger.log(`Start scraping ${endpoint}`);
        const browser = await this.browser();
        const page = await browser.newPage();
        try {
            const response: HTTPResponse = await page.goto(endpoint, {waitUntil: 'networkidle0'});
            // TODO: Manage response status

            const regionList = await this.getDropdownElemets(page, DropdownIdSelectors.REGION);
            const numRegion: number = regionList.length;

            for (let i = 2; i <= numRegion; i++) {
                const regionName: string = await regionList[i-1].getProperty('innerText').then((prop) => prop.jsonValue());
                this.logger.log(`Processing region ${i-1}/${numRegion-1}: ${regionName}`);
                await page.click(getDropdownButtonIdSelector(DropdownIdSelectors.REGION));
                await page.click(`${getDropdownElementIdSelector(DropdownIdSelectors.REGION)} > li:nth-child(${i})`);

                const provinceList = await this.getDropdownElemets(page, DropdownIdSelectors.PROVINCE);
                const numProvince: number = provinceList.length;

                for (let j = 2; j <= numProvince; j++) {
                    const provinceName: string = await provinceList[j-1].getProperty('innerText').then((prop) => prop.jsonValue());
                    const provinceId: string = await provinceList[j-1].getProperty('id').then((prop) => prop.jsonValue());
                    const provinceCode: string = provinceId.substring(provinceId.lastIndexOf('-') + 1);
                    this.logger.log(`Processing province ${j-1}/${numProvince-1}: ${provinceName}`);

                    await page.click(getDropdownButtonIdSelector(DropdownIdSelectors.PROVINCE));
                    await page.click(`${getDropdownElementIdSelector(DropdownIdSelectors.PROVINCE)} > li:nth-child(${j})`);

                    const cities = await this.getDropdownElemets(page, DropdownIdSelectors.CITY);

                    for (const city of cities) {
                        var cityName: string = await city.getProperty('innerText').then((prop) => prop.jsonValue());
                        const cityId: string = await city.getProperty('id').then((prop) => prop.jsonValue());
                        const cityCode: string = cityName.includes('/') ? cityId.split('-').slice(-2).join('-') : cityId.substring(cityId.lastIndexOf('-') + 1);
                        const citySection: string = cityName.includes('/') ? cityName.substring(cityName.indexOf('/') + 1) : null;
                        if (cityName.includes('/')) cityName = cityName.substring(0, cityName.indexOf('/'));
                        this.logger.debug(`Region: ${regionName}, Province: ${provinceName} (${provinceCode}), City: ${cityName} (${citySection}, ${cityCode})`);
                    }
                }
            }

        } catch (error) {
            this.logger.error(error);
        } finally {
            browser.close();
        }
        
    }
}
