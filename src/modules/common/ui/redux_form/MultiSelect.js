import React, { useCallback, useEffect, useState } from 'react';

import { Select } from '@common/ui/form';

function MultiSelect({
  name,
  value: values,
  isCreateable,
  isAsync,
  placeholder,
  loadOptions,
  popoverProps,
  onChange,
  classNamePrefix,
  options,
  uniqValueKey,
  newOptionCreator,
  ...remainingProps
}) {
  const [selected, setSelected] = useState(values);

  useEffect(() => {
    setSelected(values);
  }, [values]);


  const handleSelectChange = useCallback(event => {
    const { value } = event.target;
    const targetValues = { value };
    // eslint-disable-next-line
    onChange && onChange({ target: targetValues });
  }, [onChange]);

  return (
    <Select
      name={name}
      onChange={handleSelectChange}
      placeholder={placeholder}
      popoverProps={popoverProps}
      value={selected}
      isMulti
      isCreateable={isCreateable}
      isAsync={isAsync}
      loadOptions={loadOptions}
      options={options}
      classNamePrefix={classNamePrefix}
      uniqValueKey={uniqValueKey}
      newOptionCreator={newOptionCreator}
      {...remainingProps}
    />
  );
}

export default MultiSelect;
