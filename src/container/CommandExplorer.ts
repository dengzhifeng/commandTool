/*
 * @description: 自定义命令目录
 * @author: steven.deng
 * @Date: 2022-02-23 06:54:50
 * @LastEditors: steven.deng
 * @LastEditTime: 2022-04-11 07:41:08
 */
import * as vscode from 'vscode';
import { Entry } from '../type/common';
import { _ } from '../utils';
import FileSystemProvider from './FileSystemProvider';
export class CommandExplorer {
    private commandExplorer?: vscode.TreeView<Entry>;

    private selectedFile?: Entry;

    constructor(viewId: string, storagePath: string, context: vscode.ExtensionContext) {
        this.setupStorage(storagePath).then(() => {
            // 创建文件树对象
            const treeDataProvider = new FileSystemProvider(viewId, storagePath);
            // 创建目录树
            this.commandExplorer = vscode.window.createTreeView(viewId, { treeDataProvider });
            context.subscriptions.push(vscode.commands.registerCommand(`${viewId}.openFile`, (resource) => this.openResource(resource)));

            this.commandExplorer.onDidChangeSelection(event => this.selectedFile = event.selection[0]);
            context.subscriptions.push(vscode.commands.registerCommand(`${viewId}.add`, () => treeDataProvider.add(this.selectedFile)));
            context.subscriptions.push(vscode.commands.registerCommand(`${viewId}.addFolder`, () => treeDataProvider.addFolder(this.selectedFile)));
            context.subscriptions.push(vscode.commands.registerCommand(`${viewId}.sync`, () => treeDataProvider.refresh()));
            context.subscriptions.push(vscode.commands.registerCommand(`${viewId}.edit`, (element) => treeDataProvider.edit(element)));
            context.subscriptions.push(vscode.commands.registerCommand(`${viewId}.editLabel`, (element) => treeDataProvider.editLabel(element)));
            context.subscriptions.push(vscode.commands.registerCommand(`${viewId}.editFolder`, (element) => treeDataProvider.edit(element)));
            context.subscriptions.push(vscode.commands.registerCommand(`${viewId}.delete`, (element) => {
                    treeDataProvider.delete(element.uri, {recursive: true});
                    // 删除后就清楚选中 否则会新增文件夹时用回这个已经删除的目录去新增子目录
                    this.selectedFile = undefined;
                }
            ));
            context.subscriptions.push(vscode.commands.registerCommand(`${viewId}.copy`, (element) => treeDataProvider.copyCommand(element)));
        });
    }

    private async setupStorage(storageUriFsPath: string) {
        const isExist = await _.exists(storageUriFsPath);

        if (!isExist) {
            await _.mkdir(storageUriFsPath);
        }
        return;
    }
    private openResource(resource: vscode.Uri): void {
        vscode.window.showTextDocument(resource);
    }
}
