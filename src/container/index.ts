/*
 * @description: container容器r入口
 * @author: steven.deng
 * @Date: 2022-01-31 17:38:29
 * @LastEditors: steven.deng
 * @LastEditTime: 2022-02-09 07:17:11
 */
import * as vscode from 'vscode';
import { getWorkSpaceFolders } from '../utils';
import SideBarCommand from './SideBarCommand';

export default function(context: vscode.ExtensionContext) {
    init(context);
};

function init(context: vscode.ExtensionContext) {

    // 得到vscode工作区的工程项目
    const folderList = getWorkSpaceFolders();
    console.log('folderlist', folderList);

    // 注册侧边栏面板
    const sideBar = new SideBarCommand(folderList);
    
}