export function getEditorData(editor: JQuery<HTMLElement>): any {
  return JSON.parse((editor as any)[0].cmView.view.state.toJSON().doc);
}

export interface ITo {
  requestUrlPattern: RegExp | string;
  fixturePath: string;
  browserUrl: string;
}

// helper function which infers keys and restricts values to ITo
export const generateTos = <T>(obj: { [K in keyof T]: ITo }) => obj;
