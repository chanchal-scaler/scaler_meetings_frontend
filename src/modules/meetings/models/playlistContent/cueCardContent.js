import { computed, makeObservable } from 'mobx';

import BaseContent from './baseContent';

class CueCardContent extends BaseContent {
  constructor(...args) {
    super(...args);
    makeObservable(this, {
      mdString: computed,
    });
  }

  get mdString() {
    return this.contentData?.content;
  }

  get subType() {
    return this.data.sub_content_type;
  }

  get isDoubtCard() {
    return this.subType === 'doubt_resolution';
  }
}

export default CueCardContent;
