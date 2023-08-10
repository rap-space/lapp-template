import fs from 'fs';
import chalk from 'chalk'; // https://www.npmjs.com/package/chalk

/** 输出日志 */
const chalkWrapper = (chalkFunc, arg) => typeof arg === 'string' ? chalkFunc(arg) : arg;
export const logger = {
  log: (...args) => {
    console.log(chalk.blue('[log]'), ...args.map(arg => chalkWrapper(chalk.blue, arg)))
  },
  error: (...args) => {
    console.log(chalk.red('[error]'), ...args.map(arg => chalkWrapper(chalk.red, arg)))
  },
  info: (...args) => {
    console.log(chalk.green('[info]'), ...args.map(arg => chalkWrapper(chalk.green, arg)))
  },
}

/** 进程优雅自杀 */
export const gracefulSuicide = (msg, err) => {
  console.log(chalk.red('\n================= [build error] =================\n'))
  console.log(chalk.red(msg))
  if (err) {
    console.error(err);
  }
  console.log(chalk.red('\n================= [build error] =================\n'))
  process.exit(1);
}

/**  获取文件，文件不存在则报错退出 */
export const getFileBufferOrDie = (fileDest) => {
  try {
    const content = fs.readFileSync(fileDest);
    return content;
  } catch (error) {
    gracefulSuicide(`'${fileDest}' doesn't exsist, please make sure you've done 'npm run build' !`, error);
  }
}

/** 获取 JSON，格式不合法则报错退出 */
export const getJsonOrDie = (fileDest) => {
  try {
    const jsonObjBuffer = getFileBufferOrDie(fileDest);
    const jsonObj = JSON.parse(jsonObjBuffer.toString());
    return jsonObj;
  } catch (error) {
    gracefulSuicide(`File ${fileDest} isn't a valid JSON, please make sure you've configured it right !`, error);
  }
}