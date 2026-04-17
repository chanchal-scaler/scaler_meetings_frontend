export function getEnvironmentId() {
  return (
    window.ENV_VARS
    && window.ENV_VARS.application
    && window.ENV_VARS.application.env_id
  );
}

export function getEnvironmentMode() {
  return (
    window.ENV_VARS
    && window.ENV_VARS.mode
  );
}

export function isScaler() {
  return getEnvironmentId() === 'scaler';
}

export function isInterviewbit() {
  return getEnvironmentId() === 'interviewbit';
}

export function isProduction() {
  return getEnvironmentMode() === 'production';
}

export function isStaging() {
  return getEnvironmentMode() === 'staging';
}

export function isDevelopment() {
  return getEnvironmentMode() === 'development';
}
