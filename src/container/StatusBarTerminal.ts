/*
 * @description: 终端类
 * @author: steven.deng
 * @Date: 2022-01-31 17:39:04
 * @LastEditors: steven.deng
 * @LastEditTime: 2022-02-13 22:26:18
 */
import * as vscode from 'vscode';
import { MyTerminalOptions } from '../type/common';

/**
 * @description 终端
 * @property {number} terminalIndex 终端下标
 * @property {object} terminalOptions 配置参数
 * @property {boolean} terminalCreate 默认生成terminal
 * 具体参数可阅读: https://code.visualstudio.com/api/references/vscode-api#TerminalOptions
 * */ 

export class StatusBarTerminal {
    private _item: vscode.StatusBarItem;
    private _terminal: vscode.Terminal | undefined;
    public terminalName: string | undefined;
    public terminalIndex: number | undefined;
    constructor(terminalIndex: number, terminalOptions: MyTerminalOptions, terminalCreate: boolean = true) {
        this.terminalIndex = terminalIndex;
        this.terminalName = terminalOptions?.terminalName;
        this._item = vscode.window.createStatusBarItem();
        this.setTerminalIndex(terminalIndex);
        this._item.show();
        if (terminalCreate) {
            // 创建终端
            this._terminal = vscode.window.createTerminal({
                cwd: terminalOptions?.terminalCwd, // 当前工作目录
                name: terminalOptions?.terminalName // 终端命名
            });
             
            // 设置终端命令和启动
            if (terminalOptions?.terminalAutoInputText) {
                if (terminalOptions?.terminalText) {
                    this._terminal.sendText(
                        terminalOptions.terminalText,
                        terminalOptions.terminalAutoRun
                    );
                }
            }
            this._terminal.show();
        }

    }
    //设置终端索引
    public setTerminalIndex(index: number): void {
        this._item.text = `$(terminal)${index + 1}`;
    }

    // 展示终端
    public show(): void {
        this._terminal?.show();
    }

    // 更新终端
    public updateTerminal(terminal: vscode.Terminal | undefined) {
        if (terminal) {
            this._terminal = terminal;
        }
    } 

    // 判断某个个终端是否存在
    public hasTerminal(terminal: vscode.Terminal): boolean {
        return this._terminal === terminal;
    }

    // 释放终端
    public dispose(): void {
        this._item.dispose();
        this._terminal?.dispose();
    }
}