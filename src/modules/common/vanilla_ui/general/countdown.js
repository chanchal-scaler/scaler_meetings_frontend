const countdownsMap = {};

function getTimeUnit({
  value,
  smallText,
  largeText,
  onWordText,
  textLength,
}) {
  if (textLength === 'oneWord') {
    return onWordText;
  } else if (textLength === 'small') {
    return Math.abs(value) > 1 ? smallText[0] : smallText[1];
  } else {
    return Math.abs(value) > 1 ? largeText[0] : largeText[1];
  }
}

export function parseDateString(dateString) {
  const fragments = dateString.split(' ');
  const [year, month, date] = fragments[0].split('-');
  const [hours, minutes, seconds] = fragments[1].split(':');
  const parsedDate = new Date();
  parsedDate.setUTCFullYear(year);
  parsedDate.setUTCMonth(parseInt(month, 10) - 1, date);
  parsedDate.setUTCHours(hours);
  parsedDate.setUTCMinutes(minutes);
  parsedDate.setUTCSeconds(seconds);
  return parsedDate;
}

function createNode(baseName, componentKey, timerDigitClassName) {
  const node = document.createElement('div');
  node.classList.add(`${baseName}__component`);
  node.classList.add(`${baseName}__component--${componentKey}`);
  node.classList.add(timerDigitClassName);
  node.setAttribute(`data-${baseName}-key`, componentKey);
  return node;
}

const timeComponents = [
  {
    unit: 1000,
    key: 'second',
    render: (value, textLength) => getTimeUnit({
      value,
      smallText: ['Sec', 'Sec'],
      largeText: ['Seconds', 'Second'],
      onWordText: ['s'],
      textLength,
    }),
  },
  {
    unit: 60 * 1000,
    key: 'minute',
    render: (value, textLength) => getTimeUnit({
      value,
      smallText: ['Mins', 'Min'],
      largeText: ['Minutes', 'Minute'],
      onWordText: ['m'],
      textLength,
    }),
  },
  {
    unit: 60 * 60 * 1000,
    key: 'hour',
    render: (value, textLength) => getTimeUnit({
      value,
      smallText: ['Hrs', 'Hr'],
      largeText: ['Hours', 'Hour'],
      onWordText: ['h'],
      textLength,
    }),
  },
  {
    unit: 24 * 60 * 60 * 1000,
    key: 'day',
    render: (value, textLength) => getTimeUnit({
      value,
      smallText: ['Days', 'Day'],
      largeText: ['Days', 'Day'],
      onWordText: ['d'],
      textLength,
    }),
  },
];

class CountDownTimer {
  constructor(node) {
    this._baseName = 'count-down';

    this.node = node;

    this.time = parseDateString(node.getAttribute('data-target'));
    this.variant = node.getAttribute('data-variant');
    this.timerDigitClassName = node.getAttribute('date-timer-digit-class');
    this.isLarge = this.variant === 'large';

    this.targetTimeComponents = node.getAttribute('data-timer-components')
      .split(' ');
    this._components = timeComponents.filter(
      component => this.targetTimeComponents.indexOf(component.key) > -1,
    );

    // Sort the components
    this._components.sort((a, b) => b.unit - a.unit);

    // Get rid of any extra content
    this.node.innerHTML = '';
    this.node.classList.add(
      this._baseName,
      `${this._baseName}--${this.variant}`,
    );

    // Create Hour, Minute, Seconds Children
    this.createChildren();

    this.startTimer();
    this.renderComponents();
  }

  createChildren() {
    this._components.forEach((component) => {
      this.node.appendChild(
        createNode(this._baseName, component.key, this.timerDigitClassName),
      );
    });
  }

  startTimer() {
    const lowestUnit = this._components[this._components.length - 1].unit;
    this._interval = setInterval(() => {
      this.renderComponents();
    }, lowestUnit);
  }

  renderComponents() {
    const components = this._calculateTimeDiff();
    const componentKeys = Object.keys(components);

    componentKeys.forEach((componentKey) => {
      const domElem = this.node.querySelector(
        `[data-count-down-key=${componentKey}]`,
      );

      if (!domElem) { return; }

      const componentValue = components[componentKey];
      const componentTextRenderer = timeComponents
        .find(component => component.key === componentKey)
        .render;

      domElem.setAttribute('data-value', componentValue);

      // Somewhat hacky, should have used document.createElement
      domElem.innerHTML = `
        <span class="${this._baseName}__number">
          ${componentValue.toString().padStart(2, '0')}
        </span>
      `;

      if (this.variant === 'small-with-one-word') {
        domElem.innerHTML += `
          <span class="${this._baseName}__text">
            ${componentTextRenderer(componentValue, 'oneWord')}
          </span>
        `;
        if (componentKey !== 'second') {
          domElem.innerHTML += `
            <span class="${this._baseName}__sep"> : </span>
          `;
        }
      } else if (this.variant === 'extra-small') {
        if (componentKey !== 'second') {
          domElem.innerHTML += `
            <span class="${this._baseName}__sep"> : </span>
          `;
        }
      } else if (this.variant === 'oneWord') {
        domElem.innerHTML += `
          <span class="${this._baseName}__text">
            ${componentTextRenderer(componentValue, 'oneWord')}
          </span>
        `;
      } else if (this.isLarge) {
        domElem.innerHTML += `
          <span class="${this._baseName}__text show-in-mobile">
            ${componentTextRenderer(componentValue, 'small')}
          </span>
          <span class="${this._baseName}__text hide-in-mobile">
            ${componentTextRenderer(componentValue, 'large')}
          </span>
        `;
      } else {
        domElem.innerHTML += `
          <span class="${this._baseName}__text">
            ${componentTextRenderer(componentValue, 'small')}
          </span>
        `;
      }
    });
  }

  updateTimer(time) {
    clearInterval(this._interval);
    this.time = time;
    this.renderComponents();
    this.startTimer();
  }

  _calculateTimeDiff() {
    const currentTime = new Date();
    let timeDiff = this.time - currentTime;

    if (timeDiff < 0) {
      timeDiff = 0;
      clearInterval(this._interval);
    }

    const unitWiseDiff = {};

    this._components.forEach(({ key, unit }) => {
      unitWiseDiff[key] = Math.floor(timeDiff / unit);
      timeDiff -= unitWiseDiff[key] * unit;
    });

    return unitWiseDiff;
  }
}

function getCountdownInstance(id) {
  return countdownsMap[id];
}

function initialize() {
  const countDownTimerDivs = document.querySelectorAll(
    `[data-action='countdown']`,
  );

  countDownTimerDivs.forEach((node) => {
    const countdown = new CountDownTimer(node);
    if (node.id) {
      countdownsMap[node.id] = countdown;
    }
  });
}

export default {
  getInstance: getCountdownInstance,
  parseDateString,
  initialize,
};
