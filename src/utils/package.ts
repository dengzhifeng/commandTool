/*
 * @description: 包文件工具类
 * @author: steven.deng
 * @Date: 2022-02-09 07:24:02
 * @LastEditors: steven.deng
 * @LastEditTime: 2022-02-09 07:49:05
 */

import { getPathHack } from ".";
import * as fs from 'fs';

/**
 * @description 文件是否可读
 * @param filePath 项目路径
 */
function canReadFile(filePath: string) {
    return new Promise((resolve, reject) => {
        const realPath = getPathHack(filePath);
        fs.access(realPath, fs.constants.F_OK, (err) => {
            if (err) {
                reject(false);
            } else {
                resolve(true);
            }
        });
    });
}

/**
 * @description 判断 package.json 文件是否存在
 * @param {string} projectPath 项目地址
 */
async function hasFile(projectPath: string) {
    try {
        return await canReadFile(projectPath);
    } catch (err) {
        return false;
    }
}

/**
 * @description 读取 package.json 内容
 */
 function readFile(filePath: string) {
    const realPath = getPathHack(filePath);
    return JSON.parse(fs.readFileSync(realPath, 'utf-8'));
  }

export { hasFile, readFile };
