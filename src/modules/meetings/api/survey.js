import { apiRequest } from '@common/api/utils';

function getSurveyList(data) {
  return apiRequest('GET', `/api/v3/surveys`, data);
}
function getSurveyResults(id) {
  return apiRequest('GET', `/api/v3/surveys/${id}`);
}

function createAndPublishSurvey(data) {
  return apiRequest('POST', `/api/v3/surveys`, data);
}

export default {
  createAndPublish: createAndPublishSurvey,
  getList: getSurveyList,
  getResult: getSurveyResults,
};
