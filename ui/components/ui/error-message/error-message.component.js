import React from 'react';
import PropTypes from 'prop-types';
import { Icon, IconName, IconSize } from '../../component-library';
import { IconColor } from '../../../helpers/constants/design-system';

/**
 * @deprecated The `<ErrorMessage />` component has been deprecated in favor of the new `<BannerAlert>` component from the component-library.
 * Please update your code to use the new `<BannerAlert>` component instead, which can be found at ui/components/component-library/banner-alert/banner-alert.js.
 * You can find documentation for the new BannerAlert component in the MetaMask Storybook:
 * {@link https://metamask.github.io/metamask-storybook/?path=/docs/components-componentlibrary-banneralert--docs}
 * If you would like to help with the replacement of the old ErrorMessage component, please submit a pull request against this GitHub issue:
 * {@link https://github.com/MetaMask/metamask-extension/issues/20394}
 */

const ErrorMessage = (props, context) => {
  const { errorMessage, errorKey } = props;
  const error = errorKey ? context.t(errorKey) : errorMessage;

  return (
    <div className="error-message">
      <Icon
        className="error-message__icon"
        name={IconName.Warning}
        size={IconSize.Sm}
        color={IconColor.errorDefault}
        marginRight={2}
      />
      <div className="error-message__text">{error}</div>
    </div>
  );
};

ErrorMessage.propTypes = {
  /**
   * The text content for the error message
   */
  errorMessage: PropTypes.string,
  /**
   * The translate key for localization. Uses context.t(). Will override the error message
   */
  errorKey: PropTypes.string,
};

ErrorMessage.contextTypes = {
  t: PropTypes.func,
};

export default ErrorMessage;
