import { VeoItem, ItemId } from "~/types/api";

export interface Element {
  id: ItemId;
  title: string;
  parent?: ItemId;
  type: string;
  data: VeoItem;
}

export type ElementMap = Record<ItemId, Element>;
export type ElementsMap = Record<ItemId, Element[]>;
