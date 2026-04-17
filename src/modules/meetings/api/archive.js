import { apiRequest } from '@common/api/utils';
import { BASENAME } from '~meetings/utils/constants';

function getArchiveItem(slug) {
  return apiRequest('GET', `${BASENAME}/${slug}/recordings`);
}

function captureArchiveVideoEvents(events) {
  return apiRequest(
    'POST',
    `${BASENAME}/recordings/capture-video-events`,
    events,
    { keepalive: true },
  );
}

function getQuizzes(slug) {
  return apiRequest('GET', `${BASENAME}/${slug}/recordings/quizzes`);
}

function submitQuiz(slug, data) {
  return apiRequest(
    'POST',
    `${BASENAME}/${slug}/recordings/quizzes/submit`,
    data,
  );
}

function fetchQuizResult(slug, data) {
  return apiRequest(
    'GET',
    `${BASENAME}/${slug}/recordings/quizzes/result`,
    data,
  );
}

function acknowledgeQuiz(slug, quizId) {
  return apiRequest(
    'POST',
    `${BASENAME}/${slug}/recordings/quizzes/ack`,
    { quiz_id: quizId },
  );
}

function myLeaderboardRank(slug) {
  return apiRequest('GET', `${BASENAME}/${slug}/recordings/quizzes/my-rank`);
}

export default {
  getItem: getArchiveItem,
  captureEvents: captureArchiveVideoEvents,
  getQuizzes,
  submitQuiz,
  fetchQuizResult,
  acknowledgeQuiz,
  myRank: myLeaderboardRank,
};
