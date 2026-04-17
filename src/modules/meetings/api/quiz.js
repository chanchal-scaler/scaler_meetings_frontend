import { apiRequest } from '@common/api/utils';
import { BASENAME } from '~meetings/utils/constants';
import { meetingApiRequest } from './baseMeetingApi';
import { QUIZZES_PER_PAGE } from '~meetings/utils/quiz';

// deprecated
function getQuizList(slug) {
  return apiRequest('GET', `${BASENAME}/${slug}/quizzes`);
}

function getAllQuizList(slug, data) {
  return meetingApiRequest('GET', `${BASENAME}/${slug}/quizzes/all`, {
    ...data, per_page: QUIZZES_PER_PAGE,
  });
}

function getSavedQuizList(slug, data) {
  return meetingApiRequest('GET', `${BASENAME}/${slug}/quizzes/bookmarks`, {
    ...data, per_page: QUIZZES_PER_PAGE,
  });
}

function getLaunchedQuizList(slug, data) {
  return meetingApiRequest('GET', `${BASENAME}/${slug}/quizzes/launched`, {
    ...data, per_page: QUIZZES_PER_PAGE,
  });
}

function getQuizTopics(slug, data) {
  return meetingApiRequest('GET', `${BASENAME}/${slug}/quizzes/topics`, data);
}

function getQuizInstructors(slug, data) {
  return meetingApiRequest(
    'GET', `${BASENAME}/${slug}/quizzes/instructors`, data,
  );
}

function createQuiz(slug, data) {
  return meetingApiRequest('POST', `${BASENAME}/${slug}/quizzes`, data);
}

function updateQuiz(slug, problemId, data) {
  return meetingApiRequest(
    'PUT',
    `${BASENAME}/${slug}/quizzes/${problemId}`,
    data,
  );
}

function publishQuiz(slug, problemId, data) {
  return meetingApiRequest(
    'POST', `${BASENAME}/${slug}/quizzes/${problemId}/publish`, data,
  );
}

function getQuizMeta(slug) {
  return meetingApiRequest('GET', `${BASENAME}/${slug}/quizzes/meta`);
}

function saveQuiz(slug, problemId) {
  return meetingApiRequest(
    'POST', `${BASENAME}/${slug}/quizzes/bookmark/${problemId}`,
  );
}

function unsaveQuiz(slug, problemId) {
  return meetingApiRequest(
    'DELETE', `${BASENAME}/${slug}/quizzes/bookmark/${problemId}`,
  );
}

export default {
  create: createQuiz,
  update: updateQuiz,
  getList: getQuizList,
  getAllList: getAllQuizList,
  publish: publishQuiz,
  getTopics: getQuizTopics,
  getInstructors: getQuizInstructors,
  getSavedList: getSavedQuizList,
  getLaunchedList: getLaunchedQuizList,
  meta: getQuizMeta,
  save: saveQuiz,
  unsave: unsaveQuiz,
};
