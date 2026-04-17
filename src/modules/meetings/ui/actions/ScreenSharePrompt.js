import React, { useCallback } from 'react';
import classNames from 'classnames';

import { Field } from '@common/ui/form';
import { mobxify } from '~meetings/ui/hoc';
import {
  RadioButton, RadioGroup,
} from '@common/ui/general';
import {
  isHighCostScreenShare,
  screenQualityHintsMap,
  screenQualityLabelsMap,
  ScreenShareQuality,
} from '~meetings/utils/media';
import alertRound from '~meetings/images/alert-round-yellow.svg';

function ScreenSharePrompt({
  className,
  mediaStore: store,
  additionalContent,
  ...remainingProps
}) {
  const handleChange = useCallback((event) => {
    store.setRecommendedScreenQuality(null);
    store.setScreenQuality(event.target.value);
  }, [store]);

  const isHighCostScreenShareSelected = (selectedQuality) => (
    isHighCostScreenShare(store.screenQuality)
      && store.screenQuality === selectedQuality
  );

  function optionUi(quality) {
    return (
      <span>
        <span className="normal m-r-5">
          {screenQualityLabelsMap[quality]}
        </span>
        <span className="normal hint">
          (
          {screenQualityHintsMap[quality]}
          )
        </span>
        {isHighCostScreenShareSelected(quality)
          ? (
            <div className="normal m-screen-share-prompt__hq-warning">
              <img alt="alert" className="m-r-5" src={alertRound} />
              Please use this feature responsibly, enabling this will result
              in 2x of the cost of the call from our platform partner.
              <br />
              {' '}
              We recommend using low quality setting for this class.
            </div>
          )
          : null}
      </span>
    );
  }

  function HintUI() {
    return (
      <>
        <div>
          The chosen setting will be applied to your screen share session.
        </div>
        {additionalContent && (
          <div>
            {additionalContent}
          </div>
        )}
      </>
    );
  }

  return (
    <Field
      label="Select the Right Setting for Screen Sharing"
      hint={<HintUI />}
      {...remainingProps}
    >
      <RadioGroup
        name="screenQuality"
        onChange={handleChange}
        value={store.screenQuality}
      >
        {Object.values(ScreenShareQuality).map((quality) => (
          <RadioButton
            textClassName={
              classNames(
                {
                  'm-screen-share-prompt__radio-text':
                    isHighCostScreenShareSelected(quality),
                },
              )
            }
            key={quality}
            name={quality}
            text={optionUi(quality)}
          />
        ))}
      </RadioGroup>
    </Field>
  );
}

export default mobxify('mediaStore')(ScreenSharePrompt);
