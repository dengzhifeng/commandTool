/*
 * @description: 文件类
 * @author: steven.deng
 * @Date: 2022-02-28 07:44:38
 * @LastEditors: steven.deng
 * @LastEditTime: 2022-02-28 07:50:26
 */
import * as vscode from "vscode";
import * as fs from 'fs';

export class FileStat implements vscode.FileStat {
    constructor(private fsStat: fs.Stats) {

    }
    get type(): vscode.FileType {
        return this.fsStat.isFile() ? vscode.FileType.File : this.fsStat.isDirectory() ? vscode.FileType.Directory : this.fsStat.isSymbolicLink() ? vscode.FileType.SymbolicLink : vscode.FileType.Unknown;
    }
    get isFile(): boolean | undefined {
        return this.fsStat.isFile();
    }
    get isDirectory(): boolean | undefined {
        return this.fsStat.isDirectory();
    }
    get isSymbolicLink(): boolean | undefined {
        return this.fsStat.isSymbolicLink();
    }
    get size(): number {
        return this.fsStat.size;
    }
    get ctime(): number {
        return this.fsStat.ctime.getTime();
    }
    get mtime(): number {
        return this.fsStat.mtime.getTime();
    }
}
