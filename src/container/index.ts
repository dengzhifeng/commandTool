/*
 * @description: container容器r入口
 * @author: steven.deng
 * @Date: 2022-01-31 17:38:29
 * @LastEditors: steven.deng
 * @LastEditTime: 2022-03-13 22:37:56
 */
import * as vscode from 'vscode';
import { PREFIX } from '../constants';
import { MyTerminalOptions, ShellType } from '../type/common';
import { getPathHack, getWorkSpaceFolders, uniqBy } from '../utils';
import SideBarCommand from './SideBarCommand';
import { StatusBarTerminal } from './StatusBarTerminal';
import { CommandExplorer } from './CommandExplorer';
import { CommandExecuter } from './commandExecuter';
import { dealTerminal } from './terminal';


export default function(context: vscode.ExtensionContext) {
    // 项目命令
    initProjectCommand(context);
    
    // 自定义目录命令
    if (context.storageUri?.path) {
        new CommandExplorer('WorkSpace-Command', context.storageUri.path);
        new CommandExecuter('workSpaceCommandExecuter', context);
    }
    
    // 全局命令
    new CommandExplorer('Global-Command', context.globalStoragePath);
    new CommandExecuter('globalCommandExecuter', context);
};

// 初始化本地项目命令
function initProjectCommand(context: vscode.ExtensionContext) {
    // 得到vscode工作区的工程项目
    const folderList = getWorkSpaceFolders();
    console.log('folderlist', folderList);

    // 注册侧边栏面板
    const sideBar = new SideBarCommand(folderList);

    // 注册树形文件树
    vscode.window.registerTreeDataProvider('SideBar-Command', sideBar);
    
    // 注册命令 点击每行
    vscode.commands.registerCommand(
        'SideBar-Command.openChild', 
        (args: { title: string; shell: ShellType; [key: string]: any }) => { 
            dealTerminal(context, args);
        }
    );
}