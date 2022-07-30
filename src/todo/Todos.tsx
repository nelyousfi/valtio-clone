import {
  addTodo,
  filterValues,
  removeTodo,
  setFilter,
  store,
  toggleDone,
} from "./proxy";
import { useRef } from "react";

const useSnapshot = <T extends object>(initialState: T): T => {
  return initialState;
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
