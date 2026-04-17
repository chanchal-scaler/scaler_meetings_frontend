import React from 'react';

import useMediaQuery from '@common/hooks/useMediaQuery';

function responsive(BaseComponent) {
  return (props) => {
    const { mobile } = useMediaQuery();
    return <BaseComponent isMobile={mobile} {...props} />;
  };
}

export default responsive;
