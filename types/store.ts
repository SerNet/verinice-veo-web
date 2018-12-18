/**
 * @see: https://github.com/vuejs/vuex/pull/1121
 */

import _Vue, { WatchOptions } from "vue";
import { createNamespacedHelpers } from "vuex";
/**
 * Utility types to declare helper types
 */
type Computed<R> = () => R;
type Method<R> = (...args: any[]) => R;
type CustomVue = _Vue & Record<string, any>;

interface BaseType {
  [key: string]: any;
}

interface BaseStateMap<State, Getters> {
  [key: string]: (this: CustomVue, state: State, getters: Getters) => any;
}

interface BaseMethodMap<F> {
  [key: string]: (this: CustomVue, fn: F, ...args: any[]) => any;
}

type MethodType = "optional" | "normal";

/**
 * Return component method type for a mutation.
 * You can specify `Type` to choose whether the argument is optional or not.
 */
type MutationMethod<P, Type extends MethodType> = {
  optional: (payload?: P) => void;
  normal: (payload: P) => void;
}[Type];

/**
 * Return component method type for an action.
 * You can specify `Type` to choose whether the argument is optional or not.
 */
type ActionMethod<P, Type extends MethodType> = {
  optional: (payload?: P) => Promise<any>;
  normal: (payload: P) => Promise<any>;
}[Type];

/**
 * mapGetters
 */
interface MapGetters<Getters> {
  <Key extends keyof Getters>(map: Key[]): { [K in Key]: Computed<Getters[K]> };

  <Map extends Record<string, keyof Getters>>(map: Map): {
    //@ts-ignore
    [K in keyof Map]: Computed<Getters[Map[K]]>
  };
}

interface RootMapGetters<Getters> extends MapGetters<Getters> {
  <Key extends keyof Getters>(namespace: string, map: Key[]): { [K in Key]: Computed<Getters[K]> };

  <Map extends Record<string, keyof Getters>>(namespace: string, map: Map): {
    //@ts-ignore
    [K in keyof Map]: Computed<Getters[Map[K]]>
  };
}

/**
 * mapState
 */
interface MapState<State, Getters> {
  <Key extends keyof State>(map: Key[]): { [K in Key]: Computed<State[K]> };

  <Map extends Record<string, keyof State>>(map: Map): {
    //@ts-ignore
    [K in keyof Map]: Computed<State[Map[K]]>
  };
  <Map extends BaseStateMap<State, Getters>>(map: Map): { [K in keyof Map]: Computed<any> };
}

interface RootMapState<State, Getters> extends MapState<State, Getters> {
  <Key extends keyof State>(namespace: string, map: Key[]): { [K in Key]: Computed<State[K]> };

  <Map extends Record<string, keyof State>>(namespace: string, map: Map): {
    //@ts-ignore
    [K in keyof Map]: Computed<State[Map[K]]>
  };
  <Map extends BaseStateMap<State, Getters>>(namespace: string, map: Map): { [K in keyof Map]: Computed<any> };
}

/**
 * mapMutations
 */
interface MapMutations<Mutations, Type extends MethodType> {
  <Key extends keyof Mutations>(map: Key[]): { [K in Key]: MutationMethod<Mutations[K], Type> };

  <Map extends Record<string, keyof Mutations>>(map: Map): {
    //@ts-ignore
    [K in keyof Map]: MutationMethod<Mutations[Map[K]], Type>
  };
  <Map extends BaseMethodMap<Commit<Mutations>>>(map: Map): { [K in keyof Map]: Method<any> };
}

interface RootMapMutations<Mutations, Type extends MethodType> extends MapMutations<Mutations, Type> {
  <Key extends keyof Mutations>(namespace: string, map: Key[]): { [K in Key]: MutationMethod<Mutations[K], Type> };

  <Map extends Record<string, keyof Mutations>>(namespace: string, map: Map): {
    //@ts-ignore
    [K in keyof Map]: MutationMethod<Mutations[Map[K]], Type>
  };
  <Map extends BaseMethodMap<Commit<Mutations>>>(namespace: string, map: Map): { [K in keyof Map]: Method<any> };
}

/**
 * mapActions
 */
interface MapActions<Actions, Type extends MethodType> {
  <Key extends keyof Actions>(map: Key[]): { [K in Key]: ActionMethod<Actions[K], Type> };

