import * as vscode from "vscode";
import { Commands } from "../../types/command";
import { SpockeeApplicationData } from "../../types/data";
import { Argument } from "./Arguments";
import { Command } from "./Command";
import { CommandsSeparator } from "./CommandsSeparator";
import { SettingsSeparator } from "./SettingsSeparator";

export class SpockeeCLITree
  implements
    vscode.TreeDataProvider<
      Command | Argument | SettingsSeparator | CommandsSeparator
    > {
  private cliCommands: Commands;

  constructor(spockeeApplicationData: SpockeeApplicationData) {
    this.cliCommands = spockeeApplicationData.cliCommands;
  }

  private _onDidChangeTreeData: vscode.EventEmitter<
    | Command
    | Argument
    | SettingsSeparator
    | CommandsSeparator
    | undefined
    | null
    | void
  > = new vscode.EventEmitter<Command | undefined | null | void>();

  readonly onDidChangeTreeData: vscode.Event<
    | Command
    | Argument
    | SettingsSeparator
    | CommandsSeparator
    | undefined
    | null
    | void
    // eslint-disable-next-line no-invalid-this
  > = this._onDidChangeTreeData.event;

  refreshWith(spockeeApplicationData: SpockeeApplicationData) {
    this.cliCommands = spockeeApplicationData.cliCommands;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Command): vscode.TreeItem {
    return element;
  }

  getChildren(
    element: Command
  ): Thenable<[SettingsSeparator, ...Command[]] | Argument[]> {
    if (element?.children) return Promise.resolve(element.children);

    return Promise.resolve([
      new SettingsSeparator(),
      ...Object.values(this.cliCommands)
        .filter((command) => command.code)
        .map(
          (command) =>
            new Command(
              command,
              Object.values(command.arguments)
                .filter((argument) => argument.code)
                .map(
                  (argument) =>
                    new Argument({
                      commandName: command.name,
                      ...argument,
                    })
                ),
              vscode.TreeItemCollapsibleState.Collapsed
            )
        )
        .filter((command) => command.children.length !== 0),
    ]);
  }
}
