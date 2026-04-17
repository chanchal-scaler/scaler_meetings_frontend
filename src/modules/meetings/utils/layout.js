export const LayoutModes = {
  // App is rendered as portrait widgetSmall
  portrait: 'portrait',
  // App is rendered as a standalone SPA
  standalone: 'standalone',
  // App is rendered as a widget in landscape mode in a relatively small space
  widgetSmall: 'widgetSmall',
  // App is rendered as a widget in landscape mode in a relatively large space
  widgetLarge: 'widgetLarge',
  // App is rendered for webpage recording through agora
  recording: 'recording',
};

export const WIDGET_LAYOUT_MODES = [
  LayoutModes.widgetSmall,
  LayoutModes.widgetLarge,
  LayoutModes.portrait,
];

// Layout modes that don't allow screen maximised layout i.e, modes that don't
// allow placing host video above chat
export const FIXED_SCREEN_LAYOUT_MODES = [
  LayoutModes.widgetSmall, LayoutModes.recording,
];

export function isWidget(mode) {
  return WIDGET_LAYOUT_MODES.includes(mode);
}

export const SCREEN_ORIENTATIONS = {
  PORTRAIT: 'portrait',
  LANDSCAPE: 'landscape',
};
