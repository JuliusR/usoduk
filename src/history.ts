export type History<T> = {
  past: Array<T>;
  present: T;
  future: Array<T>;
};
export function newHistory<T>(present: T): History<T> {
  return {
    past: [],
    present,
    future: [],
  };
}
export function advanceHistory<T>(history: History<T>, present: T): History<T> {
  const backToTheFuture = [...history.future].reverse();
  return {
    past: [
      ...history.past,
      history.present,
      ...history.future,
      ...backToTheFuture.slice(1),
      ...(history.future.length ? [history.present] : []),
    ],
    present,
    future: [],
  };
}
export function undoHistory<T>(history: History<T>): History<T> {
  if (!history.past.length) return history;
  return {
    past: history.past.slice(0, -1),
    present: history.past[history.past.length - 1],
    future: [history.present, ...history.future],
  };
}
export function redoHistory<T>(history: History<T>): History<T> {
  if (!history.future.length) return history;
  return {
    past: [...history.past, history.present],
    present: history.future[0],
    future: history.future.slice(1),
  };
}