  <Map extends Record<string, keyof Actions>>(map: Map): {
    //@ts-ignore
    [K in keyof Map]: ActionMethod<Actions[Map[K]], Type>
  };
  <Map extends BaseMethodMap<Dispatch<Actions>>>(map: Map): { [K in keyof Map]: Method<any> };
}

interface RootMapActions<Actions, Type extends MethodType> extends MapActions<Actions, Type> {
  <Key extends keyof Actions>(namespace: string, map: Key[]): { [K in Key]: ActionMethod<Actions[K], Type> };

  <Map extends Record<string, keyof Actions>>(namespace: string, map: Map): {
    //@ts-ignore
    [K in keyof Map]: ActionMethod<Actions[Map[K]], Type>
  };
  <Map extends BaseMethodMap<Dispatch<Actions>>>(namespace: string, map: Map): { [K in keyof Map]: Method<any> };
}

/**
 * namespaced helpers
 */
interface NamespacedMappers<State, Getters, Mutations, Actions, Type extends MethodType> {
  mapState: MapState<State, Getters>;
  mapGetters: MapGetters<Getters>;
  mapMutations: MapMutations<Mutations, Type>;
  mapActions: MapActions<Actions, Type>;
}

/*
export declare const mapState: RootMapState<BaseType, BaseType>;

export declare const mapMutations: RootMapMutations<BaseType, "optional">;

export declare const mapGetters: RootMapGetters<BaseType>;

export declare const mapActions: RootMapActions<BaseType, "optional">;
*/
/*export declare function createNamespacedHelpers(
  namespace?: string
): NamespacedMappers<BaseType, BaseType, BaseType, BaseType, "optional">;
export declare function createNamespacedHelpers<State, Getters, Mutations, Actions>(
  namespace?: string
): NamespacedMappers<State, Getters, Mutations, Actions, "normal">;
*/
/**
 * Type level utility to annotate types of module state/getters/actions/mutations (module assets).
 * To use this helper, the user should declare corresponding assets type at first.
 *
 * A getters type should be an object that the keys indicate getter names
 * and its corresponding values indicate return types of the getter.
 *
 * Actions type and mutations type should be an object that the keys indicate
 * action/mutation names as same as the getters type.
 * Its values should be declared as payload types of the actions/mutation.
 *
 * After declare the above types, the user put them on the generic parameters
 * of the utility type. Then the real assets object must follow the passed types
 * and type inference will work.
 *
 * The declared types will be used on mapXXX helpers to safely use module assets
 * by annotating its types.
 */
export interface DefineModule<
  State,
  Getters,
  Mutations,
  Actions,
  ExtraGetters = {},
  ExtraMutations = {},
  ExtraActions = {},
  RootState = {},
  RootGetters = {},
  RootMutations = {},
  RootActions = {}
> extends Module<State, never> {
  getters?: DefineGetters<Getters, State, ExtraGetters, RootState, RootGetters>;
  mutations?: DefineMutations<Mutations, State>;
  actions?: DefineActions<
    Actions,
    State,
    Getters,
    Mutations & ExtraMutations,
    ExtraActions,
    RootState,
    RootGetters,
    RootMutations,
    RootActions
  >;
}

/**
 * Infer getters object type from passed generic types.
 * `Getters` is an object type that the keys indicate getter names and
 * its corresponding values are return types of the getters.
 * `State` is a module state type which is accessible in the getters.
 * `ExtraGetters` is like `Getters` type but will be not defined in the infered getters object.
 * `RootState` and `RootGetters` are the root module's state and getters type.
 */
export type DefineGetters<Getters, State, ExtraGetters = {}, RootState = {}, RootGetters = {}> = {
  [K in keyof Getters]: (
    state: State,
    getters: Getters & ExtraGetters,
    rootState: RootState,
    rootGetters: RootGetters
  ) => Getters[K]
};

/**
 * Infer mutations object type from passed generic types.
 * `Mutations` is an object type that the keys indicate mutation names and
 * its corresponding values are payload types of the mutations.
 * `State` is a module state type which will be mutated in the mutations.
 */
export type DefineMutations<Mutations, State> = {
  [K in keyof Mutations]: (state: State, payload: Mutations[K]) => void
};

/**
 * Infer actions object type from passed generic types.
 * `Actions` is an object type that the keys indicate action names and
 * its corresponding values are payload types of the actions.
 * `State`, `Getters`, `Mutations` are module state/getters/mutations type
 *  which can be accessed in actions.
 * `ExtraActions` is like `Actions` type but will be not defined in the infered actions object.
 * `RootState`, `RootGetters`, `RootMutations`, `RootActions` are the root module's asset types.
 */
