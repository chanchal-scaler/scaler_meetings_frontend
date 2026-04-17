import { readFileSync, writeFileSync, mkdirSync, createReadStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

async function generateFont(selectionPath, outputWoffPath, fontFamily) {
  const { SVGIcons2SVGFontStream } = await import('svgicons2svgfont');
  const { default: svg2ttf } = await import('svg2ttf');
  const { default: ttf2woff } = await import('ttf2woff');

  const selection = JSON.parse(readFileSync(selectionPath, 'utf8'));
  const { icons, height = 1024, preferences } = selection;
  const emSize = preferences?.fontPref?.metrics?.emSize || 1024;

  const svgFontChunks = [];
  const fontStream = new SVGIcons2SVGFontStream({
    fontName: fontFamily,
    fontHeight: emSize,
    normalize: true,
    log: () => {},
  });

  await new Promise((resolve, reject) => {
    fontStream.on('data', (chunk) => svgFontChunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk));
    fontStream.on('end', resolve);
    fontStream.on('error', reject);

    for (const iconEntry of icons) {
      const { icon, properties } = iconEntry;
      const { paths, width = emSize, attrs = [] } = icon;
      const code = properties.code;
      const name = properties.name;

      const pathsStr = paths.map((p, i) => {
        const attr = attrs[i] || {};
        const fill = attr.fill || '';
        const fillAttr = fill ? ` fill="${fill}"` : '';
        return `<path d="${p}"${fillAttr}/>`;
      }).join('');

      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${emSize}" width="${width}" height="${emSize}">${pathsStr}</svg>`;

      const readable = new Readable();
      readable._read = () => {};
      readable.push(svgContent);
      readable.push(null);

      readable.metadata = {
        unicode: [String.fromCodePoint(code)],
        name,
      };

      fontStream.write(readable);
    }

    fontStream.end();
  });

  const svgFont = Buffer.concat(svgFontChunks).toString();
  const ttf = svg2ttf(svgFont, {});
  const woff = ttf2woff(ttf.buffer);

  mkdirSync(dirname(outputWoffPath), { recursive: true });
  writeFileSync(outputWoffPath, Buffer.from(woff.buffer));
  console.log(`Generated: ${outputWoffPath} (${icons.length} icons)`);
}

async function main() {
  await generateFont(
    join(rootDir, 'src/common/fonts/selection.json'),
    join(rootDir, 'src/common/fonts/sr-icons.woff'),
    'SR Icons',
  );

  await generateFont(
    join(rootDir, 'src/common/fonts/vector/selection.json'),
    join(rootDir, 'src/common/fonts/vector/v-icons.woff'),
    'v-icons',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
