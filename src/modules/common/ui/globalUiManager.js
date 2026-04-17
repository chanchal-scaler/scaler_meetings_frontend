import EventEmitter from '@common/lib/eventEmitter';

/* There's a need to push events across different bundled apps.
*  eg -> from ibpp vanilla app to interviewbit react app and vice versa
*/
const globalUiManager = window.globalUiManager || new EventEmitter();
window.globalUiManager ||= globalUiManager;

Object.seal(globalUiManager);

export default globalUiManager;
