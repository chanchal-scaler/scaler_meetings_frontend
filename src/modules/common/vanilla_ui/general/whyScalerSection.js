import { isMobile } from '@common/utils/responsive';

const initialize = () => {
  const whyScalerSection = document.getElementById('why-scaler-section');
  if (!whyScalerSection) return;
  if (!isMobile()) return;

  const grids = whyScalerSection.querySelectorAll(
    '.why-scaler-section__grid-card',
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('hover');
        } else {
          entry.target.classList.remove('hover');
        }
      });
    },
    { threshold: 0.75 },
  );

  grids?.forEach(card => observer.observe(card));
};

export default { initialize };
