declare module "infinite-tree" {
  export type InfiniteTreeEvent =
    | "click"
    | "doubleClick"
    | "keyDown"
    | "keyUp"
    | "clusterWillChange"
    | "clusterDidChange"
    | "contentWillUpdate"
    | "contentDidUpdate"
    | "openNode"
    | "closeNode"
    | "selectNode"
    | "checkNode"
    | "willOpenNode"
    | "willCloseNode"
    | "willSelectNode"
    | "willCheckNode";

  export interface IInfiniteTreeDroppableOptions {
    /**
     * If specified, the class will be added to the droppable while an acceptable draggable is being hovered over the droppable.
     */
    hoverClass?: string;
    /**
     * Controls which draggable elements are accepted by the droppable.
     */
    accept?: (
      event: Event,
      options: {
        type: "dragenter" | "drop";
        draggableTarget: HTMLElement;
        droppableTarget: HTMLElement;
        node: IInfiniteTreeNode;
      }
    ) => boolean;
    /**
     * Triggered when an accepted draggable is dropped on the droppable.
     */
    drop?: (
      event: Event,
      options: {
        draggableTarget: HTMLElement;
        droppableTarget: HTMLElement;
        node: IInfiniteTreeNode;
      }
    ) => boolean;
  }

  type ErrorFirstCallback = (
    error: Error,
    nodes: IInfiniteTreeNode[],
    complete?: () => void
  ) => void;

  export interface IInfiniteTreeData {
    id: string;
    name: string;
  }

  export interface IInfiniteTreeNode extends IInfiniteTreeData {
    /**
     * Returns a boolean value indicating whether a node is a descendant of a given node or not.
     * @param node Specifies the node that may be contained by (a descendant of) a specified node.
     */
    contains(node: IInfiniteTreeNode): boolean;

    /**
     * Gets a child node at the specified index.
     * @param index The index of the child node.
     */
    getChildAt(index: number): IInfiniteTreeNode | null;

    /**
     * Gets the child nodes.
     * @returns Returns an array of Node objects containing the child nodes.
     */
    getChildren(): IInfiniteTreeNode[];

    /**
     * Gets the first child node.
     * @returns Returns a Node object of the first child, null otherwise.
     */
    getFirstChild(): IInfiniteTreeNode | null;

    /**
     * Gets the last child node.
     * @returns Returns a Node object of the last child, null otherwise.
     */
    getLastChild(): IInfiniteTreeNode | null;

    /**
     * Gets the next sibling node.
     * @returns Returns a Node object of the next sibling, null otherwise.
     */
    getNextSibling(): IInfiniteTreeNode | null;

    /**
     * Gets the parent node.
     * @returns Returns a Node object of the parent, null otherwise.
     */
    getParent(): IInfiniteTreeNode | null;

    /**
     * Gets the previous sibling node.
     * @returns Returns a Node object of the previous sibling, null otherwise.
     */
    getPreviousSibling(): IInfiniteTreeNode | null;

    /**
     * Checks whether this node has children.
     * @returns Returns true if the node has children, false otherwise.
     */
    hasChildren(): boolean;

    /**
     * Checks whether this node is the last child of its parent.
     * @returns Returns true if the node is the last child of its parent, false otherwise.
     */
    isLastChild(): boolean;
  }

  export interface IInfiniteTreeOptions {
    /**
     * The DOM element for rendering a tree.
     * @default null
     */
    el: Element;
    /**
     * Uses div or table for layout in HTML.
     * @default 'div'
     */
    layout?: "div" | "table";
    data: IInfiniteTreeData | IInfiniteTreeData[];
    /**
     * Sets to true to open all nodes.
     * @default false
     */
    autoOpen?: boolean;
    /**
     * Makes tree nodes droppable.
     * @default false
     */
    droppable?: IInfiniteTreeDroppableOptions | boolean;
    /**
     * A custom function to determine whether to load nodes on demand.
     */
    shouldLoadNodes?: (parentNode: IInfiniteTreeNode) => boolean;
    loadNodes?: (
      parentNode: IInfiniteTreeNode,
      next: ErrorFirstCallback
    ) => void;
    /**
     * @default 'infinite-tree-no-data'
     */
    noDataClass?: string;
    /**
     * @default "No data"
     */
    noDataText?: string;
    /**
     * @default "data-id"
     */
    nodeIdAttr?: string;
    /**
     * A custom row renderer that returns a HTML string.
     * @see {@link 'infinite-tree/src/renderer.js'}
     */
    rowRenderer?: (
      node: IInfiniteTreeNode,
      treeOptions: IInfiniteTreeOptions
    ) => HTMLElement | string;

    /**
     * Makes tree nodes selectable.
     * @default true
     */
    selectable?: boolean;

    /**
     * Provides a function to determine if a node can be selected or deselected. The function must return true or false. For this to work, the option selectable must be true.
     * @default null
     */
    shouldSelectNode?: (node: IInfiniteTreeNode) => boolean;

    /**
     * @default 'infinite-tree-toggler'
     */
    togglerClass?: string;
  }

  export default class InfiniteTree {
    constructor(options: IInfiniteTreeOptions);

