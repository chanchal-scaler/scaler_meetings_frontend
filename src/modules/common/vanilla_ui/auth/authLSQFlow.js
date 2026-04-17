import AuthFlow from './authFlow';
import { apiRequest, generateJWT } from '@common/api/utils';

class AuthLsqFlow extends AuthFlow {
  constructor(
    id,
    allowedTriggers = {},
    waitTime = 3000,
    mode = 'register',
    autoInitialize = true,
    lsqAccountName = 'academy',
  ) {
    super(id, waitTime, mode, autoInitialize);
    this._allowedTriggers = allowedTriggers;
    this._lsqAccountName = lsqAccountName;
  }

  /**
   * Override complete to send LSQ activity before completing flow
   */
  async complete() {
    const triggeredFrom = this.triggerFrom;

    const activity = this._allowedTriggers[triggeredFrom];
    if (activity) {
      try {
        const token = await generateJWT();
        if (!token) throw new Error('Failed to generate JWT');
        await this._saveLsqActivity(activity, token);
      } catch (error) {
        // do nothing
      }
    }
    super.complete();
  }

  /**
   * Send LSQ activity to backend API
   * @param {Object} activity - Payload for LSQ activity
   * @param {string} token - JWT token
   */
  async _saveLsqActivity(activity, token) {
    await apiRequest(
      'POST',
      '/api/v3/lsq-events/send-activity/',
      { ...activity, account_name: this._lsqAccountName },
      { headers: { 'X-user-token': token } },
    );
  }
}

export default AuthLsqFlow;
