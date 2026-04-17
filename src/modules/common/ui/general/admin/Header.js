import React, { Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { BackButton } from '@common/ui/general';

function Header({
  actions = [],
  backTo,
  title,
  root,
}) {
  function backUi() {
    if (backTo) {
      return (
        <div className="admin-header__actions admin-header__actions--left">
          <BackButton
            backTo={backTo}
            className="m-r-5"
          />
        </div>
      );
    } else {
      return null;
    }
  }

  function actionUi(action) {
    const propsToInject = {
      className: classNames(
        'm-l-5',
        { [action.props.className]: action.props.className },
      ),
    };

    return cloneElement(action, propsToInject);
  }

  function actionsUi() {
    if (actions.length > 0) {
      return (
        <div className="admin-header__actions admin-header__actions--right">
          {Children.map(actions, actionUi)}
        </div>
      );
    }
    return null;
  }

  function rootLink() {
    if (root) {
      return (
        <a href={root.url} className="admin-header__root">
          {`${root.name} |`}
        </a>
      );
    }

    return null;
  }

  return (
    <div className="layout__header admin-header">
      {backUi()}
      {rootLink()}
      <div className="admin-header__title">
        {title}
      </div>
      {actionsUi()}
    </div>
  );
}

Header.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.node).isRequired,
  backTo: PropTypes.string,
  title: PropTypes.node.isRequired,
  root: PropTypes.shape({
    url: PropTypes.string,
    name: PropTypes.string,
  }),
};

export default Header;
