import React from 'react';
import { useNavigate } from 'react-router-dom';

function withBackNavigation(BaseComponent) {
  return function (props) {
    const navigate = useNavigate();

    function goBack(defaultBack) {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate(defaultBack, { replace: true });
      }
    }

    return (
      <BaseComponent
        goBack={goBack}
        {...props}
      />
    );
  };
}

export default withBackNavigation;
