import forOwn from 'lodash/forOwn';

/**
 *
 * @param {Object} filters
 * @returns {Array} filters
 *
 * example input: {
 *  "status": "active",
 *  "module": "core",
 * }
 *
 * returns {
 *  "filter[status]": "active",
 *  "filter[module]": "core",
 * }
 */
export const buildJsonApiFilters = (filters) => {
  const jsonApiFilters = {};
  forOwn(filters, (value, key) => {
    jsonApiFilters[`filter[${key}]`] = value;
  });
  return jsonApiFilters;
};
