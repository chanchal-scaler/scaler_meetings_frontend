/* eslint-disable */

/*
 * @param channel -> the name of the channel you want to subscribe to
 * @param channelParams -> parameters based on which you want to subscribe to the channel
 * @param { onConnect, onDisconnect, onReceive } default call backs for action cable
 * @param customHandlers , you can add you own key function pair for channel
 * */

/*
* Eg 1 -> useActionCable('HelpRequestChannel', {user_id: 1, help_request_id: 2}, {onReceive: () => {do something}})
* output -> subscribes HelpRequestChannel channels based on user_id and help_request_id, and executes onReceive if triggered
* Eg 2 -> useActionCable('HelpRequestChannel', {user_id: 1, help_request_id: 2}, {}, {sendSignal: (payload) => { do something }}})
* output -> subscribes HelpRequestChannel channels based on user_id and help_request_id,
* and has a function sendSignal available on the channel returned by subscribe
* */

function useActionCable(channel, channelParams, { onConnect, onDisconnect, onReceive }, customHandlers={}) {
  const subscribe = () => {
    if (App.cable) {
      App[channel] = App.cable.subscriptions.create({
        channel: channel,
        ...channelParams
      }, {
        connected: function () {
          if (onConnect !== undefined) {
            onConnect();
          }
        },
        disconnected: function () {
          if (onDisconnect !== undefined) {
            onDisconnect();
          }
        },
        received: function (payload) {
          if (onReceive !== undefined) {
            onReceive(payload);
          }
        },
        ...customHandlers
      });

      return App[channel];
    }
  };

  const unsubscribe = () => {
    App[channel].unsubscribe();
    delete App[channel];
  };

  return {
    subscribe,
    unsubscribe,
  };
}

export default useActionCable;