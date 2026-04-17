import { apiRequest } from '@common/api/utils';
import { BASENAME } from '~meetings/utils/constants';
import { meetingApiRequest } from './baseMeetingApi';

function answerQuestion(meetingSlug, questionId) {
  return meetingApiRequest(
    'POST',
    `${BASENAME}/${meetingSlug}/questions/answer`,
    { question_id: questionId },
  );
}

function createQuestion(meetingSlug, body) {
  return apiRequest(
    'POST',
    `${BASENAME}/${meetingSlug}/questions`,
    { body },
  );
}

// API that marks question as duplicate/already answered
function dismissQuestion(meetingSlug, questionId) {
  return meetingApiRequest(
    'PUT',
    `${BASENAME}/${meetingSlug}/questions/dismiss`,
    { question_id: questionId },
  );
}

function getQuestionsList(meetingSlug) {
  return apiRequest('GET', `${BASENAME}/${meetingSlug}/questions`);
}

function withdrawQuestion(meetingSlug, questionId) {
  return apiRequest(
    'PUT',
    `${BASENAME}/${meetingSlug}/questions/withdraw`,
    { question_id: questionId },
  );
}

function deleteQuestion(meetingSlug, questionId) {
  return meetingApiRequest(
    'PUT',
    `${BASENAME}/${meetingSlug}/questions/delete`,
    { question_id: questionId },
  );
}

function voteQuestion(meetingSlug, questionId, isUpvote) {
  return apiRequest(
    'POST',
    `${BASENAME}/${meetingSlug}/questions/vote`,
    { question_id: questionId, vote: isUpvote ? 1 : 0 },
  );
}

function boostUpvotes(meetingSlug, questionId) {
  return apiRequest(
    'PUT',
    `${BASENAME}/${meetingSlug}/questions/boost-upvotes`,
    { question_id: questionId },
  );
}

function acceptResponse(meetingSlug, questionId) {
  return apiRequest(
    'PUT',
    `${BASENAME}/${meetingSlug}/questions/accept-response`,
    { question_id: questionId },
  );
}

function rejectResponse(meetingSlug, questionId) {
  return apiRequest(
    'PUT',
    `${BASENAME}/${meetingSlug}/questions/reject-response`,
    { question_id: questionId },
  );
}

export default {
  answer: answerQuestion,
  create: createQuestion,
  dismiss: dismissQuestion,
  getList: getQuestionsList,
  withdraw: withdrawQuestion,
  delete: deleteQuestion,
  vote: voteQuestion,
  boostUpvotes,
  acceptResponse,
  rejectResponse,
};
