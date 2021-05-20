export function getEditorData(editor: JQuery<HTMLElement>): any {
  return JSON.parse((editor as any)[0].cmView.view.state.toJSON().doc)
}
