const getValues = (filters, keys) => {
  const filterObj = { ...filters };
  keys.forEach((item) => {
    const valueObj = filterObj[item];
    const newValues = [];
    valueObj.forEach(obj => { newValues.push(obj.key); });
    filterObj[item] = newValues;
  });
  return filterObj;
};

export default {
  getValues,
};
