import React, { useCallback } from 'react';

import { Field } from '@common/ui/form';
import {
  Icon, RadioButton, RadioGroup, Tooltip,
} from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import {
  screenQualityHintsMap,
  screenQualityLabelsMap,
  ScreenShareQuality,
} from '~meetings/utils/media';

function ScreenShareSettings({
  className,
  mediaStore: store,
  ...remainingProps
}) {
  const handleChange = useCallback((event) => {
    store.setRecommendedScreenQuality(null);
    store.setScreenQuality(event.target.value);
  }, [store]);

  function optionUi(quality) {
    return (
      <span className="row flex-ac">
        <span className="m-r-5">
          {screenQualityLabelsMap[quality]}
        </span>
        <Tooltip
          className="hint"
          component={Icon}
          name="info"
          title={screenQualityHintsMap[quality]}
        />
      </span>
    );
  }

  return (
    <Field
      label="I will be sharing"
      hint="Setting will be applied on next screen share."
      {...remainingProps}
    >
      <RadioGroup
        name="screenQuality"
        onChange={handleChange}
        value={store.screenQuality}
      >
        {Object.values(ScreenShareQuality).map((quality) => (
          <RadioButton
            key={quality}
            name={quality}
            text={optionUi(quality)}
          />
        ))}
      </RadioGroup>
    </Field>
  );
}

export default mobxify('mediaStore')(ScreenShareSettings);
