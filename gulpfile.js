// Copy non-TS assets (icons, codex JSON) into dist/
const { src, dest } = require('gulp');

function buildIcons() {
  // encoding: false — gulp 5 defaults to utf8 decoding, which corrupts PNGs
  return src('nodes/**/*.{svg,png,json}', { encoding: false }).pipe(dest('dist/nodes'));
}

exports['build:icons'] = buildIcons;
