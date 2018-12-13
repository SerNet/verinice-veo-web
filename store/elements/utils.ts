import { ID_FIELD, PARENT_FIELD, TITLE_FIELD, TYPE_FIELD } from "~/config/api";
import { VeoItem } from "~/types/api";
import { Element } from "~/store/elements/index.d.ts";
import { uniqueId } from "lodash";

export function veoItemToElement(item: VeoItem): Element {
  const id = item[ID_FIELD] || uniqueId("element_");
  return { id, title: item[TITLE_FIELD], parent: item[PARENT_FIELD], type: item[TYPE_FIELD], data: item };
}

export function titleComparator(a: Element, b: Element) {
  return String(a.title).localeCompare(b.title);
}
