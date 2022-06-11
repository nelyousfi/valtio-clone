import { proxy, useSnapshot } from "valtio";

const state = proxy({ count: 0 });

const App = () => {
  const snap = useSnapshot(state);
  return (
    <>
      <h1>{snap.count}</h1>
      <button onClick={() => ++state.count}>Increment</button>
    </>
  );
};

export default App;
