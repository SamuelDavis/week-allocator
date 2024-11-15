import { createEffect, createSignal, Index } from "solid-js";

const totalTime = 24 * 7;
type Item = { name: string; value: number };
export default function App() {
  const item = window.localStorage.getItem("week-allocation") ?? "null";
  let value: Item[] = [];
  try {
    const tmp = JSON.parse(item);
    if (Array.isArray(tmp)) value = tmp;
    else window.localStorage.removeItem("week-allocation");
  } catch (e) {
    window.localStorage.removeItem("week-allocation");
    console.error(e);
  }
  const [getItems, setItems] = createSignal<Item[]>(value);
  createEffect(() =>
    localStorage.setItem("week-allocation", JSON.stringify(getItems())),
  );
  const getAvailable = () =>
    getItems().reduce((acc, item) => acc - item.value, totalTime);

  function onAddItem() {
    const name = (prompt("Name") ?? "").trim();
    if (name == "") return;
    if (getItems().some((item) => item.name === name))
      return alert(name + " already exists.");
    setItems((items) => [...items, { name, value: 0 }]);
  }

  function onInput(i: number, event: { target: HTMLInputElement }) {
    setItems((items) => {
      const available = items.reduce(
        (available, item, j) => (j === i ? available : available - item.value),
        totalTime,
      );
      const value = Math.min(available, event.target.valueAsNumber);
      const item = { ...items[i], value };
      return [...items.slice(0, i), item, ...items.slice(i + 1)];
    });
  }

  function onRemove(index: number) {
    setItems((items) => [...items.slice(0, index), ...items.slice(index + 1)]);
  }

  return (
    <main>
      <header>
        <button onclick={onAddItem}>Add Item</button>
        <span>
          <output>{getAvailable()}</output> of {totalTime} available
        </span>
      </header>
      <hr />
      <ol>
        <Index each={getItems()}>
          {(getItem, index) => (
            <li>
              <button title="remove" onClick={[onRemove, index]}>
                &minus;
              </button>
              <input
                onInput={[onInput, index]}
                type="range"
                min={0}
                max={totalTime}
                step={1}
                value={getItem().value}
              />
              <output>{getItem().value}</output>
              <span>{getItem().name}</span>
            </li>
          )}
        </Index>
      </ol>
    </main>
  );
}
