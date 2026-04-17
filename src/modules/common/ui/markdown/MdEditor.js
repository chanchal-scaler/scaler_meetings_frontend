import React, { useCallback, useState } from 'react';
import ReactMde from 'react-mde';
import { mdToHtml } from './mdToHtml';
import 'react-mde/lib/styles/css/react-mde-all.css';

function MdEdtior({
  name,
  onChange,
  ...remainingProps
}) {
  const [selectedTab, setSelectedTab] = useState('write');
  const handleChange = useCallback((value) => {
    onChange({ target: { name, value } });
  }, [name, onChange]);
  return (
    <ReactMde
      selectedTab={selectedTab}
      onChange={handleChange}
      onTabChange={setSelectedTab}
      generateMarkdownPreview={
        markdown => Promise.resolve(mdToHtml(markdown))
      }
      {...remainingProps}
    />
  );
}

export default MdEdtior;
