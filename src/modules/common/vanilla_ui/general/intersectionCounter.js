const getDecimalPlaces = (num) => {
  const parts = num.toString().split('.');
  return parts.length > 1 ? parts[1].length : 0;
};

const initializeCounterAnimation = () => {
  const counters = document.querySelectorAll('.stats-animation');
  const animationDuration = 2000;
  const updateInterval = 10;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const counterElement = entry.target;

        if (entry.isIntersecting && !counterElement.dataset.animated) {
          counterElement.dataset.animated = 'true';

          const targetValue = parseFloat(
            counterElement.getAttribute('data-target'),
          );

          if (Number.isNaN(targetValue)) return;

          const decimalPlaces = getDecimalPlaces(targetValue);
          const increment = targetValue / (animationDuration / updateInterval);

          let currentValue = 0;

          const updateCount = () => {
            currentValue += increment;
            if (currentValue < targetValue) {
              counterElement.innerText = currentValue.toFixed(decimalPlaces);
              setTimeout(updateCount, updateInterval);
            } else {
              counterElement.innerText = targetValue.toFixed(decimalPlaces);
              observer.unobserve(counterElement);
            }
          };
          updateCount();
        }
      });
    },
    { threshold: 1 },
  );

  counters.forEach((counter) => observer.observe(counter));
};

export default { initialize: initializeCounterAnimation };
