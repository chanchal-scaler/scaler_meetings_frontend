function TabPluginsButtonRenderer({ plugins }) {
  return plugins.map((plugin) => plugin.renderButton());
}

export default TabPluginsButtonRenderer;
