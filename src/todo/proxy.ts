// import { proxy } from "valtio";

const isObject = (x: unknown): x is object =>
  typeof x === "object" && x !== null;

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
  store.filter = filter;
};

export const filterValues: Filter[] = ["all", "completed", "pending"];

const VERSION = Symbol();
let version = 1;

export const getVersion = (proxyObject: unknown): number | undefined => {
  return isObject(proxyObject) ? (proxyObject as any)[VERSION] : undefined;
};

export const proxy = <T extends object>(initialObject: T): T => {
  const baseObject = Object.create(Object.getPrototypeOf(initialObject));
  const handler = {
    get(target: T, prop: string | symbol, receiver: any) {
      console.log({ target, prop, receiver });
      if (prop === VERSION) {
        return version;
      }
      // @ts-ignore
      return initialObject[prop];
    },
  };
  const proxyObject = new Proxy(baseObject, handler);
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
