export const DEFAULT_CHOICE = {
  answer: '',
  is_correct_answer: false,
};

export const DEFAULT_CHOICES = [{
  answer: '',
  is_correct_answer: false,
}, {
  answer: '',
  is_correct_answer: false,
}];

export const DEFAULT_DURATION = 30; // In sec

export const MIN_DESCRIPTION_LENGTH = 5;

export const MAX_DESCRIPTION_LENGTH = 256;

export const MIN_CHOICE_LENGTH = 1;

export const MAX_CHOICE_LENGTH = 96;

export const ALLOWED_DURATIONS = [20, 30, 45, 60, 90, 120];

export const QUIZZES_PER_PAGE = 25;

export const DEBOUNCE_DURATION = 369;

export const ActionTypes = {
  FILTER_BY_INSTRUCTOR: 'mq-filter-instructor',
  FILTER_BY_TOPIC: 'mq-filter-topic',
  FILTER_BY_SEARCH: 'mq-filter-by-search',
  BOOKMARK_PROBLEM: 'mq-marked',
  CREATE_NEW_PROBLEM: 'mq-new-problem-created',
  USE_OLD_PROBLEM: 'mq-old-problem-used',
};

export const DUMMY_QUIZ = {
  id: -1,
  name: 'Dummy Quiz',
  duration: 30,
  problem: {
    id: -1,
    description: 'Which of the following is same as 5^4?',
    choices: [{
      answer: '125 * 4',
    }, {
      answer: '25 * 25',
      is_correct_answer: true,
    }, {
      answer: '25^3',
    }, {
      answer: '4^5',
    }],
  },
};

export function containsSpecialCharacters(text) {
  return /[\u{10000}-\u{10FFFF}]/u
    .test(text);
}

export function isChoiceValid(choice) {
  const value = choice.trim();
  return (
    value.length >= MIN_CHOICE_LENGTH
    && value.length <= MAX_CHOICE_LENGTH
  );
}

export function isDescriptionValid(description) {
  const value = description.trim();
  return (
    value.length >= MIN_DESCRIPTION_LENGTH
    && value.length <= MAX_DESCRIPTION_LENGTH
  );
}

// We know that there will be exactly one problem per quiz
export function transformQuizData(quiz, allProblems,
  performanceTimerEnabled = true) {
  const { problems, ...newQuiz } = quiz;
  newQuiz.problem = allProblems[problems[0]];
  newQuiz.performanceTimerEnabled = performanceTimerEnabled;
  return newQuiz;
}
