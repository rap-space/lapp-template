/* Nodejs 公共模块 */
const fs = require('fs');
const path = require('path');
/* npm三方包 */
const AdmZip = require('adm-zip'); // https://www.npmjs.com/package/adm-zip
const readdirp = require('readdirp'); // https://www.npmjs.com/package/readdirp
const pm = require('picomatch'); // https://www.npmjs.com/package/picomatch
const chalk = require('chalk'); // https://www.npmjs.com/package/chalk
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
    console.log(chalk.green('[info]'), ...args)
  },
}

// 定义文件检查方法
const fileChecker = (fileDest) => {
  try {
    fs.readFileSync(fileDest);
  } catch (error) {
    const messege = `'${fileDest}' doesn't exsist, please make sure you've done 'npm run build' !`;
    logger.error(messege);
    process.exit(1);
  }
}

// 定义常量
const BUILD_DEST = 'build';
const META_DEST = 'lapp-meta.json';
const ZIP_NAME = `package-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}.zip`;
const BUILD_WHITELIST = [
  //  构建产物白名单
  '*.js',
  '*.css',
  '*.json',
];

// 确保 index.js 和 index.css 两个 entry 存在
fileChecker(path.join(BUILD_DEST, 'index.js'));
fileChecker(path.join(BUILD_DEST, 'index.css'));

// 确保构建产物中的 lapp-meta.json 存在且合法
const builtMetaPath = path.join(BUILD_DEST, META_DEST);
try {
  const lappMetaBuffer = fs.readFileSync(builtMetaPath);
  JSON.parse(lappMetaBuffer.toString());
} catch (error) {
  logger.error(`File ${builtMetaPath} doesn't exsist or isn't valid JSON, please make sure you've configured it right !`);
  process.exit(1);
}

// 遍历目录，排除无用文件，生产压缩包
const zip = new AdmZip();
readdirp('.',
  {
    fileFilter: (entry) => {
      const { path, basename } = entry;
      // 根据白名单过滤 build产物
      if (path.indexOf(BUILD_DEST) === 0) {
        return pm.isMatch(basename, BUILD_WHITELIST);
      }
      // 过滤掉不应打包的内容
      return !pm.isMatch(basename, [
        '.DS_Store',
        '*.log',
        '*.zip',
      ]);
    },
    directoryFilter: [
      '!.git',
      '!node_modules',
      '!.vscode'
    ],
    alwaysStat: true,
  })
  .on('data', (entry) => {
    const { path, stats: { size } } = entry;
    logger.log(`addFile: ${path}`);
    zip.addFile(path, fs.readFileSync(path));
  })
  .on('warn', error => logger.error('non-fatal error', error))
  .on('error', error => logger.error('fatal error', error))
  .on('end', () => {
    zip.writeZip(ZIP_NAME);
    logger.info(`File has been archived to \n ${path.resolve(ZIP_NAME)}`);
  });
