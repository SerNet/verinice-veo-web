import { VeoItem, ItemId } from "~/types/api";

export interface Element {
  id: ItemId;
  title: string;
  parent?: ItemId;
  type: string;
  data: VeoItem;
}

type ElementMap = Record<ItemId, Element>;
type ElementIdsMap = Record<ItemId, ItemId[]>;
