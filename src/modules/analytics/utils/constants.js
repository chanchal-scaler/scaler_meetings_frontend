const DEFAULT_MIXPANEL_TOKEN = '016bedb7f56f1c1e2ed8df69b452e178';

export const getMixPanelToken = () => {
  if (window.ENV_VARS?.mode === 'production') {
    return process.env.MIXPANEL_TOKEN_PRODUCTION;
  } else if (window.ENV_VARS?.mode === 'staging') {
    return process.env.MIXPANEL_TOKEN_STAGING;
  } else {
    return process.env.MIXPANEL_TOKEN_DEVELOPMENT || DEFAULT_MIXPANEL_TOKEN;
  }
};

export const DEFINED_USER_TRAITS = {
  userID: 'userId',
  traits: 'traits',
};
