/*
 * @description: 文件目录处理的provider
 * @author: steven.deng
 * @Date: 2022-02-24 07:16:17
 * @LastEditors: steven.deng
 * @LastEditTime: 2022-04-08 14:26:56
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
// import * as sanitizeFilename from 'sanitize-filename';

import { FileStat } from './FileStat';
import { _, copyToClipboard, isWinOS } from '../utils';
import { Command, Entry } from '../type/common';

const sanitizeFilename = require('sanitize-filename');

export default class FileSystemProvider
    implements vscode.TreeDataProvider<Entry>, vscode.FileSystemProvider
{
    // 创建目录树的事件发射器
    private _onDidChangeTreeData: vscode.EventEmitter<Entry | undefined> =
        new vscode.EventEmitter<Entry | undefined>();
    // 获取事件发射器的事件
    readonly onDidChangeTreeData: vscode.Event<Entry | undefined> =
        this._onDidChangeTreeData.event;
    // 创建文件事件发射器
    private _onDidChangeFile: vscode.EventEmitter<vscode.FileChangeEvent[]> =
        new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    // 定义根目录
    private rootUri: vscode.Uri;
    // 定义视图id
    private viewId: string;

    constructor(viewId: string, rootPath: string) {
        this.rootUri = vscode.Uri.file(rootPath);
        this.viewId = viewId;
        this.watch(this.rootUri, { recursive: true, excludes: ['.json'] });
    }
    async add(selected?: Entry) {
        const script = await vscode.window.showInputBox({
            placeHolder: `E.g.: npm run dev`,
            prompt: `Enter a new command script`
        });
        
        const command: Command = {
            script: script,
            label: `label:${script}`,
        };
        let fileName = command.script;
        const sanitizedFilename = sanitizeFilename(<string>fileName).slice(0, 250);
        if (selected) {
            const filePath = selected.type === vscode.FileType.Directory ? 
            `${selected.uri.fsPath}/${sanitizedFilename}.json` :
            `${this.getDirectoryPath(selected.uri.fsPath)}/${sanitizedFilename}.json`;
            this._writeFile(filePath, this.stringToUnit8Array(JSON.stringify(command)), 
            {create: true, overwrite: true});
        } else {
            this._writeFile(`${this.rootUri.fsPath}/${sanitizedFilename}.json`, 
            this.stringToUnit8Array(JSON.stringify(command)), {create: true, overwrite: true});
        }
    }
    addFolder(selected?: Entry) {
        vscode.window.showInputBox({placeHolder: 'Enter a new group name'})
            .then(value => {
                if (value !== null && value !== undefined) {
                    const sanitizedFilename = sanitizeFilename(<string>value).slice(0, 250);

                    if (selected) {
                        const filePath = selected.type === vscode.FileType.Directory ? 
                        `${selected.uri.fsPath}/${sanitizedFilename}` : `${this.getDirectoryPath(selected.uri.fsPath)}/${sanitizedFilename}}`;
                        this.createDirectory(vscode.Uri.file(filePath));
                    } else {
                        // 根目录下创建
                        this.createDirectory(vscode.Uri.file(`${this.rootUri.fsPath}/${sanitizedFilename}`));
                    }
                }
            });
    }
    async edit(element?: Entry) {
        if (element && element.type === vscode.FileType.File) {
            const file: Command = JSON.parse(fs.readFileSync(element.uri.fsPath, 'utf8'));
            const script = await vscode.window.showInputBox({
                prompt: 'Edit command script',
                value: file.script ? file.script : ''
            });
            if(!script) {return;};
            const command: Command = {
                ...file,
                script
            };
            const fileName = command.script;
            const sanitizedFilename = sanitizeFilename(<string>fileName).slice(0, 250);
            const newUri = vscode.Uri.file(`${this.getDirectoryPath(element.uri.fsPath)}/${sanitizedFilename}.json`);
            await this.delete(element.uri, {recursive: false});
            await this._writeFile(newUri.fsPath, this.stringToUnit8Array(JSON.stringify(command)), {create: true, overwrite: true });
        } else if (element && element.type === vscode.FileType.Directory) {
            vscode.window.showInputBox({ placeHolder: 'Edit Folder name', value: this.getFileName(element.uri.fsPath) })
            .then(value => {
                const sanitizedFilename = sanitizeFilename(<string>value).slice(0, 250);

                if (value !== null && value !== undefined) {
                    const newPath = vscode.Uri.file(`${this.getDirectoryPath(element.uri.fsPath)}/${sanitizedFilename}`);
                    this.rename(element.uri, newPath, { overwrite: true});
                }
            });
        }
    }
    async editLabel(element?: Entry) {
        if (element && element.type === vscode.FileType.File) {
            const file: Command = JSON.parse(fs.readFileSync(element.uri.fsPath, 'utf8'));
            const label = await vscode.window.showInputBox({
                prompt: 'Edit command label',
                value: file.label ? file.label : ''
            });
            if (!label) {
                return;
            }
            const command: Command = {
                ...file,
                label
            };
            await this._writeFile(element.uri.fsPath, this.stringToUnit8Array(JSON.stringify(command)), {create: true, overwrite: true});
        }
    }
    copyCommand(element?: Entry) {
        if (element && element.type === vscode.FileType.File) { 
            const file: Command = JSON.parse(fs.readFileSync(element.uri.fsPath, 'utf8'));
            copyToClipboard(file.script, () => {
                vscode.window.showInformationMessage(`已经复制命令${file.script}到剪切板`);
            });
        }
    }
    watch(
        uri: vscode.Uri,
        options: { recursive: boolean; excludes: string[] }
    ): vscode.Disposable {
        const watcher = fs.watch(
            uri.fsPath,
            { recursive: options.recursive },
            async (event: string, filename: string | Buffer) => {
                // 获取文件路径
                const filePath = path.join(
                    uri.fsPath,
                    _.normalizeNFC(filename.toString())
                );
                this.refresh(); // 重新触发目录树的 getChildren
                // 更新文件状态 告知文件系统该文件改变了 
                this._onDidChangeFile.fire([
                    {
                        type:
                            event === 'change'
                                ? vscode.FileChangeType.Changed
                                : (await _.exists(filePath))
                                ? vscode.FileChangeType.Created
                                : vscode.FileChangeType.Deleted,
                        uri: uri.with({ path: filePath })
                    } as vscode.FileChangeEvent
                ]);
            }
        );
        return {
            dispose: () => watcher.close()
        };
    }
    stat(uri: vscode.Uri): Thenable<vscode.FileStat> {
        return this._stat(uri.fsPath);
    }
    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }
    get onDidChangeFile(): vscode.Event<vscode.FileChangeEvent[]> {
        return this._onDidChangeFile.event;
    }
    createDirectory(uri: vscode.Uri): void | Thenable<void> {
        return _.mkdir(uri.fsPath);
    }
    readDirectory(uri: vscode.Uri): Thenable<[string, vscode.FileType][]> {
        return this._readDirectory(uri);
    }
    async _stat(path: string): Promise<vscode.FileStat> {
        return new FileStat(await _.stat(path));
    }
    async _readDirectory(
        uri: vscode.Uri
    ): Promise<[string, vscode.FileType][]> {
        const children = await _.readdir(uri.fsPath);
        const result: [string, vscode.FileType][] = [];
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const stat = await this._stat(path.join(uri.fsPath, child));
            result.push([child, stat.type]);
        }
        return Promise.resolve(result);
    }
    getFileName(path: string): string {
        if(isWinOS()) {
            return path.slice(path.lastIndexOf('\\') + 1);
        }
        return path.slice(path.lastIndexOf('/') + 1);
    }
    delete(uri: vscode.Uri, options: { recursive: boolean }): Thenable<void> {
        if (options.recursive) {
            return _.rmrf(uri.fsPath);
        }
        return _.unlink(uri.fsPath);
    }

    rename(
        oldUri: vscode.Uri,
        newUri: vscode.Uri,
        options: { overwrite: boolean }
    ): Thenable<void> {
        return this._rename(oldUri, newUri, options);
    }
    async _rename(
        oldUri: vscode.Uri,
        newUri: vscode.Uri,
        options: { overwrite: boolean }
    ): Promise<void> {
        const exists = await _.exists(newUri.fsPath);
        if (exists) {
            if (!options.overwrite) {
                throw vscode.FileSystemError.FileExists();
            } else {
                await _.rmrf(newUri.fsPath);
            }
        }
        const parentExists = await _.exists(path.dirname(newUri.fsPath));
        if (!parentExists) {
            await _.mkdir(path.dirname(newUri.fsPath));
        }
        return _.rename(oldUri.fsPath, newUri.fsPath);
    }
    readFile(uri: vscode.Uri): Promise<Uint8Array> {
        return _.readfile(uri.fsPath);
    }
    writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean; }): Thenable<void> {
        return this._writeFile(uri.fsPath, content, options);
    }
    async _writeFile(fsPath: string, content: Uint8Array, options: { create: boolean; overwrite: boolean; }) {
        const exists = await _.exists(fsPath);
        if (!exists) {
            if (!options.create) {
                throw vscode.FileSystemError.FileNotFound();
            }
            await _.mkdir(path.dirname(fsPath));
        } else {
            if (!options.overwrite) {
                throw vscode.FileSystemError.FileExists();
            }
        } 
        return _.writefile(fsPath, content as Buffer);
        
    } 
    getDirectoryPath(path: string): string {
        if(isWinOS()) {
            return path.slice(0, path.lastIndexOf('\\'));
        }
        return path.slice(0, path.lastIndexOf('/'));
    }
    stringToUnit8Array(s: string): Uint8Array {
        return Uint8Array.from(Buffer.from(s));
    }
    // tree data provider
    // 获取子树
    async getChildren(element?: Entry): Promise<Entry[]> {
        let uri: vscode.Uri = element ? element.uri : this.rootUri;

        // 没有element 就是根目录 创建根目录
        if (!element && !(await _.exists(uri.fsPath))) {
            this.createDirectory(this.rootUri);
            return [];
        }
        const children = await this.readDirectory(uri);
        children.sort((a, b) => {
            if (a[1] === b[1]) {
                return a[0].localeCompare(b[0]);
            }
            return a[1] === vscode.FileType.Directory ? -1 : 1;
        });
        return children
            .filter(([name, type]) => {
                return this.isJson(name) || type === vscode.FileType.Directory;
            })
            .map(([name, type]) => {
                return {
                    uri: vscode.Uri.file(path.join(uri.fsPath, name)),
                    type
                };
            });
    }
    // 每个节点处理
    getTreeItem(element: Entry): vscode.TreeItem {
        const isDirectory = element.type === vscode.FileType.Directory;
        let label = this.getFileName(element.uri.fsPath);
        let tooltip = '';
        let description = '';
        let time = '';
        if (!isDirectory) {
            try {
                const command: Command = JSON.parse(
                    fs.readFileSync(element.uri.fsPath, 'utf8')
                );
                if (command.script === undefined) {
                    throw new Error('unknown data');
                }
                label = (command.label ? command.label : command.script);
                tooltip = command.script;
                description =
                    command.script !== command.label ? command.script : '';
            } catch (error) {
                label = '';
            }
        }
        const treeItem = new vscode.TreeItem(
            label,
            isDirectory
                ? vscode.TreeItemCollapsibleState.Collapsed
                : vscode.TreeItemCollapsibleState.None
        );
        if (element.type === vscode.FileType.File) {
            treeItem.command = {
                command: `${this.viewId}.edit`,
                title: 'Edit',
                arguments: [element]
            };
            treeItem.contextValue = 'file';
            treeItem.description = description;
            treeItem.tooltip = tooltip;
        }
        return treeItem;
    }
    isJson(path: string): boolean {
        const index = path.lastIndexOf('.json');
        if (index === -1) {
            return false;
        }
        return path.length - index === 5;
    }
}
