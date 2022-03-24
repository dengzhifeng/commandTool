/*
 * @description: 工具函数
 * @author: steven.deng
 * @Date: 2022-01-31 17:52:13
 * @LastEditors: steven.deng
 * @LastEditTime: 2022-03-25 07:39:00
 */
import * as vscode from 'vscode';
import { FolderType } from '../type/common';
import * as os from 'os';
import * as fs from 'fs';

import * as cp from 'child_process';
import { ExecException}  from 'child_process';
export * from './package';
export * from './file';

/**
 * @description 因为 vscode 支持 Multi-root 工作区，暴力解决
 * @summary 如果发现只有一个根文件夹，读取其子文件夹作为 workspaceFolders
 */
function getWorkSpaceFolders() {
    const folders: FolderType[] = [];
    vscode?.workspace?.workspaceFolders?.forEach((folder: any) => {
        folders.push({
            name: folder.name,
            path: folder.uri.path
        });
    });
    return folders;
}

/**
 *@description 得到正确的地址，兼容window上的问题
 */
function getPathHack(filePath: string) {
    if (isWinOS()) {
        return filePath.slice(1);
    }
    return filePath;
}

/**
 * @description 获取操作系统平台
 */
function isWinOS() {
    return os.platform() === 'win32';
}

function isMacOS() {
    return os.platform() === 'darwin';
}

/**
 * @description 字符串去除首尾空格
 */
function trim(str: string) {
    return str.replace(/(^\s*)|(\s*$)/g, '');
}

/**
 * @description 数组去重
 * @param {Array} arr
 * @param {string} iteratee
 */
function uniqBy(arr: any[], iteratee: string) {
    return arr !== null && arr.length ? objUniq(arr, iteratee) : [];
}

/**
 * @description 对象去重
 * terminals = [{terminalName: aa}]
 */
function objUniq(arr: any[], iteratee: string) {
    let uniqMaps: { [key: string]: any } = {};
    arr.forEach((ele: { [key: string]: any }, index: number) => {
        if (!uniqMaps[ele[iteratee]]) {
            // 默认采用第一个出现的数据为准
            uniqMaps[ele[iteratee]] = index;
        }
    });
    // uniqMaps = {aa:1 , bb:2}
    const result = Object.keys(uniqMaps).map((key: string) => {
        return arr[uniqMaps[key]];
    });
    return result;
}

// 拷贝文本
function copyToClipboard(text: any, func: Function) {
    if (isMacOS()) {
        macCopy(text);
        func();
        return;
    }
    let resultfileName = "result.txt";
    let command = `clip < ${resultfileName} `;
    // 写入要粘贴的内容进result.txt
    fs.writeFileSync(resultfileName, text, { encoding: "utf8" });
    let cmdFileName = "copy.bat";
    // 写入粘贴命令 clip < result.text 进copy.bat
    fs.writeFileSync(cmdFileName, command, { encoding: "utf8" });
    cp.exec(cmdFileName, {}, (error: ExecException | null, stdout: string, stderr: string) => {
        if (error || stderr) {return console.log(error, stdout, stderr);}
        // 用nodejs删除文件
        fs.unlinkSync(cmdFileName);
        fs.unlinkSync(resultfileName);
        func(text, stdout);
    });
};

function macCopy(data: any) {
    const proc = cp.spawn("pbcopy");
    proc.stdin.write(data);
    proc.stdin.end();
}

export { getWorkSpaceFolders, getPathHack, trim, uniqBy, copyToClipboard };
