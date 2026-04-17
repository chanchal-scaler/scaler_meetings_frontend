import { createSelector } from 'reselect';
import forOwn from 'lodash/forOwn';

import { isNullOrUndefined } from '@common/utils/type';

function normalizedAssociation(association, associations) {
  const { type, id } = association;
  const data = associations[type] && associations[type][id];
  if (data) {
    // eslint-disable-next-line no-use-before-define
    return normalizedSingleEntity(data, associations);
  } else {
    // If association data is not sent then simply return a object with id key
    const _id = parseInt(id, 10);
    return { id: Number.isNaN(_id) ? id : _id };
  }
}

function normalizedSingleEntity(data, associations) {
  const { associations: entityAssociations, ...baseData } = data;
  const normalizedData = baseData;

  forOwn(entityAssociations, (v, k) => {
    if (isNullOrUndefined(v)) {
      normalizedData[k] = null;
    } else if (Array.isArray(v)) {
      normalizedData[k] = v.map(o => normalizedAssociation(o, associations));
    } else {
      normalizedData[k] = normalizedAssociation(v, associations);
    }
  });

  return normalizedData;
}

export function normalizedResponseSelector(data, associations) {
  if (Array.isArray(data)) {
    return data.map(o => normalizedSingleEntity(o, associations));
  } else if (!isNullOrUndefined(data)) {
    return normalizedSingleEntity(data, associations);
  } else {
    return null;
  }
}

export function createNormalizedResponseSelector(
  baseSelector,
  options = {},
) {
  const { isList = false } = options;
  const defaultState = {
    data: isList ? [] : null,
    associations: {},
  };

  const dataSelector = (state) => {
    const response = baseSelector(state) || defaultState;
    return response.data;
  };

  const associationsSelector = (state) => {
    const response = baseSelector(state) || defaultState;
    return response.associations;
  };

  return createSelector(
    dataSelector,
    associationsSelector,
    normalizedResponseSelector,
  );
}
