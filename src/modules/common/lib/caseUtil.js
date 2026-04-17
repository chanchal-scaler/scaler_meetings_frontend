import camelCase from 'lodash/camelCase';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import isPlainObject from 'lodash/isPlainObject';
import kebabCase from 'lodash/kebabCase';
import lowerCase from 'lodash/lowerCase';
import snakeCase from 'lodash/snakeCase';
import startCase from 'lodash/startCase';
import upperCase from 'lodash/upperCase';

/**
 * Utility Library for converting from one case to another.
 * Supported cases are accessible as static methods but only
 * for string data-types
 *
 * For objects ({}, [], Sets) use toCase method.property
 *
 * Example:
 *  CaseUtil.toCase('snakeCase', { 'camelCase': 3 })
 *  -> {camel_case: 3}
 *
 */
export default class CaseUtil {
  /**
   * Converts source to camelCase
   *
   * @param {String} str : source string
   */
  static camelCase(str) {
    return camelCase(str);
  }

  /**
   * Converts source to CONSTANT_CASE
   *
   * @param {String} str : source string
   */
  static constantCase(str) {
    return upperCase(str).replace(/ /g, '_');
  }

  /**
   * Converts source to kebab-case
   *
   * @param {String} str : source string
   */
  static kebabCase(str) {
    return kebabCase(str);
  }

  /**
   * Converts source to lowercase
   *
   * @param {String} str : source string
   */
  static lowerCase(str) {
    return lowerCase(str).replace(/ /g, '');
  }

  /**
   * Converts source to snake_case
   *
   * @param {String} str : source string
   */
  static snakeCase(str) {
    return snakeCase(str);
  }

  /**
   * Converts source to "Title Case"
   *
   * @param {String} str : source string
   */
  static titleCase(str) {
    return startCase(camelCase(str));
  }

  /**
   * Checks if the given case is supported by CaseUtil
   *
   * @static
   * @param {string} tCase
   * @returns string
   * @memberof CaseUtil
   */
  static isSupportedCase(tCase) {
    return Object.prototype.hasOwnProperty.call(CaseUtil, tCase);
  }

  /**
   * Converts object to specific case
   *
   * @static
   * @param {string} tCase
   * @param {object | function | array | string | any} tObj
   * @returns any
   * @memberof CaseUtil
   */
  static toCase(tCase, tObj) {
    if (!tCase || !this.isSupportedCase) {
      throw new TypeError(`Invalid target case: ${tCase}`);
    }

    const tFun = this[tCase];

    if (!isObject(tObj)) {
      return tFun(tObj);
    }

    const convert = (o) => {
      if (isPlainObject(o)) {
        const n = {};

        Object.keys(o).forEach(key => { n[tFun(key)] = convert(o[key]); });

        return n;
      } else if (isArray(o)) {
        return o.map(elem => convert(elem));
      }

      return o;
    };

    return convert(tObj);
  }
}
