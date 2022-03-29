# CommandTool
[![MarketPlace](https://vsmarketplacebadge.apphb.com/version/stevendeng.commandTool.svg)](https://marketplace.visualstudio.com/items?itemName=stevendeng.commandTool)
[![Installs](https://vsmarketplacebadge.apphb.com/installs-short/stevendeng.commandTool.svg)](https://marketplace.visualstudio.com/items?itemName=stevendeng.commandTool)
[![author](https://img.shields.io/badge/author-@stevendeng-green.svg)](https://marketplace.visualstudio.com/items?itemName=stevendeng.commandTool)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://marketplace.visualstudio.com/items/stevendeng.commandTool/license)


This is an extension to quickly execute project commands, which can be run with the click of a button. It also supports custom project commands, global project commands, and one-click run commands. Solve the pain point that everyone can't remember the command, and you can run the command with the click of the mouse. At the same time, the copy command is supported, which can be copied to other terminals for running.



## Features

### en:
- Run commands with one click
- Automatically obtain project commands and display them in the form of a file directory tree
- Customize commands in the project, support adding, deleting, and modifying
- Set the global workspace command of vscode


## Usage
### Project-Command 
Automatically get project commands, display them as a file directory tree, and click the Run button to run the commands.
![navigation](resources/readme/projectaCommand.png)
![project-commandlist](resources/readme/execute-com.gif)

Configuring the open vscode terminal information, there are currently three configurations available, which temporarily only act on project-Command tabs.
```
"commandTool.splitTerminal": {
    "description": "Whether split terminals are supported, supported by default",
    "default": true,
},
"commandTool.autoRunTerminal": {
    "description": "Whether the script runs automatically, it runs automatically by default",
    "default": true,
},
"commandTool.TreeItemCollapsibleState": {
    "description": "Whether to collapse the command list",
    "default": false,
}
```
settings.json demonstration：
```
  "commandTool.splitTerminal": false,
  "commandTool.autoRunTerminal": true,
  "commandTool.TreeItemCollapsibleState": false,
```

## WorkSpace-Command
Customize the commands in the current working project directory, and the new commands will be saved in the current workspace or the current project


- Add Command 
- Add Folder 
- Update Explorer


![workspacecommand](resources/readme/workspacecommand.jpg)
Add Command
Add Folder
![project-commandlist](resources/readme/add-com.gif)
Run Custom Command 
![project-commandlist](resources/readme/custom-com.gif)


## Command Menu

- Copy Command
- Delete
- Edit Command
- Edit Label


![menu](resources/readme/menu.jpg)

Commands can be copied, command labels can be edited, commands can be categorized more clearly, and explanations can be added to each command.

![menu](resources/readme/edit-com.gif)

## Global-Command
Custom commands can be added, which will be saved in the global space of vscode and can be used by any project.

## Github
If you feel good, welcome to star🌟, thank you very much 🙏

[https://github.com/dengzhifeng/commandTool](https://github.com/dengzhifeng/commandTool)


-----------------------------------------------------------------------------------------------------------
## License
MIT

**Happy Coding!**  