    /**
     * Adds an array of new child nodes to a parent node at the specified index.
     * @param newNodes
     * @param index The 0-based index of where to insert the child node.
     * @param parentNode The Node object that defines the parent node.
     *
     * @returns Returns true on success, false otherwise.
     */
    addChildNodes(
      newNodes: any[],
      index?: number,
      parentNode?: IInfiniteTreeNode
    ): boolean;

    /**
     * Adds a new child node to the end of the list of children of a specified parent node.
     * - If the parent is null or undefined, inserts the child at the specified index in the top-level.
     * - If the parent has children, the method adds the child as the last child.
     * - If the parent does not have children, the method adds the child to the parent.
     *
     * @param newNode The new child node.
     * @param parentNode The Node object that defines the parent node.
     *
     * @returns Returns true on success, false otherwise.
     */
    appendChildNode(
      newNode: IInfiniteTreeData,
      parentNode: IInfiniteTreeNode
    ): void;
    /**
     * Checks or unchecks the node.
     * @param node The Node object.
     * @param checked Whether to check or uncheck the node. If not specified, it will toggle between checked and unchecked state.
     */
    checkNode(node: IInfiniteTreeNode, checked?: boolean): void;
    /**
     * Clears the tree.
     */
    clear(): void;
    /**
     * Closes a node to hide its children.
     * @param node The Node object.
     * @param options The options object.
     */
    closeNode(
      node: IInfiniteTreeNode,
      options?: {
        /**
         * Sets true to prevent "closeNode" event from being triggered.
         */
        silent: boolean;
      }
    ): void;
    /**
     * Filters nodes. Use a string or a function to test each node of the tree. Otherwise, it will render nothing after filtering (e.g. tree.filter(), tree.filter(null), tree.flter(0), tree.filter({}), etc.).
     * @param predicate A keyword string, or a function to test each node of the tree. If the predicate is an empty string, all nodes will be filtered. If the predicate is a function, returns true to keep the node, false otherwise.
     * @param options The options object.
     */
    filter(
      predicate: string | ((node: IInfiniteTreeNode) => boolean),
      options?: {
        /**
         * Case sensitive string comparison. Defaults to false. This option is only available for string comparison.
         * @default false
         */
        caseSensitive: boolean;
        /**
         * Exact string matching. Defaults to false. This option is only available for string comparison.
         * @default false
         */
        exactMatch: boolean;
        /**
         * Gets the value at path of Node object. Defaults to 'name'. This option is only available for string comparison.
         * @default 'name'
         */
        filterPath: string;
        /**
         * Whether to include ancestor nodes. Defaults to true.
         * @default true
         */
        includeAncestors: boolean;
        /**
         * Whether to include descendant nodes. Defaults to true.
         * @default true
         */
        includeDescendants: boolean;
      }
    ): void;
    /**
     * Flattens all child nodes of a parent node.
     * @param parentNode The Node object that defines the parent node.
     */
    flattenChildNodes(parentNode: IInfiniteTreeNode): IInfiniteTreeNode[];
    /**
     * Flattens a node.
     * @param node The Node object.
     */
    flattenNode(node: IInfiniteTreeNode): IInfiniteTreeNode[];
    /**
     * Gets a list of child nodes.
     * @param parentNode The Node object that defines the parent node. If null or undefined, returns a list of top level nodes.
     */
    getChildNodes(parentNode: IInfiniteTreeNode): IInfiniteTreeNode[];
    /**
     * Gets a node by its unique id. This assumes that you have given the nodes in the data a unique id.
     * @param id An unique node id. A null value will be returned if the id doesn't match.
     */
    getNodeById(id: number | string): IInfiniteTreeNode | null;
    /**
     * Returns the node at the specified point. If the specified point is outside the visible bounds or either coordinate is negative, the result is null.
     * @param x A horizontal position within the current viewport.
     * @param y A vertical position within the current viewport.
     */
    getNodeFromPoint(x: number, y: number): IInfiniteTreeNode | null;
    /**
     * Gets an array of open nodes.
     */
    getOpenNodes(): IInfiniteTreeNode[];
    /**
     * Returns the root node, or null if empty.
     */
    getRootNode(): IInfiniteTreeNode;
    /**
     * Returns the index of the selected node, or -1 if not selected.
     */
    getSelectedIndex(): number | -1;
    /**
     * Returns the selected node, or null if not selected.
     */
    getSelectedNode(): IInfiniteTreeNode | null;
    /**
     * Inserts the specified node after the reference node.
     * @param newNode The new sibling node.
     * @param referenceNode  The Node object that defines the reference node.
     */
    insertNodeAfter(
      newNode: IInfiniteTreeData,
      referenceNode: IInfiniteTreeNode
    ): boolean;
    /**
     * Inserts the specified node before the reference node.
     * @param newNode The new sibling node.
     * @param referenceNode  The Node object that defines the reference node.
     */
    insertNodeBefore(
      newNode: IInfiniteTreeData,
      referenceNode: IInfiniteTreeNode
    ): boolean;
    /**
     * Loads data in the tree.
     * @param data The data is an object or array of objects that defines the node.
     */
    loadData(data: IInfiniteTreeData | IInfiniteTreeData[]): void;
    /**
     * Moves a node from its current position to the new position.
     * @param node The Node object.
     * @param parentNode  The Node object that defines the parent node.
     * @param index The 0-based index of where to insert the child node.
     */
    moveNodeTo(
      node: IInfiniteTreeNode,
      parentNode: IInfiniteTreeNode,
      index?: number
    ): boolean;
    /**
     * Opens a node to display its children.
     * @param node The Node object.
     * @param options The options object.
     */
    openNode(
      node: IInfiniteTreeNode,
      options: {
        /**
         * Sets true to prevent "openNode" event from being triggered.
         */
        silent: boolean;
      }
    ): void;
    /**
     * Removes all child nodes from a parent node.
     * @param parentNode The Node object that defines the parent node.
     */
    removeChildNodes(parentNode: IInfiniteTreeNode): boolean;
    /**
     * Removes a node and all of its child nodes.
     * @param node The Node object.
     */
    removeNode(node: IInfiniteTreeNode): boolean;
    /**
     * Sets the current scroll position to this node.
     * @param node
     */
    scrollToNode(node: IInfiniteTreeNode): boolean;
    /**
     * Returns the vertical scroll position.
     */
    scrollTop(): void;
    /**
     * If the value is specified, indicates the new position to set the scroll bar to.
     */
    scrollTop(value?: number): void;
    /**
     * Selects a node.
     * @param node The Node object. If null or undefined, deselects the current node.
     * @param options The options object.
     */
    selectNode(
      node: IInfiniteTreeNode | null | undefined,
      options: {
        /**
         * Sets true to automatically scroll to the selected node. Defaults to true.
         */
        autoScroll: boolean;
        /**
         * Sets true to prevent "selectNode" event from being triggered. Defaults to false.
         */
        silent: boolean;
      }
    ): boolean;
    /**
     * Swaps two nodes.
     * @param node1 The Node object.
     * @param node2 The Node object.
     */
    swapNodes(node1: IInfiniteTreeNode, node2: IInfiniteTreeNode): boolean;
    /**
     * Toggles a node to display or hide its children.
     * @param node The Node object.
     * @param options
     */
    toggleNode(
      node: IInfiniteTreeNode,
      options: {
        /**
         * Sets true to prevent "closeNode", "openNode", and "selectNode" events from being triggered.
         */
        silent: boolean;
      }
    ): void;
    /**
     * Serializes the current state of a node to a JSON string.
     * @param node The Node object. If null, returns the whole tree.
     */
    toString(node?: IInfiniteTreeNode | null): string;
    /**
     * Unfilter nodes.
     */
    unfilter(): void;
    /**
     * Updates the tree.
     */
    update(): void;
    /**
     * Updates the data of a node.
     * @param node The Node object.
     * @param data The data object.
     * @param options The options object.
     */
    updateNode(
      node: IInfiniteTreeNode,
      data: IInfiniteTreeData,
      options: {
        /**
         * Sets true to render only the node without expanded child nodes.
         */
        shallowRendering: boolean;
      }
    ): void;

