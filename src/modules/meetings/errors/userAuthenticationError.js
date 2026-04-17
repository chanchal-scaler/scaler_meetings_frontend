class UserAuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UserAuthenticationError';
  }
}

export default UserAuthenticationError;
