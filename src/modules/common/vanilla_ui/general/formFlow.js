import forOwn from 'lodash/forOwn';

import { isNullOrUndefined } from '@common/utils/type';
import { scrollToElement } from '@common/utils/dom';
import EventEmitter from '@common/lib/eventEmitter';
import Modal from './modal';
import { notifyWebview } from '@common/utils/webview';
import {
  setAttribution,
} from '@common/vanilla_ui/tracking/attribution';

export const FlowTypes = {
  /**
   * Indicates that all the forms related to this flow are rendered in the
   * page itself.
   */
  page: 'page',
  /**
   * Indicates that all the forms related to this flow are rendered in a
   * modal itself.
   */
  modal: 'modal',
  /**
   * Indicates that all the forms related to this flow are rendered in a
   * an external app.
   */
  app: 'app',
};

const flowModeActiveClass = 'form-flow__mode--active';

class FormFlow extends EventEmitter {
  constructor(name, id, type, defaultMode, persistent = false) {
    super();
    this._name = name;
    this._id = id;
    this._type = type;
    this._defaultMode = defaultMode;
    this._persistent = persistent;

    this._modeEls = {};
    this._forms = {};
    this._formHandlers = {};
    this._getReferences();
  }

  /**
   * Call this when you think that the flow is completed
   */
  complete() {
    if (isNullOrUndefined(this._proceedTo)) {
      window.location.replace(window.location.pathname);
    } else {
      window.location.href = this._proceedTo;
    }
    this.emit('complete');
  }

  getForm(mode) {
    return this._forms[mode];
  }

  /**
   * Call this to initialize the flow
   */
  initialize() {
    this._initialize();
    this._handleQueryParams();
    this.emit('init');
  }

  setFormHandler(mode, handler) {
    this._formHandlers[mode] = handler;
  }

  startFlow(mode, proceedTo, triggerFrom) {
    this.emit('starting');
    this._proceedTo = proceedTo;
    this._triggerFrom = triggerFrom;
    this.switchMode(mode);
    const webViewEvent = this._modeEls[mode].getAttribute('data-webview-event');

    switch (this.type) {
      case FlowTypes.page:
        scrollToElement(this._el);
        break;
      case FlowTypes.modal:
        Modal.open(this.id, this._persistent);
        break;
      case FlowTypes.app:
        notifyWebview(webViewEvent).then();
        break;
      default:
      // Do nothing
    }
    this.emit('started');
  }

  switchMode(_mode) {
    this.emit('mode-switch');
    const mode = _mode || this._defaultMode;
    forOwn(this._modeEls, (el) => {
      el.classList.remove(flowModeActiveClass);
    });
    this._modeEls[mode].classList.add(flowModeActiveClass);
    this._mode = _mode;
    this.emit('mode-switched');
  }

  get formHandlers() {
    return this._formHandlers;
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get type() {
    return this._type;
  }

  get mode() {
    return this._mode || this._defaultMode;
  }

  get triggerFrom() {
    return this._triggerFrom || '';
  }

  /* Private */

  _getReferences() {
    this._el = document.getElementById(this.id);
    this._getModeReferences();
    this._getSwitchReferences();
    this._getTriggerReferences();
  }

  _getModeReferences() {
    const modeEls = this._el.getElementsByClassName('form-flow__mode');
    Array.from(modeEls).forEach((el) => {
      const mode = el.getAttribute('data-mode');
      this._modeEls[mode] = el;
    });
  }

  _getSwitchReferences() {
    const switchEls = this._el.querySelectorAll('[data-action="flow-switch"]');
    this._switchEls = Array.from(switchEls);
  }

  _getTriggerReferences() {
    const triggerEls = document.querySelectorAll(
      `[data-action="flow-trigger"][data-target="${this.name}"]`,
    );
    this._triggerEls = Array.from(triggerEls);
  }

  _handleQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const flow = params.get('flow');
    const name = params.get('name');
    if (flow === '1' && name === this.name) {
      const mode = params.get('mode');
      const proceedTo = params.get('proceed');
      this.startFlow(mode, proceedTo);
    }
  }

  _initialize() {
    this._initializeForms();
    this._initializeSwitches();
    this._initializeTriggers();
  }

  _initializeForms() {
    forOwn(this._modeEls, (el, mode) => {
      const formEl = el.querySelector('.form');
      this._forms[mode] = this.formHandlers[mode](formEl);
    });
  }

  _initializeSwitches() {
    this._switchEls.forEach(switchEl => {
      switchEl.addEventListener('click', () => {
        const mode = switchEl.getAttribute('data-target');
        this.switchMode(mode);
      });
    });
  }

  _initializeTriggers() {
    this._triggerEls.forEach(triggerEl => {
      triggerEl.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const mode = triggerEl.getAttribute('data-mode');
        const proceedTo = triggerEl.getAttribute('data-proceed');
        const triggerFrom = triggerEl.getAttribute('data-trigger-from');
        const commonTrackingContext = {
          leadIp: triggerEl.getAttribute('data-lead-ip'),
          leadSource: triggerEl.getAttribute('data-lead-source'),
          leadSection: triggerEl.getAttribute('data-lead-section'),
        };
        this.startFlow(mode, proceedTo, triggerFrom);
        this._commonTrackingContext = commonTrackingContext;
        const intent = triggerEl.getAttribute('data-intent');
        if (intent) {
          setAttribution(intent);
        }
      });
    });
  }
}

export default FormFlow;
