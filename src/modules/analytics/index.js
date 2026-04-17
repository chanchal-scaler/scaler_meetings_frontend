import Analytics from '~analytics/models/analytics';

export default function analyticsLib(opts = {}, callback) {
  return new Analytics({
    ...opts,
  }, callback);
}

// example usage:
// import analytics from '~analytics';
// import MixpanelPlugin from '~analytics/plugins/mixpanel';

// const analytics = new Analytics({
//   app: 'scaler',
//   plugins: [
//     new MixpanelPlugin({
//      token: 'YOUR_TOKEN', // optional
//     }),
//   ],
// });

// export default analytics;