export type DefineActions<
  Actions,
  State,
  Getters,
  Mutations,
  ExtraActions = {},
  RootState = {},
  RootGetters = {},
  RootMutations = {},
  RootActions = {}
> = {
  [K in keyof Actions]: (
    this: _Vue,
    ctx: StrictActionContext<
      State,
      RootState,
      Getters,
      RootGetters,
      Mutations,
      RootMutations,
      Actions & ExtraActions,
      RootActions
    >,
    payload: Actions[K]
  ) => Promise<any> | void
};
/*
export declare class Store<S> {
  constructor(options: StoreOptions<S>);

  readonly state: S;
  readonly getters: any;

  replaceState(state: S): void;

  dispatch: Dispatch;
  commit: Commit;

  subscribe<P extends MutationPayload>(fn: (mutation: P, state: S) => any): () => void;
  subscribeAction<P extends ActionPayload>(fn: (action: P, state: S) => any): () => void;
  watch<T>(
    getter: (state: S, getters: any) => T,
    cb: (value: T, oldValue: T) => void,
    options?: WatchOptions
  ): () => void;

  registerModule<T>(path: string, module: Module<T, S>, options?: ModuleOptions): void;
  registerModule<T>(path: string[], module: Module<T, S>, options?: ModuleOptions): void;

  unregisterModule(path: string): void;
  unregisterModule(path: string[]): void;

  hotUpdate(options: {
    actions?: ActionTree<S, S>;
    mutations?: MutationTree<S>;
    getters?: GetterTree<S, S>;
    modules?: ModuleTree<S>;
  }): void;
}



export declare function install(Vue: typeof _Vue): void;
*/
/**
 * Strict version of dispatch type. It always requires a payload.
 */
export interface StrictDispatch<Actions, RootActions> {
  // Local
  <K extends keyof Actions>(type: K, payload: Actions[K], options?: LocalDispatchOptions): Promise<any>;
  <K extends keyof Actions>(payloadWithType: InputPayload<K, Actions>, options?: LocalDispatchOptions): Promise<any>;

  // Root
  <K extends keyof RootActions>(type: K, payload: RootActions[K], options: RootDispatchOptions): Promise<any>;
  <K extends keyof RootActions>(payloadWithType: InputPayload<K, RootActions>, options: RootDispatchOptions): Promise<
    any
  >;

  // Namespaced
  (type: ActionPath, payload: any, options: RootDispatchOptions): Promise<any>;
}

/**
 * Strict version of commit type. It always requires a payload.
 */
export interface StrictCommit<Mutations, RootMutations> {
  // Local
  <K extends keyof Mutations>(type: K, payload: Mutations[K], options?: LocalCommitOptions): void;
  <K extends keyof Mutations>(payloadWithType: InputPayload<K, Mutations>, options?: LocalCommitOptions): void;

  // Root
  <K extends keyof RootMutations>(type: K, payload: RootMutations[K], options: RootCommitOptions): void;
  <K extends keyof RootMutations>(payloadWithType: InputPayload<K, RootMutations>, options: RootCommitOptions): void;

  // Namespaced
  (type: MutationPath, payload: any, options?: RootDispatchOptions): void;
}

/**
 * Loose dispatch type. It can omit a payload and may throw in run time
 * since type checker cannot detect whether omitting payload is safe or not.
 */
export interface Dispatch<Actions = Record<string, any>, RootActions = Record<string, any>>
  extends StrictDispatch<Actions, RootActions> {
  <K extends keyof Actions>(type: K): Promise<any>;
}

/**
 * Loose commit type. It can omit a payload and may throw in run time
 * since type checker cannot detect whether omitting payload is safe or not.
 */
export interface Commit<Mutations = Record<string, any>, RootMutations = Record<string, any>>
  extends StrictCommit<Mutations, RootMutations> {
  <K extends keyof Mutations>(type: K): void;
}

export interface StrictActionContext<S, RS, G, RG, M, RM, A, RA> {
  dispatch: StrictDispatch<A, RA>;
  commit: StrictCommit<M, RM>;
  state: S;
  getters: G;
  rootState: RS;
  rootGetters: RG;
}

export interface ActionContext<
  S,
  RS,
  G = any,
  RG = any,
  M = Record<string, any>,
  RM = Record<string, any>,
  A = Record<string, any>,
  RA = Record<string, any>
