export type LiElement = {
  id: string;
  name: string;
  index: number;
};

export enum DropdownIdSelectors {
  REGION = 'reg',
  PROVINCE = 'prov',
  CITY = 'com',
}

/**
 * Returns the CSS selector for the dropdown element based on the given selector.
 *
 * @param {DropdownIdSelectors} selector - The selector for the dropdown.
 * @return {string} The CSS selector for the dropdown element.
 */
export function getDropdownElementIdSelector(
  selector: DropdownIdSelectors,
): string {
  switch (selector) {
    case DropdownIdSelectors.REGION:
      return 'ul#select2-lev1_ricercaCT-results';
    case DropdownIdSelectors.PROVINCE:
      return 'ul#select2-lev2_ricercaCT-results';
    case DropdownIdSelectors.CITY:
      return 'ul#select2-lev3_ricercaCT-results';
  }
}

/**
 * Returns the CSS selector for the dropdown button element based on the given selector.
 *
 * @param {DropdownIdSelectors} selector - The selector for the dropdown.
 * @return {string} The CSS selector for the dropdown button element.
 */
export function getDropdownButtonIdSelector(
  selector: DropdownIdSelectors,
): string {
  return `#div_sel_${selector} > span > span.selection > span`;
}
