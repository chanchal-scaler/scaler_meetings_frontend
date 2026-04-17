import { isFunction } from '@common/utils/type';

const INVALID_SELECTOR = 'html selector provided is not a valid element in dom';
const INVALID_PERCENTAGE_NUMBER = `invalid percentage number provided,
 please provide an Integer value`;
const INVALID_CALLBACK_PROVIDED = 'Please provide callback as a function type';

function runArgumentsValidation({
  htmlSelectorToObserve,
  percentageToMonitor,
  callbackToTriggerOnByPassingScrollAmount,
  callbackToTriggerWhenScrollIsWithinScrollAmount,
}) {
  if (!document.querySelector(htmlSelectorToObserve)) {
    throw new Error(INVALID_SELECTOR);
  }
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(percentageToMonitor) || percentageToMonitor > 100) {
    throw new Error(INVALID_PERCENTAGE_NUMBER);
  }

  if (
    !isFunction(callbackToTriggerOnByPassingScrollAmount)
    || !isFunction(callbackToTriggerWhenScrollIsWithinScrollAmount)
  ) {
    throw new Error(INVALID_CALLBACK_PROVIDED);
  }
}

/**
 *
 * @param {htmlSelectorToObserve}
 * 'This is the DOM selector that you need to pass'
 * 'On this DOM selector your scroll event will be observed'
 * Now e.target.scrollTop gives how much scroll has been displaced
 * and e.target.scrollHeight gives how much scroll area is available to scroll
 * vertically
 * e.target.scrollTop will never be equal to e.target.scrollHeight as scrollbar
 * has its own height also
 */

function scrollObserver({
  htmlSelectorToObserve,
  percentageToMonitor,
  callbackToTriggerOnByPassingScrollAmount = () => {},
  callbackToTriggerWhenScrollIsWithinScrollAmount = () => {},
}) {
  try {
    runArgumentsValidation({
      htmlSelectorToObserve,
      percentageToMonitor,
      callbackToTriggerOnByPassingScrollAmount,
      callbackToTriggerWhenScrollIsWithinScrollAmount,
    });
    document.querySelector(htmlSelectorToObserve).addEventListener(
      'scroll', (e) => {
        const amountOfScrollingDoneTillNowFromTop = e.target.scrollTop;
        const amountOfScrollingAvailableToScroll = e.target.scrollHeight;

        /* gives you the percentage amount of scrolling done vertically */
        const percentage = ((amountOfScrollingDoneTillNowFromTop
          / amountOfScrollingAvailableToScroll) * 100).toFixed(2);

        const _percentageToMonitor = parseInt(percentageToMonitor, 10);

        if (percentage < _percentageToMonitor) {
          callbackToTriggerWhenScrollIsWithinScrollAmount();
          /* if you need to trigger a function when your scrolling amount
          is less than what your target percentage
          then can provide a callback function */
        }
        if (percentage >= _percentageToMonitor) {
          callbackToTriggerOnByPassingScrollAmount();
          /* if you need to trigger a function after your scrolling amount
          bypasses your target percentage,
          then can provide a callback function */
        }
      },
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
}

export default {
  initialize: scrollObserver,
};
