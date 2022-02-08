/*
 * @description: 插件入口文件
 * @author: steven.deng
 * @Date: 2022-01-30 22:43:39
 * @LastEditors: steven.deng
 * @LastEditTime: 2022-01-31 17:45:16
 */

import * as vscode from 'vscode';
import container from './container';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "commandtool" is now active!');

	let disposable = vscode.commands.registerCommand('commandtool.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from commandTool!');
	});
	context.subscriptions.push(disposable);

	container(context);
}

// this method is called when your extension is deactivated
export function deactivate() {}
