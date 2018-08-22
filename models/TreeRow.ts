export default class TreeRow<T extends Object> {
  public level: number = 0;
  public hasChildren: boolean = false;
  public children: T[] = [];
  private _expanded: boolean = false;
  private _checked: boolean = false;

  constructor(
    public item: T,
    private eventHandler: (eventName: string) => void
  ) {
    //console.log("INIT");
  }

  get expanded() {
    return this._expanded;
  }

  set expanded(val: boolean) {
    this._expanded = val;
    console.log("SET EXPANDED", val);
    this.eventHandler("expanded");
  }

  get checked() {
    return this._checked;
  }

  set checked(val: boolean) {
    this._checked = val;
    this.eventHandler("checked");
  }
}
