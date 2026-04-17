export const BROADCAST_ROLES = ['host', 'super_host'];

export const BroadcastSetupModes = {
  /**
   * When hosts/super hosts are about to join but have not yet granted
   * permission to camera/microphone.
   */
  host: 'host',
  /**
   * When audience requests host to unmute him.
   */
  audience: 'audience',
};

export const ROLE_HIERARCHY = ['audience', 'host', 'super_host'];

export function getRoleLevel(role) {
  return ROLE_HIERARCHY.indexOf(role);
}
