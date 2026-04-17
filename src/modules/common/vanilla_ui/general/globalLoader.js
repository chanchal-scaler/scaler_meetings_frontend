import { fromTemplate } from '@common/utils/string';

const GlobalLoader = {
  _markup: `
  <div class="global-loader">
    <div class="global-loader__container">
      <div class="pulse">
        <span class="pulse__item"></span>
        <span class="pulse__item"></span>
      </div>
      <div class="global-loader__message">
        {{message}}
      </div>
    </div>
  </div>
  `,
  _loaderEl() {
    return document.querySelector('.global-loader');
  },
  isActive() {
    const loader = this._loaderEl();
    return Boolean(loader);
  },
  show(message) {
    if (this.isActive()) {
      const el = this._loaderEl();
      const messageEl = el.querySelector('.global-loader__message');
      messageEl.innerHTML = message;
    } else {
      const markup = fromTemplate(this._markup, { message });
      document.body.insertAdjacentHTML('beforeend', markup);
    }
  },
  hide() {
    if (!this.isActive()) return;

    const el = this._loaderEl();
    el.remove();
  },
};

export default GlobalLoader;
