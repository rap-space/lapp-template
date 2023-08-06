/* Nodejs 公共模块 */
const fs = require('fs');
const path = require('path');
/* npm三方包 */
const AdmZip = require('adm-zip'); // https://www.npmjs.com/package/adm-zip
const readdirp = require('readdirp'); // https://www.npmjs.com/package/readdirp
const chalk = require('chalk'); // https://www.npmjs.com/package/chalk
const jsonc = require('jsonc').safe; // https://www.npmjs.com/package/jsonc
const dayjs = require('dayjs'); // https://www.npmjs.com/package/dayjs

// 定义日志方法
const logger = {
  log: (...args) => {
    console.log(chalk.blue('[log]'), ...args)
  },
  error: (...args) => {
    console.log(chalk.red('[error]'), ...args)
  },
  info: (...args) => {
    console.log(chalk.green('[info]'),...args)
  },
}

// 定义常量
const BUILD_DEST = 'build';
const META_DEST = 'lapp-meta.json';
const ZIP_NAME = `package-${dayjs().format('YYYY-MM-DD-HH:mm:ss')}.zip`;

// 确保构建产物目录存在
try {
  const buildDir = fs.readdirSync(BUILD_DEST);
} catch (error) {
  logger.error(`Directory 'build' doesn't exsist, please make sure you've done 'npm run build' !`);
  return;
}

// 以jsonc格式，解析 lapp-meta.json，删除其中注释，并将其复制到构建产物根目录中
try {
  const lappMetaBuffer = fs.readFileSync(META_DEST);
  const [err, result] = jsonc.parse(lappMetaBuffer.toString());
  if (err) {
    logger.log(`Failed to parse JSON: ${err.message}`);
    return;
  }
  logger.log('lapp-meta: \n', result);
  fs.writeFileSync(path.join(BUILD_DEST, META_DEST), JSON.stringify(result, null, 4));
} catch (error) {
  logger.error(`File ${META_DEST} doesn't exsist, please make sure you've configured it right !`);
  return;
}

// 遍历目录，排除无用文件，生产压缩包
const zip = new AdmZip();
readdirp('.',
  {
    fileFilter: ['!.DS_Store', '!*.log', '!*.zip'],
    directoryFilter: ['!.git', '!node_modules', '!.vscode'],
    alwaysStat: true,
  })
  .on('data', (entry) => {
    const { path, stats: { size } } = entry;
    logger.log(`${JSON.stringify({ path, size })}`);
    zip.addFile(path, fs.readFileSync(path));
  })
  .on('warn', error => logger.error('non-fatal error', error))
  .on('error', error => logger.error('fatal error', error))
  .on('end', () => {
    zip.writeZip(ZIP_NAME);
    logger.info(`File has been archived to \n ${path.resolve(ZIP_NAME)}`);
  });
