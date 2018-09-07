import { VeoItem } from "api";
import { ID_FIELD, TITLE_FIELD, PARENT_FIELD, TYPE_FIELD } from "~/config/api";

export class TreeItem {
  id: string;
  expanded: boolean = false;
  checked: boolean | undefined = false;
  parent: string;
  title: string;
  type: string;

  constructor(
    public item?: VeoItem,
    public level = 0,
    public hasChildren: boolean = false
  ) {
    if (item) {
      this.id = item[ID_FIELD] || "";
      this.title = item[TITLE_FIELD];
      this.parent = item[PARENT_FIELD];
      this.type = item[TYPE_FIELD];
    }
  }
}
