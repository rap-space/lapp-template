/* Nodejs 公共模块 */
import fs from 'fs';
import path from 'path';
/* npm三方包 */
import AdmZip from 'adm-zip'; // https://www.npmjs.com/package/adm-zip
import readdirp from 'readdirp'; // https://www.npmjs.com/package/readdirp
import pm from 'picomatch'; // https://www.npmjs.com/package/picomatch
import dayjs from 'dayjs'; // https://www.npmjs.com/package/dayjs
import { logger, getFileBufferOrDie, getJsonOrDie } from './misc/utils.mjs';
import { BUILD_DEST, META_DEST, BUILD_WHITELIST } from './misc/config.mjs';

// 定义常量
const ZIP_NAME = `package-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}.zip`;

// 确保 index.js 和 index.css 两个 entry 存在
getFileBufferOrDie(path.join(BUILD_DEST, 'index.js'));
getFileBufferOrDie(path.join(BUILD_DEST, 'index.css'));
// 确保构建产物中的 lapp-meta.json 存在且合法
getJsonOrDie(path.join(BUILD_DEST, META_DEST));

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
