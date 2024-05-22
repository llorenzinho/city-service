import { City } from 'src/cities/entities/city.entity';
import { LiElement } from './typeUtils';

/**
 * Converts a CityLiElement object to a City object.
 *
 * @param {CityLiElement} liObject - The CityLiElement object to be converted.
 * @param {string} regionName - The name of the region.
 * @param {string} provinceName - The name of the province.
 * @param {string} provinceCode - The code of the province.
 * @return {City} The converted City object.
 */
export function elementToCity(
  liObject: LiElement,
  regionName: string,
  provinceName: string,
  provinceCode: string,
): City {
  let cityName: string = liObject.name;
  const cityId: string = liObject.id;
  const cityCode: string = cityName.includes('/')
    ? cityId.split('-').slice(-2).join('-')
    : cityId.substring(cityId.lastIndexOf('-') + 1);
  const citySection: string = cityName.includes('/')
    ? cityName.substring(cityName.indexOf('/') + 1)
    : null;
  if (cityName.includes('/'))
    cityName = cityName.substring(0, cityName.indexOf('/'));

  return {
    id: cityCode,
    name: cityName,
    code: cityCode,
    section: citySection,
    province: provinceName,
    provinceCode: provinceCode,
    region: regionName,
  };
}
