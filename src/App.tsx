import { Suspense, useReducer } from "react";

import { proxy, useSnapshot, subscribe, snapshot } from "valtio";
import { devtools, subscribeKey } from "valtio/utils";
import { useProxy } from "valtio/macro";

const INITIAL_VALUE = 0;
const state = proxy({
  count: INITIAL_VALUE,
  increment: () => {
    ++state.count;
  },
  clear: () => {
    state.count = 0;
  },
});
devtools(state, { name: "state name", enabled: true });

subscribe(state, () => {
  // const immutableState = snapshot(state);
  // ++immutableState.count; // readonly
});

setInterval(state.increment, 1000);

const unsubscribe = subscribe(state, () => {
  console.log(`subscribe: the count is changed to ${state.count}`);
});

setInterval(() => {
  unsubscribe();
}, 10000);

subscribeKey(state, "count", (count) => {
  console.log(`subscribeKey: the count is changed to ${count}`);
});

const App = () => {
  const [, rerender] = useReducer((x) => x + 1, 0);
  return (
    <>
      <Container />
      <TextBox />
      <NoRerender />
      <button onClick={rerender}>Rerender</button>
      <AnotherCounter />
    </>
  );
};

const Container = () => {
  const { count, clear } = useSnapshot(state);
  return (
    <>
      <h1>{count}</h1>
      <button onClick={clear}>Clear</button>
      <Suspense fallback={<p>Loading ...</p>}>
        <Todo />
      </Suspense>
    </>
  );
};

const todoState = proxy({
  todo: fetch("https://jsonplaceholder.typicode.com/posts/1").then((response) =>
    response.json()
  ),
});

const NoRerender = () => {
  const { count } = state;

  return (
    <>
      <h5>NoRerender: {count}</h5>
    </>
  );
};

const Todo = () => {
  const { todo } = useSnapshot(todoState);
  return (
    <>
      <h1>Todo:</h1>
      <h4>{todo.title}</h4>
      <p>{todo.body}</p>
    </>
  );
};

const textBoxState = proxy({ value: "" });

const TextBox = () => {
  const snap = useSnapshot(textBoxState, { sync: true });
  return (
    <>
      <p>{snap.value}</p>
      <input
        value={snap.value}
        onChange={(e) => (textBoxState.value = e.target.value)}
      />
    </>
  );
};

const anotherCountState = proxy({ value: 0 });

const AnotherCounter = () => {
  useProxy(anotherCountState); // useProxy macro using https://www.npmjs.com/package/babel-plugin-macros
  return (
    <>
      <h3>{anotherCountState.value}</h3>
      <button
        onClick={() => {
          ++anotherCountState.value;
        }}
      >
        Increment the other counter
      </button>
    </>
  );
};

export default App;
