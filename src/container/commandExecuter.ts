/*
 * @description: 
 * @author: steven.deng
 * @Date: 2022-03-13 10:37:28
 * @LastEditors: steven.deng
 * @LastEditTime: 2022-03-13 22:13:09
 */
import * as vscode from 'vscode';
import * as fs from 'fs';
import { Entry } from '../type/common';
import { Command } from '../type/common';
import { dealTerminal } from './terminal';

export class CommandExecuter {

  constructor(viewId: string, context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand(`${viewId}.execute`, 
      (element: Entry) => {
        this.executeCommand(element);
      }
    ));
  }

  private executeCommand(element: Entry){
    const command: Command = JSON.parse(fs.readFileSync(element.uri.fsPath, 'utf8'));
    // 没有终端就创建一个
    this.ensureTerminalExists();
    if(vscode.window.terminals.length === 1){
      // 用刚才创建的终端或者本来打开的第一个终端
      const terminal = vscode.window.terminals[0];
      terminal.show();
      console.log(`execute $ ${command.script}`);
      terminal.sendText(command.script ? command.script : '');
    } else {
      // 选择一个终端再打开
      this.selectTerminal().then(terminal => {
        if (terminal) {
          terminal.show();
          console.log(`execute $ ${command.script}`);
          terminal.sendText(command.script ? command.script : '');
        } else {
          console.error('Selected Terminal is not exist');
          vscode.window.showErrorMessage('Sorry, Unexpected error has occurred.');
        }
      });
    }
  }

  // 拿到window.termianls 用来给用户选择 选完再操作
  private selectTerminal(): Thenable<vscode.Terminal | undefined> {
    interface TerminalQuickPickItem extends vscode.QuickPickItem {
      terminal: vscode.Terminal;
    }
    const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
    const items: TerminalQuickPickItem[] = terminals.map(terminal => {
      return {
        label: `${terminal.name}`,
        terminal: terminal
      };
    });
    return vscode.window.showQuickPick(items).then(item => {
      return item ? item.terminal : undefined;
    });
  }
  
  private ensureTerminalExists(): void {
    if (vscode.window.terminals.length === 0) {
      vscode.window.createTerminal('Command List');
    }
  }
  
}