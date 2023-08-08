import fs from 'fs';
import path from 'path'
import { safe as jsonc } from 'jsonc' // https://www.npmjs.com/package/jsonc
import chalk from 'chalk' // https://www.npmjs.com/package/chalk
import open from 'open' // https://www.npmjs.com/package/open
import { getJsonOrDie, gracefulSuicide, logger } from './script/utils.mjs'

export default function lappPlugin() {
  const BUILD_DEST = 'build';
  const META_DEST = 'lapp-meta.json';
  const { appKey, version } = getJsonOrDie('package.json');
  let browserOpened = false;
  return {
    name: 'lapp-plugin',
    async closeBundle(error) {
      try {
        // 使用允许注释的宽松 jsonc 语法解析 meta 文件
        const lappMetaBuffer = fs.readFileSync(META_DEST);
        const [err, result] = jsonc.parse(lappMetaBuffer.toString());
        if (err) {
          gracefulSuicide(`Failed to parse JSON: ${err.message}`, err);
        }
        const lappMetaStrFormatted = JSON.stringify(result, null, 4);
        // 转换为规整合法的 json 格式写入构建产物
        fs.writeFileSync(path.join(BUILD_DEST, META_DEST), lappMetaStrFormatted);
        console.log(chalk.blue(`\nlapp-meta:\n${lappMetaStrFormatted}`));
      } catch (error) {
        gracefulSuicide(`File ${META_DEST} doesn't exsist, please make sure you've configured it right !`, error);
      }
      if (process.argv.indexOf('--watch') !== -1 && browserOpened === false) {
        // 开发态下，初次打包完成，打开调试页面
        const devUrl = `https://page.1688.com/html/isv-bridge.html?appKey=${appKey}&version=${version}`;
        logger.info('Opening dev URL:\n', devUrl);
        open(devUrl);
        browserOpened = true;
      }
    },
  }
}