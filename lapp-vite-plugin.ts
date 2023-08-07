import fs from 'fs';
import path from 'path'
import { safe as jsonc } from 'jsonc'; // https://www.npmjs.com/package/jsonc
import chalk from 'chalk' // https://www.npmjs.com/package/chalk

const logError = (...args) => {
  console.log(chalk.red('\n================= [build error] ================='))
  console.error(...args);
  console.log(chalk.red('================= [build error] =================\n'))
};

export default function lappPlugin() {
  const BUILD_DEST = 'build';
  const META_DEST = 'lapp-meta.json';
  return {
    name: 'lapp-plugin',
    async closeBundle (error) {
      try {
        // 使用允许注释的宽松 jsonc 语法解析 meta 文件
        const lappMetaBuffer = fs.readFileSync(META_DEST);
        const [err, result] = jsonc.parse(lappMetaBuffer.toString());
        if (err) {
          logError(`Failed to parse JSON: ${err.message}`);
          return;
        }
        const lappMetaStrFormatted = JSON.stringify(result, null, 4);
        // 转换为规整合法的 json 格式写入构建产物
        fs.writeFileSync(path.join(BUILD_DEST, META_DEST), lappMetaStrFormatted);
        console.log(chalk.green(`\nlapp-meta:\n${lappMetaStrFormatted}`));
      } catch (error) {
        logError(`File ${META_DEST} doesn't exsist, please make sure you've configured it right !`);
        return;
      }
    },
  }
}