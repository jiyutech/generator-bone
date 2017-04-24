const _ = require('lodash');
const colors = require('colors');

function echoCow(v1, v2) {
  let v1Len = v1.length;
  v2 = v2 || '0.0.0'
  let v2Len = v2.length;
  let maxLen = Math.max(v1Len, v2Len);
  let cow =   ' ------\n' +
  '< bone >\n' +
  ` ------                        ╭────────${_.repeat("─",maxLen + 3)}─────╮     \n` +
  `        o   ^__^               │          ${_.repeat(" ",maxLen + 3)}   │     \n` +
  `         o  (oo)_______        │    Latest: ${colors.green('v' + v1)}${_.repeat(" ",maxLen-v1Len + 3)}│     \n` +
  `            (__)       )/      │    Local:  ${colors.yellow('v' + v2)}${_.repeat(" ",maxLen-v2Len + 3)}│     \n` +
  `               ||----w |       │          ${_.repeat(" ",maxLen + 3)}   │     \n` +
  `               ||     ||       ╰──────────${_.repeat("─",maxLen + 3)}-──╯     \n`;
  console.log(cow);
}

module.exports = echoCow;
