/*
 * @description: 侧边栏父类
 * @author: steven.deng
 * @Date: 2022-01-31 18:07:56
 * @LastEditors: steven.deng
 * @LastEditTime: 2022-02-21 07:27:53
 */
import * as vscode from 'vscode';

// 侧边栏item父类
class SideBarEntryItem extends vscode.TreeItem {
    constructor(
        public readonly label: string, // 标签
        public readonly collapsibleState: vscode.TreeItemCollapsibleState, // 可折叠状态
        public readonly path?: string,
        public readonly projectName?: string,
        public readonly description?: string,
    ) {
        super(label, collapsibleState);
        this.path = `${this.path}`;
        this.tooltip = `tip: ${this.label}`;
        this.projectName = `${this.projectName}`;
        this.description = `${this.description || ''}`;
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