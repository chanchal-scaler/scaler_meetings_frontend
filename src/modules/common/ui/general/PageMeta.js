import React from 'react';
import { Helmet } from 'react-helmet';

const siteName = 'Scaler Academy';
const ogProperties = ['site_name', 'title', 'description', 'image', 'url'];

function PageMeta(metaProps) {
  const meta = {
    site_name: siteName,
    ...metaProps,
  };

  function titleTag() {
    const { renderRawTitle } = meta;

    if (renderRawTitle) {
      return (
        <title>
          {meta.title}
        </title>
      );
    } else if (meta.title) {
      return (
        <title>
          {meta.title}
          {' '}
          |
          {' '}
          {meta.site_name}
        </title>
      );
    } else {
      return null;
    }
  }

  function descriptionTag() {
    if (meta.description) {
      return <meta name="description" content={meta.description} />;
    } else {
      return null;
    }
  }

  function ogTags() {
    return ogProperties.map((property, index) => {
      if (meta[property]) {
        return (
          <meta
            key={index}
            property={`og:${property}`}
            content={meta[property]}
          />
        );
      } else {
        return null;
      }
    });
  }

  function canonicalTag() {
    if (meta.canonical) {
      return <link rel="canonical" href={meta.canonical} />;
    } else {
      return null;
    }
  }

  function otherTags() {
    if (meta.otherTags) {
      return meta.otherTags.map((tag) => (
        <meta key={tag.name} name={tag.name} content={tag.content} />
      ));
    }

    return null;
  }

  return (
    <Helmet>
      {titleTag()}
      {descriptionTag()}
      {canonicalTag()}
      {ogTags()}
      {otherTags()}
    </Helmet>
  );
}

export default PageMeta;
