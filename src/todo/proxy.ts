import { getUntrackedObject } from "proxy-memoize";

const isObject = (x: unknown): x is object =>
  typeof x === "object" && x !== null;

const canProxy = (x: unknown) =>
  isObject(x) &&
  (Array.isArray(x) || Symbol.iterator in x) &&
  !(x instanceof WeakMap) &&
  !(x instanceof WeakSet) &&
  !(x instanceof Error) &&
  !(x instanceof Number) &&
  !(x instanceof Date) &&
  !(x instanceof String) &&
  !(x instanceof RegExp) &&
  !(x instanceof ArrayBuffer);

type Status = "pending" | "completed";
type Filter = Status | "all";
type Todo = {
  description: string;
  status: Status;
  id: number;
};

export const addTodo = (description: string) => {
  store.todos.push({
    description,
    status: "pending",
    id: Date.now(),
  });
};

export const removeTodo = (index: number) => {
  store.todos.splice(index, 1);
};

export const toggleDone = (index: number, currentStatus: Status) => {
  store.todos[index].status =
    currentStatus === "pending" ? "completed" : "pending";
};

export const setFilter = (filter: Filter) => {
  store["filter"] = filter;
};

export const filterValues: Filter[] = ["all", "completed", "pending"];

const VERSION = Symbol();
let version = 1;

export const proxy = <T extends object>(initialObject: T): T => {
  const baseObject = Object.create(Object.getPrototypeOf(initialObject));
  const handler = {
    get(target: T, prop: string | symbol, receiver: any) {
      if (prop === VERSION) {
        return version;
      }
      const value = Reflect.get(target, prop, receiver);
      console.log("-- get --");
      console.log({ value });
      console.log("----");
      return value;
    },
    canProxy,
    is: Object.is,
    set(target: T, prop: string | symbol, value: any, receiver: any) {
      return true;
    },
  };
  const proxyObject = new Proxy(baseObject, handler);
  Reflect.ownKeys(initialObject).forEach((key) => {
    const desc = Object.getOwnPropertyDescriptor(
      initialObject,
      key
    ) as PropertyDescriptor;
    if (desc.get || desc.set) {
      Object.defineProperty(baseObject, key, desc);
    } else {
      proxyObject[key] = initialObject[key as keyof T];
    }
  });
  return proxyObject;
};

export const store = proxy<{ filter: Filter; todos: Todo[]; version: string }>({
  filter: "all",
  todos: [
    {
      description: "Create a new video",
      status: "completed",
      id: 98439843,
    },
    {
      description: "Create a new song",
      status: "pending",
      id: 58439843,
    },
  ],
  version: "1.0.0",
});

console.log(store.filter);
