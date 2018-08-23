import { VeoItem } from "api";
import { ID_FIELD, TITLE_FIELD, PARENT_FIELD } from "~/config/api";

export class TreeItem {
  id: string;
  expanded: boolean = false;
  checked: boolean | undefined = false;
  parent: string;
  title: string;

  constructor(
    public item: VeoItem,
    public level = 0,
    public hasChildren: boolean = false
  ) {
    this.id = item[ID_FIELD];
    this.title = item[TITLE_FIELD];
    this.parent = item[PARENT_FIELD];
  }
}
