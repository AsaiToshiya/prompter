import logo from './logo.svg';
import { createSignal, createMemo } from "solid-js";
import Prompt from "./components/Prompt";

let fileHandle = null;

function App() {
  const [key, setKey] = createSignal([{}]);
  const [negativePromptKeywords, setNegativePromptKeywords] = createSignal([]);
  const negativePromptResult = createMemo(() =>
    negativePromptKeywords().join(", ")
  );
  const [promptKeywords, setPromptKeywords] = createSignal([]);
  const [promptResult, setPromptResult] = createSignal("");

  const addKeywords = (keywords, setterKeywords) => {
    setterKeywords((prev) => [
      ...prev,
      ...keywords.map((keyword) => keyword.trim()),
    ]);
  };

  const reset = () => {
    setKey([{}]);
    setNegativePromptKeywords([]);
    setPromptKeywords([]);
    setPromptResult("");
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
    addKeywords(keyword.split(","), setNegativePromptKeywords);
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

    const data = JSON.parse(contents);
    reset();
    addKeywords(data.prompt.keywords, setPromptKeywords);
    update(setPromptResult, promptKeywords);
    addKeywords(data.negativePrompt.keywords, setNegativePromptKeywords);
  };

  const handlePromptAdd = (keyword) => {
    addKeywords(keyword.split(","), setPromptKeywords);
    update(setPromptResult, promptKeywords);
  };

  const handlePromptRemove = (index) => {
    setPromptKeywords((prev) => [
      ...prev.slice(0, index),
      ...prev.slice(index + 1),
    ]);
    update(setPromptResult, promptKeywords);
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
            id="prompt"
            keywords={promptKeywords}
            onAdd={handlePromptAdd}
            onRemove={handlePromptRemove}
            result={promptResult}
          />
        )}
      </For>

      <h2>Negative prompt</h2>
      <For each={key()}>
        {() => (
          <Prompt
            id="negative-prompt"
            keywords={negativePromptKeywords}
            onAdd={handleNegativePromptAdd}
            onRemove={handleNegativePromptRemove}
            result={negativePromptResult}
          />
        )}
      </For>
    </>
  );
}

export default App;
