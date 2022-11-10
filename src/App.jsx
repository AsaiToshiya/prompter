import logo from './logo.svg';
import { createSignal, createMemo } from "solid-js";
import { createStore, unwrap } from "solid-js/store";
import Prompt from "./components/Prompt";

let fileHandle = null;

function App() {
  const [key, setKey] = createSignal([{}]);
  const [negativePromptKeywords, setNegativePromptKeywords] = createSignal([]);
  const [promptKeywords, setPromptKeywords] = createSignal([]);
  const [data, setData] = createStore({
    prompt: {
      keywords: promptKeywords(),
    },
    negativePrompt: {
      keywords: negativePromptKeywords(),
    },
  });

  const save = async () => {
    setData("prompt", "keywords", promptKeywords());
    setData("negativePrompt", "keywords", negativePromptKeywords());
    const contents = JSON.stringify(unwrap(data));
    const writable = await fileHandle.createWritable();
    await writable.write(contents);
    await writable.close();
  };

  const handleAdd = (keyword, setter) => {
    setter((prev) => [
      ...prev,
      ...keyword.split(",").map((keyword) => keyword.trim()),
    ]);
  };

  const handleNew = () => {
    fileHandle = null;
    setKey([{}]);
    setNegativePromptKeywords([]);
    setPromptKeywords([]);
  };

  const handleOpen = async () => {
    [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          accept: { "text/json": [".json"] },
        },
      ],
    });
    const file = await fileHandle.getFile();
    const contents = await file.text();

    const newData = JSON.parse(contents);
    setKey([{}]);
    setNegativePromptKeywords([]);
    setPromptKeywords([]);
    setPromptKeywords((prev) => [
      ...prev,
      ...newData.prompt.keywords.map((keyword) => keyword.trim()),
    ]);
    setNegativePromptKeywords((prev) => [
      ...prev,
      ...newData.negativePrompt.keywords.map((keyword) => keyword.trim()),
    ]);
  };

  const handleRemove = (index, setter) => {
    setter((prev) => [...prev.slice(0, index), ...prev.slice(index + 1)]);
  };

  const handleSave = async () => {
    fileHandle ? await save() : await handleSaveAs();
  };

  const handleSaveAs = async () => {
    fileHandle = await window.showSaveFilePicker({
      types: [
        {
          accept: { "text/json": [".json"] },
        },
      ],
    });
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
            keywords={promptKeywords}
            onAdd={(keyword) => handleAdd(keyword, setPromptKeywords)}
            onRemove={(index) => handleRemove(index, setPromptKeywords)}
          />
        )}
      </For>

      <h2>Negative prompt</h2>
      <For each={key()}>
        {() => (
          <Prompt
            keywords={negativePromptKeywords}
            onAdd={(keyword) => handleAdd(keyword, setNegativePromptKeywords)}
            onRemove={(index) => handleRemove(index, setNegativePromptKeywords)}
          />
        )}
      </For>
    </>
  );
}

export default App;
