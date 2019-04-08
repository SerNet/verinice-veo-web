import { ID_FIELD, PARENT_FIELD, TITLE_FIELD, TYPE_FIELD } from "~/config/api";
import { ApiItem, ApiLink } from "~/types/api";
import { AppElement, AppLink } from "~/types/app";
import { uniqueId } from "lodash";

export function veoItemToElement(item: ApiItem): AppElement {
  const id = item[ID_FIELD] || uniqueId("element_");
  return { id, title: item[TITLE_FIELD], parent: item[PARENT_FIELD], type: item[TYPE_FIELD], data: item };
}

export function veoLinkToLink(item: ApiLink): AppLink {
  return { id: item[ID_FIELD], type: item[TYPE_FIELD], sourceId: item.source, targetId: item.target };
}

export function titleComparator(a: AppElement, b: AppElement) {
  return String(a.title).localeCompare(b.title);
}
