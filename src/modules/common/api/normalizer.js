import forOwn from 'lodash/forOwn';

import {
  normalizedResponseSelector,
} from '@common/selectors/jsonApi';

function normalizeJsonApiData(data) {
  const normalizedData = { ...data.attributes };
  if (data.meta) {
    normalizedData.meta = data.meta;
  }
  if (data.relationships) {
    normalizedData.associations = {};
    forOwn(data.relationships, (v, k) => {
      normalizedData.associations[k] = v.data;
    });
  }
  return normalizedData;
}

export function normalizeJsonApiResponse(response) {
  const { data: _data, meta, included } = response;

  let data;
  const associations = {};

  if (Array.isArray(_data)) {
    data = _data.map(normalizeJsonApiData);
  } else {
    data = normalizeJsonApiData(_data);
  }

  if (included) {
    included.forEach(entityData => {
      const { type: entityType, id: entityId } = entityData;
      associations[entityType] ||= {};
      associations[entityType][entityId] = normalizeJsonApiData(entityData);
    });
  }

  return { data, associations, meta };
}

export const normalizeResponse = (response) => {
  if (!response) return null;

  const _response = normalizeJsonApiResponse(response);
  const { data, associations, meta } = _response;
  return {
    data: normalizedResponseSelector(data, associations),
    meta,
  };
};
