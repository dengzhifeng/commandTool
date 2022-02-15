/*
 * @description: 命令集合侧边栏实例
 * @author: steven.deng
 * @Date: 2022-01-31 17:38:46
 * @LastEditors: steven.deng
 * @LastEditTime: 2022-02-15 08:22:14
 */
import * as vscode from 'vscode';
import { PREFIX } from '../constants';
import { FolderType, ShellType } from '../type/common';
import { trim } from '../utils';
import { getShell, hasFile, readFile } from '../utils/package';
import { SideBarEntryItem, SideBarEntryListImplements } from './SideBar';



// 实现侧边栏
export default class SideBarCommand extends SideBarEntryListImplements {
    constructor(private folderPathList: FolderType[] | undefined) {
        super();
    }
    // 获取子树方式
    async getChildren(element?: SideBarEntryItem): Promise<SideBarEntryItem[] | null | undefined> {
        if (element) {
            debugger;
            let childElement:any = [];
            const packJsonPath = `${element.path}/package.json`;
            const hasPackageJson = await hasFile(packJsonPath);
            // 如果有packjson
            if (hasPackageJson) {
                const packageValue = readFile(packJsonPath);
                // 有script
                if (packageValue?.scripts) {
                    // 得到用户自定义配置的脚本命令规则
                    // const scriptsRule: string = vscode.workspace.getConfiguration().get('vscode-commandtool-extension.scriptsRule') || '';
                    // const scriptNames = scriptsRule.split('、');
                    let shellList: ShellType[] = [];
                    shellList = getShell(packageValue.scripts);
                    if (!!shellList.length) {
                        shellList.forEach((shell: ShellType, index: number) => {
                            const node = getNode(shell.key, {
                                shell,
                                path: element.path,
                                projectName: element.projectName
                            });
                            childElement[index] = node;
                        });
                    } else {
                        const noneNode = getNode(`[${PREFIX}]: 😥 script command does not meet the rules`);
                        childElement = [noneNode];
                    }
                } else {
                    const noneNode = getNode(`[${PREFIX}]: 😞 no script commands`);
                    childElement = [noneNode];
                }
            } else {
                const noneNode = getNode(`[${PREFIX}]: 😅 project does not exist package.json`);
                childElement = [noneNode];
            }
            return childElement;
        } else {
            const folderNode = this.folderPathList?.map((folder: FolderType) => {
                return new SideBarEntryItem(
                    folder.name, 
                    vscode.TreeItemCollapsibleState.Collapsed,
                    '',
                    folder.name,
                    folder.path
                );
            }) || [];
            return folderNode;
        }
    }
}

// 获取节点
function getNode(title: string, args?:{[key: string]: any}) {
    let node = new SideBarEntryItem(
        title,
        vscode.TreeItemCollapsibleState.None, // 不折叠
        // args?.path, // Todo
        // args?.projectName,
    );
    node.command = {
        title,
        command: 'SideBar-Command.openChild', // 命令id 要初始化时提前注册
        arguments: [{title, ...args}]
    };
    return node;
}