    /**
     * The click event is fired on mouse click.
     */
    on(eventName: "click", callback: (event: MouseEvent) => void): void;

    /**
     * Fired when a node is closed.
     */
    on(eventName: "closeNode", callback: (node: Node) => void): void;

    /**
     * Triggered when the clusters were changed.
     */
    on(eventName: "clusterDidChange", callback: () => void): void;

    /**
     * Triggered before updating clusters.
     */
    on(eventName: "clusterWillChange", callback: () => void): void;

    /**
     * Triggered when the tree is updated.
     */
    on(eventName: "contentDidUpdate", callback: () => void): void;

    /**
     * Triggered before updating the tree.
     */
    on(eventName: "contentWillUpdate", callback: () => void): void;

    /**
     * The click event is fired on mouse click.
     */
    on(eventName: "doubleClick", callback: (event: MouseEvent) => void): void;

    /**
     * Triggered when the keydown event is fired.
     */
    on(eventName: "keyDown", callback: (event: KeyboardEvent) => void): void;

    /**
     * Triggered when the keyup event is fired.
     */
    on(eventName: "keyUp", callback: (event: KeyboardEvent) => void): void;

    /**
     * Fired when a node is opened.
     */
    on(
      eventName: "openNode",
      callback: (node: IInfiniteTreeNode) => void
    ): void;

    /**
     * Fired when a node is selected or deselected.
     */
    on(
      eventName: "selectNode",
      callback: (node: IInfiniteTreeNode) => void
    ): void;

    /**
     * Fired before closing a node.
     */
    on(
      eventName: "willCloseNode",
      callback: (node: IInfiniteTreeNode) => void
    ): void;

    /**
     * Fired before opening a node.
     */
    on(
      eventName: "willOpenNode",
      callback: (node: IInfiniteTreeNode) => void
    ): void;

    /**
     * Fired before selecting or deselecting a node.
     */
    on(
      eventName: "willSelectNode",
      callback: (node: IInfiniteTreeNode) => void
    ): void;
  }
}
