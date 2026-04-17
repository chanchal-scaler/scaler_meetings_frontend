function getElementType(Component, props) {
  // Get default props if available
  const { defaultProps = {} } = Component;
  // If there is an explicit as component
  if (props.as) return props.as;
  // Anchors
  if (props.href) return 'a';
  // default or fallback to div
  return defaultProps.as || 'div';
}

export default getElementType;
