/**
  定义一些全局常量
*/

/** 构建地址 */
export const BUILD_DEST = 'build';
/** 元信息文件地址 */
export const META_DEST = 'lapp-meta.json';
/** 构建产物白名单 */
export const BUILD_WHITELIST = [
  '*.js',
  '*.css',
  '*.json',
];
/** 线上 CDN 域名 */
export const CDN_DOMAIN = 'open-isv-assets.1688.com';

/** 线上 CDN 路径映射 */
export const CDN_PATH_MAP = {
  'PC': 'pc-pc_work-pc_work_plugin-',
  'MOBILE': 'mobile-mobile_app-mobile_app_plugin-'
};