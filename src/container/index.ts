/*
 * @description: container容器r入口
 * @author: steven.deng
 * @Date: 2022-01-31 17:38:29
 * @LastEditors: steven.deng
 * @LastEditTime: 2022-03-28 22:33:26
 */
import * as vscode from 'vscode';
import { ShellType } from '../type/common';
import { copyToClipboard, getWorkSpaceFolders } from '../utils';
import SideBarCommand from './SideBarCommand';
import { CommandExplorer } from './CommandExplorer';
import { CommandExecuter } from './commandExecuter';
import { dealTerminal } from './terminal';


export default function(context: vscode.ExtensionContext) {
    // 项目命令
    initProjectCommand(context);
    
    // 自定义目录命令
    if (context.storageUri?.path) {
        console.log(context.storageUri.path);
        new CommandExplorer('WorkSpace-Command', context.storageUri.path, context);
        new CommandExecuter('workSpaceCommandExecuter', context);
    }

    // 全局命令
    new CommandExplorer('Global-Command', context.globalStoragePath, context);
    new CommandExecuter('globalCommandExecuter', context);
};

// 初始化本地项目命令
function initProjectCommand(context: vscode.ExtensionContext) {
    // 得到vscode工作区的工程项目
    const folderList = getWorkSpaceFolders();

    // 注册侧边栏面板
    const sideBar = new SideBarCommand(folderList);

    // 定义本地项目命令的id
    const viewId = 'SideBar-Command';
    // 注册树形文件树
    vscode.window.registerTreeDataProvider('SideBar-Command', sideBar);
    

    // 注册命令 点击每行  context.subscriptions.push销毁命令用
    context.subscriptions.push(vscode.commands.registerCommand(
        `${viewId}.openChild`, 
        (args: { title: string; shell: ShellType; [key: string]: any }) => { 
            dealTerminal(context, args);
        }
    ));
    // 复制命令
    context.subscriptions.push(vscode.commands.registerCommand(`${viewId}.copy`, (node) => { 
        const shell = node.shell.value;
        copyToClipboard(shell, () => {
            vscode.window.showInformationMessage(`已经复制命令${shell}到剪切板`);
        });
    }));
}