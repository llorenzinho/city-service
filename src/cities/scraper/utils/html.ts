import { ElementHandle, Page } from 'puppeteer';
import {
  CityLiElement,
  DropdownIdSelectors,
  LiElement,
  getDropdownButtonIdSelector,
  getDropdownElementIdSelector,
} from './typeUtils';
import { parseCities } from './parsing';
import { City } from 'src/cities/entities/city.entity';

/**
 * Retrieves the i-th element from a dropdown list identified by the given selector.
 *
 * @param {DropdownIdSelectors} selector - The identifier for the dropdown list.
 * @param {number} index - The index of the element to retrieve.
 * @param {Page} page - The Puppeteer page object representing the web page.
 * @return {Promise<LiElement>} A promise that resolves to the i-th element of the dropdown list.
 */
export async function getIthElementForDropdown(
  selector: DropdownIdSelectors,
  index: number,
  page: Page,
): Promise<LiElement> {
  const li = await getIthElementInListById(
    getDropdownElementIdSelector(selector),
    index,
    page,
  );
  return li;
}

/**
 * Retrieves the i-th element in a list with the specified CSS ID from the given page and returns its text content.
 *
 * @param {string} cssId - The CSS ID of the list element.
 * @param {number} index - The index of the element to retrieve.
 * @param {Page} page - The page object representing the web page.
 * @return {Promise<LiElement>} A promise that resolves to an object containing the HTML element and its text content.
 * @throws {Error} If the element with the specified CSS ID cannot be found.
 */
async function getIthElementInListById(
  cssId: string,
  index: number,
  page: Page,
): Promise<LiElement> {
  try {
    const li = await page.$(`${cssId} li:nth-child(${index})`);
    const content = await li.evaluate((el) => el.textContent);
    return { el: li, content: content };
  } catch (error) {
    console.error(`failed to get element with id ${cssId}: error Type: ${error.type}`);
    throw error;
  }
}


/**
 * Retrieves the HTML element with the specified CSS ID from the given page and returns its text content.
 *
 * @param {string} cssId - The CSS ID of the element to retrieve.
 * @param {Page} page - The page object representing the web page.
 * @return {Promise<LiElement>} A promise that resolves to an object containing the HTML element and its text content.
 * @throws {Error} If the element with the specified CSS ID cannot be found.
 */
export async function getElementById(cssId: string, page: Page): Promise<LiElement> {
    try {
        const li = await page.$(`#${cssId}`);
        const content = await li.evaluate((el) => el.textContent);
        return { el: li, content: content };
    } catch (error) {
        console.error(`failed to get element with id ${cssId}`);
        throw error;
    }
}

export async function getListElement(
    selector: DropdownIdSelectors,
    page: Page
): Promise<ElementHandle<HTMLLIElement>[]> {
  await page.click(getDropdownButtonIdSelector(selector));
  const list = await page.$$(`${getDropdownElementIdSelector(selector)} li`);
  return list;
}

/**
 * Retrieves an array of string IDs for a given dropdown selector on a web page.
 *
 * @param {DropdownIdSelectors} selector - The selector for the dropdown.
 * @param {Page} page - The Puppeteer page object representing the web page.
 * @return {Promise<string[]>} A promise that resolves to an array of string IDs.
 */
export async function getIds(
  selector: DropdownIdSelectors,
  page: Page,
): Promise<string[]> {
  const list = await getListElement(selector, page);
  const listIdsPromise = list.map((el) => el.evaluate((el) => el.id));
  const listIds = await Promise.all(listIdsPromise);
  return listIds.filter((id) => (id !== '' && id !== null && id !== undefined));
}

/**
 * Retrieves an array of City objects representing the cities in a given region, province, and province ID.
 *
 * @param {string} regionName - The name of the region.
 * @param {string} provinceName - The name of the province.
 * @param {string} provinceID - The ID of the province.
 * @param {Page} page - The Puppeteer page object representing the web page.
 * @return {Promise<City[]>} A promise that resolves to an array of City objects.
 */
export async function getCities(
  regionName: string,
  provinceName: string,
  provinceID: string,
  page: Page,
): Promise<City[]> {
  await page.click(getDropdownButtonIdSelector(DropdownIdSelectors.CITY));
  const citiesDropdown = await page.$(
    getDropdownElementIdSelector(DropdownIdSelectors.CITY),
  );
  const citiesListObjects: CityLiElement[] = await citiesDropdown.$$eval(
    'li',
    (lis) => lis.map((li) => ({ id: li.id, name: li.textContent })),
  );
  const cities = parseCities(
    citiesListObjects,
    regionName,
    provinceName,
    provinceID,
  );
  return cities;
}
