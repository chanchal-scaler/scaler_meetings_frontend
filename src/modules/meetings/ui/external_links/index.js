import React from 'react';

import { mobxify } from '~meetings/ui/hoc';

function ExternalLinks({ meetingStore: store }) {
  const { meeting } = store;
  const { links } = meeting.resources.external_link;

  return (
    <div className="m-v-10 m-external-links">
      {links.map((link, index) => (
        <a
          className="m-external-links__item"
          key={index}
          href={link.value}
          target="_blank"
          rel="noopener noreferrer"
        >
          {link.title}
        </a>
      ))}
    </div>
  );
}

export default mobxify('meetingStore')(ExternalLinks);
