import { createSignal } from "solid-js";
import { createStore, unwrap } from "solid-js/store";
import Prompt from "./components/Prompt";

const PICKER_OPTIONS = {
  types: [
    {
      accept: { "text/json": [".json"] },
    },
  ],
};

let fileHandle = null;

const createEmptyData = () => ({
  prompt: {
    keywords: [],
  },
  negativePrompt: {
    keywords: [],
  },
});

function App() {
  const [key, setKey] = createSignal([{}]);
  const [data, setData] = createStore(createEmptyData());

  const save = async () => {
    const contents = JSON.stringify(unwrap(data));
    const writable = await fileHandle.createWritable();
    await writable.write(contents);
    await writable.close();
  };

  const handleAdd = (key, keyword) => {
    const keywords = keyword.split(",").map((keyword) => keyword.trim());
    setData(key, "keywords", (prev) => [...prev, ...keywords]);
  };

  const handleClear = (key) => {
    setData(key, "keywords", []);
  };

  const handleNew = () => {
    fileHandle = null;
    setKey([{}]);
    setData(createEmptyData());
  };

  const handleOpen = async () => {
    [fileHandle] = await window.showOpenFilePicker(PICKER_OPTIONS);
    const file = await fileHandle.getFile();
    const contents = await file.text();

    const newData = JSON.parse(contents);
    setKey([{}]);
    setData(newData);
  };

  const handleRemove = (key, index) => {
    setData(key, "keywords", (prev) => [
      ...prev.slice(0, index),
      ...prev.slice(index + 1),
    ]);
  };

  const handleSave = async () => {
    fileHandle ? await save() : await handleSaveAs();
  };

  const handleSaveAs = async () => {
    fileHandle = await window.showSaveFilePicker(PICKER_OPTIONS);
    await save();
  };

  return (
    <>
      <h1>Prompter</h1>

      <button onClick={handleNew}>New</button>&nbsp;
      <button onClick={handleOpen}>Open</button>&nbsp;
      <button onClick={handleSave}>Save</button>&nbsp;
      <button onClick={handleSaveAs}>Save As</button>

      <h2>Prompt</h2>
      <For each={key()}>
        {() => (
          <Prompt
            keywords={data.prompt.keywords}
            onAdd={(keyword) => handleAdd("prompt", keyword)}
            onClear={() => handleClear("prompt")}
            onRemove={(index) => handleRemove("prompt", index)}
          />
        )}
      </For>

      <h2>Negative prompt</h2>
      <For each={key()}>
        {() => (
          <Prompt
            keywords={data.negativePrompt.keywords}
            onAdd={(keyword) => handleAdd("negativePrompt", keyword)}
            onClear={() => handleClear("negativePrompt")}
            onRemove={(index) => handleRemove("negativePrompt", index)}
          />
        )}
      </For>
    </>
  );
}

export default App;
