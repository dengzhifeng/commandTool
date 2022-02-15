/*
 * @description: 工具函数
 * @author: steven.deng
 * @Date: 2022-01-31 17:52:13
 * @LastEditors: steven.deng
 * @LastEditTime: 2022-02-14 22:36:49
 */
import * as vscode from 'vscode';
import { FolderType } from '../type/common';
import * as os from 'os';
export * from './package';
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

export { getWorkSpaceFolders, getPathHack, trim, uniqBy };
