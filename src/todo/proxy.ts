import { proxy } from "valtio";

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

export const store = proxy<{ filter: Filter; todos: Todo[] }>({
  filter: "all",
  todos: [
    {
      description: "Create a new video",
      status: "completed",
      id: 98439843,
    },
    {
      description: "Create a new song",
      status: "completed",
      id: 58439843,
    },
  ],
});
