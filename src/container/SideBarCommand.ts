/*
 * @description: 命令集合侧边栏实例
 * @author: steven.deng
 * @Date: 2022-01-31 17:38:46
 * @LastEditors: steven.deng
 * @LastEditTime: 2022-02-09 07:51:17
 */
import * as vscode from 'vscode';
import { FolderType } from '../type/common';
import { hasFile, readFile } from '../utils/package';
import { SideBarEntryItem, SideBarEntryListImplements } from './SideBar';

// 实现侧边栏
export default class SideBarCommand extends SideBarEntryListImplements {
    constructor(private folderPathList: FolderType[] | undefined) {
        super();
    }
    // 获取子树方式
    async getChildren(element?: SideBarEntryItem): vscode.ProviderResult<SideBarEntryItem[]> {
        if (element) {
            let childElement:any = [];
            const packJsonPath = `${element.path}/package.json`;
            const hasPackageJson = await hasFile(packJsonPath);
            // 如果有packjson
            if (hasPackageJson) {
                const packageValue = readFile(packJsonPath);
                // 有script
                if (packageValue?.script) {
                    // 得到用户自定义配置的脚本命令规则
                    const scriptsRule: string = vscode.workspace.getConfiguration().get('vscode-beehive-extension.scriptsRule') || '';
                    const scriptNames = scriptsRule.split('、');
                }
            }
        }
    }
}
