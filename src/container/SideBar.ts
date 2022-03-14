/*
 * @description: 侧边栏父类
 * @author: steven.deng
 * @Date: 2022-01-31 18:07:56
 * @LastEditors: steven.deng
 * @LastEditTime: 2022-03-15 07:48:02
 */
import * as vscode from 'vscode';
import { ShellType } from '../type/common';

// 侧边栏item父类
class SideBarEntryItem extends vscode.TreeItem {
    constructor(
        public readonly label: string, // 标签
        public readonly collapsibleState: vscode.TreeItemCollapsibleState, // 可折叠状态
        public readonly path?: string,
        public readonly projectName?: string,
        public readonly description?: string,
        public readonly shell?: ShellType | string,
        public readonly contextValue?: string,
        
    ) {
        super(label, collapsibleState);
        this.path = `${path}`;
        this.tooltip = `tip: ${label}`;
        this.projectName = `${projectName}`;
        this.description = `${description || ''}`;
        this.shell = shell;
        this.contextValue = contextValue;
    }
}

// 侧边栏入口抽象类
abstract class SideBarEntryListImplements implements vscode.TreeDataProvider<SideBarEntryItem> {
    abstract getChildren(element?: SideBarEntryItem): vscode.ProviderResult<SideBarEntryItem[]>;
    getTreeItem(element: SideBarEntryItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
}

export { SideBarEntryItem, SideBarEntryListImplements };