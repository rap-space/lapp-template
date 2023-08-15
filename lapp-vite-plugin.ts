import fs from 'fs';
import path from 'path'
import { safe as jsonc } from 'jsonc' // https://www.npmjs.com/package/jsonc
import chalk from 'chalk' // https://www.npmjs.com/package/chalk
import { getJsonOrDie, gracefulSuicide } from './script/misc/utils.mjs'
import { BUILD_DEST, META_DEST, CDN_DOMAIN } from './script/misc/config.mjs'

export default function lappPlugin() {
  const { appKey, version } = getJsonOrDie('package.json');
  if (typeof appKey !== 'string') {
    gracefulSuicide('Please make sure appKey is defined in package.json according to README.md');
  }
  if (typeof version !== 'string') {
    gracefulSuicide('Please make sure version is defined in package.json according to README.md');
  }
  
  let initialized = false;
  return {
    name: 'lapp-plugin',
    async closeBundle(error) {
      let lappMetaStrFormatted = '';
      try {
        // 使用允许注释的宽松 jsonc 语法解析 meta 文件
        const lappMetaBuffer = fs.readFileSync(META_DEST);
        const [err, result] = jsonc.parse(lappMetaBuffer.toString());
        if (err) {
          gracefulSuicide(`Failed to parse JSON: ${err.message}`, err);
        }
        lappMetaStrFormatted = JSON.stringify(result, null, 4);
        // 转换为规整合法的 json 格式写入构建产物
        fs.writeFileSync(path.join(BUILD_DEST, META_DEST), lappMetaStrFormatted);
      } catch (error) {
        gracefulSuicide(`File ${META_DEST} doesn't exsist, please make sure you've configured it right !`, error);
      }
      if (process.argv.indexOf('--watch') !== -1 && initialized === false) {
        // 开发态下，初次打包完成，提示调试信息，并打开页面
        const devUrl = `https://page.1688.com/html/isv-bridge.html?appKey=${appKey}&version=${version}`;
        const buildDestFullPath = path.resolve(path.join(__dirname, BUILD_DEST));
        const proxyRule = `^***${CDN_DOMAIN}/pc-pc_work-pc_work_plugin-${appKey}/*/*** file://${buildDestFullPath}/$3`;
        console.log(chalk.cyan('\n====================== Environment Info =====================\n'))
        console.log(chalk.cyan(`
lapp-meta.json:
${lappMetaStrFormatted}

Please use whistle as local proxy server:
${chalk.underline('https://www.npmmirror.com/package/whistle')}

Example for whistle proxy rule:
${proxyRule}

Please make sure you've configured the proxy server properly, then open the local Dev URL below :
${chalk.underline(devUrl)}


`));
        console.log(chalk.cyan('\n====================== Environment Info =====================\n'))
        initialized = true;
      }
    },
  }
}
