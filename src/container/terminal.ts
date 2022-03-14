/*
 * @description: 终端共有方法
 * @author: steven.deng
 * @Date: 2022-03-13 11:04:47
 * @LastEditors: steven.deng
 * @LastEditTime: 2022-03-15 07:36:16
 */
import * as vscode from 'vscode';
import { MyTerminalOptions, ShellType } from '../type/common';
import { PREFIX } from '../constants';
import { getPathHack, getWorkSpaceFolders, uniqBy } from '../utils';
import { StatusBarTerminal } from './StatusBarTerminal';

// 最大终端数量
const MAX_TERMINALS = 10;
// 终端数组
let terminals: StatusBarTerminal[] = [];
// 终端数量
let terminalCount = 0;
// 当前终端索引
let terminalIndex: number;

// 终端处理
export async function dealTerminal(context: vscode.ExtensionContext, args: { title: string; shell: ShellType; [key: string]: any }) {
        console.log('SideBar-Command.openChild', args);
        const { label, shell = null, path, projectName } = args;
        const reg = new RegExp(PREFIX);
        if (reg.test(label)) {
            vscode.window.showErrorMessage(label);
        } else {
            // 获取用户配置是否分割终端设置
            const splitTerminal = vscode.workspace.getConfiguration().get('commandTool.splitTerminal') || false;
            // 获取用户配置的是否自动运行脚本
            const autoRunTerminal: boolean = vscode.workspace.getConfiguration().get('commandTool.autoRunTerminal') || false;

            // 填充脚本、支持分配、自动运行脚本、多项目终端切换
            // 1.1 获取当前所以运行的终端数量
            const uniqTerminals = uniqBy(terminals, 'terminalName');
            // 1.2 尝试获取当前点击的项目脚本是否存在终端实例
            const currentProjectTerminal = uniqTerminals.find((t) => {
                return t.terminalName === projectName;
            });
            // 1.3 如果当前的项目脚本并不存在终端实例，新增
            if (!currentProjectTerminal) {
                addTerminal(path, projectName, shell, autoRunTerminal);
            } 

            // 1.4 当前项目脚本存在终端实例
            if (currentProjectTerminal) {
                // 1.4.1 用户设置不需要分屏, 则新增
                if (!splitTerminal) {
                    addTerminal(path, projectName, shell, autoRunTerminal);
                } else {
                    // 分屏
                    currentProjectTerminal?.show(); //  先展开当前的终端
                    await createNewSplitTerminal(terminalCount++, {
                        terminalCwd: getPathHack(path),
                        terminalName: projectName,
                        terminalText: `npm run ${shell?.key}`,
                        terminalAutoInputText: true,
                        terminalAutoRun: autoRunTerminal,
                    });
                }
            }
            // vscode.commands.registerCommand是注册命令的API，执行后会返回一个Disposable对象，
            // 所有注册类的API执行后都需要将返回结果放到context.subscriptions中去。

            // 订阅关闭终端方法
            context.subscriptions.push(vscode.window.onDidCloseTerminal(onDidCloseTerminal));
        } 
}

// 增加终端
function addTerminal(path: string, projectName: any, shell: ShellType | null, autoRunTerminal: boolean) {
    terminals.push(
        new StatusBarTerminal(terminalCount++, {
            terminalCwd: getPathHack(path),
            terminalName: projectName,
            terminalText: `npm run ${shell?.key}`,
            terminalAutoInputText: true,
            terminalAutoRun: autoRunTerminal
        })
    );
}

// 创建分割拆分终端
async function createNewSplitTerminal(terminalIndex: number, terminalOptions: MyTerminalOptions): Promise<vscode.Terminal> {
    return new Promise(async () => {
        // 通过命令创建的终端是默认的终端信息，暂未发现此命令可以通过传参配置生成的命令
        // 解决方案就是构造一个StatusBarTerminal实例，再updateTerminal
        await vscode.commands.executeCommand('workbench.action.terminal.split'); // 终端切割
        const activeTerminal = vscode.window.activeTerminal; // 此时激活的终端就是当前分屏后的， 然后设置一个新的终端 指向这个分屏的终端
        const splitInstance = new StatusBarTerminal(terminalIndex, terminalOptions, false);
        if (activeTerminal && terminalOptions?.terminalAutoInputText && terminalOptions?.terminalText) {
            activeTerminal.sendText(
                terminalOptions.terminalText,
                terminalOptions.terminalAutoRun
            );
        }
        splitInstance.updateTerminal(activeTerminal); // 新建的这个终端的this指向 activeTerminal
        terminals.push(splitInstance);
    });
}

/**
 * @description 关闭终端执行
 * @param terminal: 当前关闭的终端
 *  */ 
 function onDidCloseTerminal(terminal: vscode.Terminal): void {
    terminals.forEach((eachTerminal: StatusBarTerminal, index) => {
        // 找到当前终端的索引
        if (eachTerminal.hasTerminal(terminal)) {
            terminalIndex = index;
        }
    });
    terminals[terminalIndex]?.dispose(); // 关闭当前的终端
    terminals.splice(terminalIndex, 1); // 删除关闭的终端
    // 设置下终端的索引文案
    terminals.forEach((eachTerminal: StatusBarTerminal, i) => {
        terminals[i].setTerminalIndex(i);
    });
    // 终端数量-1
    terminalCount--;
};