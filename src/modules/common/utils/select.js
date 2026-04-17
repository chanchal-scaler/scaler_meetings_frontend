export function convertSingletonToObject(item) {
  return { key: item, value: item };
}

export function convertArraySingletonsToObject(array) {
  return array.map(item => ({ key: item, value: item }));
}

export function convertArrayObjectToSelectObject(array, key, value = key) {
  return array.map(item => ({ ...item, key: item[key], value: item[value] }));
}

export function getKeys(targetValues) {
  const values = [];
  targetValues.map(item => values.push(item.key));
  return values;
}

export function getValues(targetValues) {
  const values = [];
  targetValues.map(item => values.push(item.value));
  return values;
}

export function getValuesObject(targetValues) {
  const values = [];
  targetValues.map(item => values.push(item));
  return values;
}
