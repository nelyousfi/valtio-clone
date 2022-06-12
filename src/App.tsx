import { Suspense, useReducer } from "react";

import { proxy, useSnapshot, subscribe, snapshot } from "valtio";
import {
  derive,
  devtools,
  proxyWithComputed,
  subscribeKey,
} from "valtio/utils";
import { useProxy } from "valtio/macro";
import memoize from "proxy-memoize";

const INITIAL_VALUE = 0;
const countState = proxy({
  count: INITIAL_VALUE,
  increment: () => {
    ++countState.count;
  },
  clear: () => {
    countState.count = 0;
  },
});
devtools(countState, { name: "state name", enabled: true });

subscribe(countState, () => {
  // const immutableState = snapshot(state);
  // ++immutableState.count; // readonly
});

setInterval(countState.increment, 1000);

const unsubscribe = subscribe(countState, () => {
  console.log(`subscribe: the count is changed to ${countState.count}`);
});

setInterval(() => {
  unsubscribe();
}, 10000);

subscribeKey(countState, "count", (count) => {
  console.log(`subscribeKey: the count is changed to ${count}`);
});

const doubleCountState = derive({
  value: (get) => get(countState).count * 2,
});

const computedCount = proxyWithComputed(
  {
    count: 0,
  },
  {
    triple: memoize((snap) => snap.count * 3),
  }
);

const App = () => {
  const [, rerender] = useReducer((x) => x + 1, 0);
  return (
    <>
      <Container />
      <TextBox />
      <NoRerender />
      <button onClick={rerender}>Rerender</button>
      <AnotherCounter />
      <ComputedCount />
    </>
  );
};

const Container = () => {
  const { count, clear } = useSnapshot(countState);
  const { value: doubleCount } = useSnapshot(doubleCountState);
  return (
    <>
      <h1>{count}</h1>
      <h1>{doubleCount}</h1>
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
  const { count } = snapshot(countState);

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

const ComputedCount = () => {
  const { triple } = useSnapshot(computedCount);

  return (
    <>
      <h6>{triple}</h6>
      <button onClick={() => ++computedCount.count}>Increment</button>
    </>
  );
};

export default App;
