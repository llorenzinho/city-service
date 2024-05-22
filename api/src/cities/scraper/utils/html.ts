import { Page } from 'puppeteer';
import {
  DropdownIdSelectors,
  LiElement,
  getDropdownButtonIdSelector,
  getDropdownElementIdSelector,
} from './typeUtils';

/**
 * Retrieves the list items from a dropdown element on a web page.
 *
 * @param {Page} page - The Puppeteer page object.
 * @param {DropdownIdSelectors} selector - The selector for the dropdown element.
 * @return {Promise<LiElement[]>} A promise that resolves to an array of LiElement objects representing the list items.
 */
export async function getLiElements(
  page: Page,
  selector: DropdownIdSelectors,
): Promise<LiElement[]> {
  const dropdown = await page.$(getDropdownElementIdSelector(selector));
  const elems = await dropdown.$$eval('li', (el) =>
    el.map((li, index) => ({
      id: li.id,
      name: li.textContent,
      index: index + 1,
    })),
  );
  return elems.filter(
    (el) => el.id !== '' && el.id !== null && el.id !== undefined,
  );
}

export async function clickLI(
  page: Page,
  dropDownSelector: DropdownIdSelectors,
  ...selectors: string[]
) {
  const sel = [
    getDropdownElementIdSelector(dropDownSelector),
    ...selectors,
  ].join(' ');
  await page.click(sel);
}

export async function clickBTN(
  page: Page,
  dropDownSelector: DropdownIdSelectors,
) {
  await page.click(getDropdownButtonIdSelector(dropDownSelector));
}
