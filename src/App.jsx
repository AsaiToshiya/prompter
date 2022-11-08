import logo from './logo.svg';
import { createSignal, createMemo } from "solid-js";
import Prompt from "./components/Prompt";

let fileHandle = null;

function App() {
  const [key, setKey] = createSignal([{}]);
  const [negativePromptKeywords, setNegativePromptKeywords] = createSignal([]);
  const [promptKeywords, setPromptKeywords] = createSignal([]);

  const reset = () => {
    setKey([{}]);
    setNegativePromptKeywords([]);
    setPromptKeywords([]);
  };

  const save = async () => {
    const data = {
      prompt: {
        keywords: promptKeywords(),
      },
      negativePrompt: {
        keywords: negativePromptKeywords(),
      },
    };

    const contents = JSON.stringify(data);
    const writable = await fileHandle.createWritable();
    await writable.write(contents);
    await writable.close();
  };

  const update = (setter, keywords) => {
    setter(keywords().join(", "));
  };

  const handleNegativePromptAdd = (keyword) => {
    setNegativePromptKeywords((prev) => [
      ...prev,
      ...keyword.split(",").map((keyword) => keyword.trim()),
    ]);
  };

  const handleNegativePromptRemove = (index) => {
    setNegativePromptKeywords((prev) => [
      ...prev.slice(0, index),
      ...prev.slice(index + 1),
    ]);
  };

  const handleNew = () => {
    fileHandle = null;
    reset();
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
    reset();
    setPromptKeywords((prev) => [
      ...prev,
      ...newData.prompt.keywords.map((keyword) => keyword.trim()),
    ]);
    setNegativePromptKeywords((prev) => [
      ...prev,
      ...newData.negativePrompt.keywords.map((keyword) => keyword.trim()),
    ]);
  };

  const handlePromptAdd = (keyword) => {
    setPromptKeywords((prev) => [
      ...prev,
      ...keyword.split(",").map((keyword) => keyword.trim()),
    ]);
  };

  const handlePromptRemove = (index) => {
    setPromptKeywords((prev) => [
      ...prev.slice(0, index),
      ...prev.slice(index + 1),
    ]);
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
            onAdd={handlePromptAdd}
            onRemove={handlePromptRemove}
          />
        )}
      </For>

      <h2>Negative prompt</h2>
      <For each={key()}>
        {() => (
          <Prompt
            keywords={negativePromptKeywords}
            onAdd={handleNegativePromptAdd}
            onRemove={handleNegativePromptRemove}
          />
        )}
      </For>
    </>
  );
}

export default App;
