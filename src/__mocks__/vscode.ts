/** Minimal vscode mock for unit tests */

let configValues: Record<string, any> = {};

export function __setConfigValues(values: Record<string, any>) {
  configValues = values;
}

export const workspace = {
  getConfiguration: (_section?: string) => ({
    get: <T>(key: string, defaultValue?: T): T => {
      return key in configValues ? configValues[key] : (defaultValue as T);
    },
  }),
};

export const window = {
  showWarningMessage: () => {},
  showErrorMessage: () => {},
  showInformationMessage: () => {},
  showQuickPick: () => Promise.resolve(undefined),
  withProgress: () => Promise.resolve(),
  activeTextEditor: undefined,
};

export const ProgressLocation = { Notification: 15 };
export const Uri = { file: (p: string) => ({ fsPath: p }) };
export const env = { openExternal: () => Promise.resolve() };
