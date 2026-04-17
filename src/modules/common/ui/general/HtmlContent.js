import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';

import ConvertHtmlToReact from './ConvertHtmlToReact';

function HtmlContent({
  html, className, containerClassName, ...remainingProps
}) {
  const ref = useRef();
  // Make all links inside this component open in a new tab
  useEffect(() => {
    if (ref.current) {
      const anchorEls = ref.current.getElementsByTagName('a');
      [...anchorEls].forEach(anchorEl => {
        anchorEl.setAttribute('target', '_blank');
      });
    }
  }, [html]);

  return (
    <div
      ref={ref}
      className={classNames(
        'html-content',
        { [className]: className },
      )}
    >
      <ConvertHtmlToReact
        className={classNames(
          'html-content__container',
          { [containerClassName]: containerClassName },
        )}
        html={html || ''}
        {...remainingProps}
      />
    </div>
  );
}

export default HtmlContent;
