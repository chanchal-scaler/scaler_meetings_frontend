const constructErrorMessage = (errorMessage) => `SocketError::${errorMessage}`;
class SocketError extends Error {
  constructor(errorMessage, socketObject) {
    super(constructErrorMessage(errorMessage));

    this.message = constructErrorMessage(errorMessage);
    this.socket = socketObject;
  }

  toJson() {
    return {
      socketStatus: this.socket?.status,
      connectionState: this.socket?.consumer?.connection?.webSocket?.readyState,
      currentTime: Date.now(),
      lastPinngedAt: new Date(
        this.socket?.consumer?.connection?.monitor?.pingedAt,
      ).getTime(),
      reconnectAttempts:
        this.socket?.consumer?.connection?.monitor?.reconnectAttempts,
    };
  }
}

export default SocketError;
