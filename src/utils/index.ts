/*
 * @description: 工具函数
 * @author: steven.deng
 * @Date: 2022-01-31 17:52:13
 * @LastEditors: steven.deng
 * @LastEditTime: 2022-02-09 07:45:08
 */
import * as vscode from 'vscode';
import { FolderType } from '../type/common';
import * as os from 'os';
import * as pack from './package';
/**
 * @description 因为 vscode 支持 Multi-root 工作区，暴力解决
 * @summary 如果发现只有一个根文件夹，读取其子文件夹作为 workspaceFolders
 */
function getWorkSpaceFolders() {
    const folders: FolderType[] = [];
    vscode?.workspace?.workspaceFolders?.forEach((folder: any) => {
        folder.push({
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


export {
    getWorkSpaceFolders,
    getPathHack,
    pack
};
