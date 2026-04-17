export const MessagingConnectionStates = {
  connecting: 'connecting',
  connected: 'connected',
  /**
   * The client has not yet logged in or manually logged out of chat server.
   */
  disconnected: 'disconnected',
  reconnecting: 'reconnecting',
  /**
   * The token used to login is invalid or expired
   */
  unauthorised: 'unauthorised',
  /**
   * Connection request was received by server and token was validated but
   * still the server chooses to not accept the connection. Possible reasons
   * can be users has another active connection from some other device
   */
  rejected: 'rejected',
  /**
   * Client failed to connect to server probably network issue
   */
  failed: 'failed',
};

export const MessagingErrorStates = [
  MessagingConnectionStates.unauthorised,
  MessagingConnectionStates.rejected,
  MessagingConnectionStates.failed,
];
