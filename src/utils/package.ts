/*
 * @description: 包文件工具类
 * @author: steven.deng
 * @Date: 2022-02-09 07:24:02
 * @LastEditors: steven.deng
 * @LastEditTime: 2022-02-13 10:01:16
 */

import { getPathHack } from ".";
import * as fs from 'fs';
import { ShellType } from "../type/common";

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

interface KeyType {
    [key: string]: string
}
/**
 * @description 得到 shellKey 的脚本命令
 * @param {ShellType} scripts package.json 中的 scripts 数据
 * @param {string} shellKey scripts 中的 key
 */

function getShell(scripts: KeyType): ShellType[] {
    // 判空
    if (!scripts || Object.keys(scripts).length === 0) {
        return [];
    }
    let shellList: ShellType[] = [];
    // 遍历脚本 scriptName是脚本名字 
    Object.keys(scripts).map((scriptName: string) => {
        shellList.push({
            key: scriptName,
            value: scripts[`${scriptName}`],
        });
    });
    return shellList;
}

// /**
//  * @description 匹配脚本环境
//  * @param shellEnv 脚本环境
//  */
// function getShellEnv(shellEnv: string): string {
//     let canBreak = false;
//     let environment: string = 
// }

export { hasFile, readFile, getShell };
