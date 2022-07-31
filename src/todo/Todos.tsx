import {
  addTodo,
  filterValues,
  removeTodo,
  setFilter,
  store,
  toggleDone,
} from "./proxy";
import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import { snapshot, subscribe } from "valtio";
import { createProxy } from "proxy-compare";

type Snapshot<T> = {
  readonly [K in keyof T]: Snapshot<T[K]>;
};

const useSnapshot = <T extends object>(proxyObject: T): Snapshot<T> => {
  const currentSnapshot = useSyncExternalStore(
    useCallback(
      (callback) => {
        return subscribe(proxyObject, callback);
      },
      [proxyObject]
    ),
    () => {
      return snapshot(proxyObject);
    }
  );

  const currentAffected = new WeakMap();
  const proxyCache = useMemo(() => new WeakMap(), []);
  return createProxy<Snapshot<T>>(currentSnapshot, currentAffected, proxyCache);
};

export const Todos = () => {
  const snap = useSnapshot(store);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <ul>
        {filterValues.map((filter) => (
          <div key={filter}>
            <input
              type="radio"
              name={"filter"}
              value={filter}
              checked={snap.filter === filter}
              onChange={() => setFilter(filter)}
            />
            <label>{filter}</label>
          </div>
        ))}
        {snap.todos
          .filter(
            ({ status }) => status === snap.filter || snap.filter === "all"
          )
          .map(({ description, status, id }, index) => {
            return (
              <li key={id}>
                <span
                  style={{
                    textDecoration:
                      status === "completed" ? "line-through" : "inherit",
                  }}
                  onClick={() => toggleDone(index, status)}
                >
                  {description}
                </span>
                <button className={"remove"} onClick={() => removeTodo(index)}>
                  x
                </button>
              </li>
            );
          })}
        <section>
          <input type="text" name={"description"} ref={inputRef} />
          <button onClick={() => addTodo(inputRef.current?.value ?? "")}>
            Add New Todo
          </button>
        </section>
        <footer>Made with love ❤️ version: {snap.version}</footer>
      </ul>
    </>
  );
};
