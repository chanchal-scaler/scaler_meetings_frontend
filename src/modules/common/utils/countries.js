import countriesMap from './countries.json';

export const list = [];

Object.keys(countriesMap).forEach((code) => (
  list.push({ code, ...countriesMap[code] })
));

export function isUSA(country) {
  return country === 'USA';
}

export function getCountryDetails(countryCode) {
  return list.find(obj => obj.code === countryCode);
}

export default {
  list,
  countriesMap,
  isUSA,
  getCountryDetails,
};