> extends StrictActionContext<S, RS, G, RG, M, RM, A, RA> {
  dispatch: Dispatch<A, RA>;
  commit: Commit<M, RM>;
}

export interface Payload {
  type: string;
}

type InputPayload<K extends keyof P, P> = { type: K } & P[K];

export interface MutationPayload extends Payload {
  payload: any;
}

export interface ActionPayload extends Payload {
  payload: any;
}

interface LocalDispatchOptions extends DispatchOptions {
  root?: false;
}

interface RootDispatchOptions extends DispatchOptions {
  root: true;
}

interface LocalCommitOptions extends CommitOptions {
  root?: false;
}

interface RootCommitOptions extends CommitOptions {
  root: true;
}

export interface DispatchOptions {
  root?: boolean;
}

export interface CommitOptions {
  silent?: boolean;
  root?: boolean;
}

export interface StoreOptions<S> {
  state?: S;
  getters?: GetterTree<S, S>;
  actions?: ActionTree<S, S>;
  mutations?: MutationTree<S>;
  modules?: ModuleTree<S>;
  plugins?: Plugin<S>[];
  strict?: boolean;
}

type ActionHandler<S, R> = (injectee: ActionContext<S, R>, payload: any) => any;
interface ActionObject<S, R> {
  root?: boolean;
  handler: ActionHandler<S, R>;
}

export type Getter<S, R> = (state: S, getters: any, rootState: R, rootGetters: any) => any;
export type Action<S, R> = ActionHandler<S, R> | ActionObject<S, R>;
export type Mutation<S> = (state: S, payload: any) => any;
export type Plugin<S> = (store: any) => any;

export interface Module<S, R> {
  namespaced?: boolean;
  state?: S | (() => S);
  getters?: GetterTree<S, R>;
  actions?: ActionTree<S, R>;
  mutations?: MutationTree<S>;
  modules?: ModuleTree<R>;
}

export interface ModuleOptions {
  preserveState?: boolean;
}

export interface GetterTree<S, R> {
  [key: string]: Getter<S, R>;
}

export interface ActionTree<S, R> {
  [key: string]: Action<S, R>;
}

export interface MutationTree<S> {
  [key: string]: Mutation<S>;
}

export interface ModuleTree<R> {
  [key: string]: Module<any, R>;
}

/*
declare const _default: {
  Store: typeof Store;
  install: typeof install;
};
export default _default;
*/

type StatePath = "state.path";
type GetterPath = "getter/path";
type MutationPath = "mutation/path";
type ActionPath = "action/path";
/**
 * Erweitert die Standard-Helper um dispatch, commit und getters
 */
export function createNamespace<State, Getters, Mutations, Actions>(
  this: any,
  ...namespaces: string[]
): NamespacedMappers<State, Getters, Mutations, Actions, "normal"> & {
  state<K extends keyof State>(child?: K): StatePath;
  getter<K extends keyof Getters>(child?: K): GetterPath;
  mutation<K extends keyof Mutations>(child?: K): MutationPath;
  action<K extends keyof Actions>(child?: K): ActionPath;
  commit: StrictCommit<Mutations, any>;
  dispatch: StrictDispatch<Actions, any>;
  getters: Getters;
  name: string;
} {
  const namespace = namespaces.join("/");
  const helpers = createNamespacedHelpers(namespace) as any;

  if (!namespaces.length) return helpers;
  helpers.getter = helpers.mutation = helpers.action = function(p: string) {
    return p ? namespace + "/" + p : namespace;
  };
  helpers.state = function(p: string) {
    return helpers.getter(p).replace(/\//g, ".");
  };
  helpers.name = namespace;
  //Dispatch:
  helpers.dispatch = function(fn: string, payload?: any) {
    const $store = _Vue.prototype.$nuxt.$store;
    return $store.dispatch(namespace + "/" + fn, payload);
  };
  //Commit:
  helpers.commit = function(fn: string, value: any) {
    const $store = _Vue.prototype.$nuxt.$store;
    return $store.commit(namespace + "/" + fn, value);
  };
  //Getters:
  Object.defineProperty(helpers, "getters", {
    get() {
      const $store = _Vue.prototype.$nuxt.$store;
      return Object.defineProperties(
        {},
        Object.keys($store.getters)
          .filter(key => key.startsWith(namespace + "/"))
          .reduce((out, key) => {
            out[key.substr(namespace.length + 1)] = {
              get() {
                return $store.getters[key];
              }
            };
            return out;
          }, {})
      );
    }
  });
  return helpers;
}
