import data from '@emoji-mart/data';
import { init, SearchIndex } from 'emoji-mart';
import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';
import hljs from 'highlight.js/lib/common';
import 'highlight.js/styles/vs.css';

import { DEFAULT_REMARKABLE_OPTIONS } from '@common/utils/remarkable';
import { EMOJI_SIZE } from '@common/ui/general/EmojiPicker';

init({ data });

export function isValidEmoji(emojiId) {
  if (!emojiId || !emojiId.trim()) return false;
  const possibleEmojis = SearchIndex.search(emojiId);
  return !!possibleEmojis?.find(emoji => emoji.id === emojiId);
}

function getEmojiNative(emojiId) {
  const results = SearchIndex.search(emojiId);
  const match = results?.find(e => e.id === emojiId);
  if (!match) return emojiId;
  const skin = match.skins?.[0];
  return skin?.native || emojiId;
}

async function loadKatex() {
  const katex = await import('./remarkableKatex');
  return katex.default;
}

function addEmojisPlugin(remarkable) {
// eslint-disable-next-line consistent-return
  remarkable.inline.ruler.push('emoji', (state, checkMode) => {
    const { pos, posMax, src } = state;
    if (src.charAt(pos) === ':') {
      const closePos = src.indexOf(':', pos + 1);
      /* istanbul ignore else */
      if (closePos <= posMax) {
        const emojiId = src.substring(pos + 1, closePos);
        /* istanbul ignore else */
        if (isValidEmoji(emojiId)) {
          /* istanbul ignore else */
          if (!checkMode) {
            state.push({
              type: 'emoji',
              content: emojiId,
              block: false,
              level: state.level,
            });
          }
          // eslint-disable-next-line no-param-reassign
          state.pos = closePos + 1;
          return true;
        }
      }
    }
    return false;
  });

  // eslint-disable-next-line no-param-reassign
  remarkable.renderer.rules.emoji = function (tokens, index) {
    const token = tokens[index];
    const native = getEmojiNative(token.content);
    return `<span style="font-size:${EMOJI_SIZE}px">${native}</span>`;
  };
}

function addLinksPlugin(remarkable) {
  remarkable.use(linkify);
}

async function addMathExpressionsPlugin(remarkable) {
  const katex = await loadKatex();
  remarkable.use(katex);
}

function addSyntaxHighlightingPlugin(str, lang) {
  try {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(str, { language: lang }).value;
    } else {
      return hljs.highlightAuto(str).value;
    }
  } catch (e) {
    return str;
  }
}

export async function advancedMdToHtml({
  mdString,
  options,
  parseEmojis,
  parseLinks,
  parseMathExpressions,
  parseCode,
}) {
  const remarkable = new Remarkable();

  remarkable.set({
    ...DEFAULT_REMARKABLE_OPTIONS,
    ...options,
    highlight(str, lang) {
      if (parseCode) {
        return addSyntaxHighlightingPlugin(str, lang);
      } else {
        return '';
      }
    },
  });

  if (parseEmojis) {
    addEmojisPlugin(remarkable);
  }

  if (parseLinks) {
    addLinksPlugin(remarkable);
  }

  if (parseMathExpressions) {
    await addMathExpressionsPlugin(remarkable);
  }

  try {
    return remarkable.render(mdString);
  } catch (err) {
    return mdString;
  }
}

export function mdToHtml(mdString, options) {
  const remarkable = new Remarkable();

  remarkable.set({
    ...DEFAULT_REMARKABLE_OPTIONS,
    ...options,
  });

  addEmojisPlugin(remarkable);
  addLinksPlugin(remarkable);

  return remarkable.render(mdString);
}
