function AdiosPluginsRenderer({ plugins }) {
  return plugins.map((plugin) => plugin.render());
}

export default AdiosPluginsRenderer;
