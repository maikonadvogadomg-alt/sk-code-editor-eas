const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const s = path.join(src, item);
    const d = path.join(dst, item);
    if (fs.statSync(s).isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

module.exports = function withCopyWww(config) {
  return withDangerousMod(config, ['android', (config) => {
    const src = path.join(config.modRequest.projectRoot, 'www');
    const dst = path.join(config.modRequest.platformProjectRoot, 'app/src/main/assets/www');
    if (fs.existsSync(src)) {
      copyDir(src, dst);
      console.log('[withCopyWww] Copiado www/ →', dst);
    } else {
      console.warn('[withCopyWww] Pasta www/ não encontrada em', src);
    }
    return config;
  }]);
};
