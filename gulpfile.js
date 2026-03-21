// Copy non-TS assets (icons, codex JSON) into dist/
const { src, dest } = require('gulp');

function buildIcons() {
  return src('nodes/**/*.{svg,png,json}').pipe(dest('dist/nodes'));
}

exports['build:icons'] = buildIcons;
