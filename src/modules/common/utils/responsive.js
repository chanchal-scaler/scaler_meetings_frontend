import { mobileWidth, tabletWidth } from '@common/utils/constants';

export function isMobile() {
  return window.innerWidth <= mobileWidth;
}

export function isTabletAndBelow() {
  return window.innerWidth <= tabletWidth;
}

export function isTabletAndAbove() {
  return window.innerWidth > mobileWidth;
}

export function isPortrait() {
  return window.innerHeight > window.innerWidth;
}

export function isLandscape() {
  return window.innerHeight < window.innerWidth;
}
