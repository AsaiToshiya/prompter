import logo from './logo.svg';
import { createSignal } from "solid-js";
import Prompt from "./components/Prompt";

let fileHandle = null;

function App() {
  const [key, setKey] = createSignal([{}]);
  const [negativePromptKeywords, setNegativePromptKeywords] = createSignal([]);
  const [negativePromptResult, setNegativePromptResult] = createSignal("");
  const [promptKeywords, setPromptKeywords] = createSignal([]);
  const [promptResult, setPromptResult] = createSignal("");

  const addKeywords = (keywords, divId, textareaId, setter, setterKeywords) => {
    setterKeywords((prev) => [
      ...prev,
      ...keywords.map((keyword) => keyword.trim()),
    ]);
  };

  const reset = () => {
    setKey([{}]);
    setNegativePromptKeywords([]);
    setNegativePromptResult("");
    setPromptKeywords([]);
    setPromptResult("");
  };

  const save = async () => {
    const data = {
      prompt: {
        keywords: toKeywordArray("prompt-keywords"),
      },
      negativePrompt: {
        keywords: toKeywordArray("negative-prompt-keywords"),
      },
    };

    const contents = JSON.stringify(data);
    const writable = await fileHandle.createWritable();
    await writable.write(contents);
    await writable.close();
  };

  const toKeywordArray = (divId) => {
    const div = document.getElementById(divId);
    return [...div.children].map((child) => child.innerText);
  };

  const update = (divId, textareaId, setter) => {
    setter(toKeywordArray(divId).join(", "));
  };

  const handleNegativePromptAdd = (keyword) => {
    addKeywords(
      keyword.split(","),
      "negative-prompt-keywords",
      "negative-prompt-result",
      setNegativePromptResult,
      setNegativePromptKeywords
    );
    update(
      "negative-prompt-keywords",
      "negative-prompt-result",
      setNegativePromptResult
    );
  };

  const handleNegativePromptRemove = (index) => {
    handleRemove(
      null,
      "negative-prompt-keywords",
      "negative-prompt-result",
      setNegativePromptResult,
      index,
      setNegativePromptKeywords
    );
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
    addKeywords(
      data.prompt.keywords,
      "prompt-keywords",
      "prompt-result",
      setPromptResult,
      setPromptKeywords
    );
    update("prompt-keywords", "prompt-result", setPromptResult);
    addKeywords(
      data.negativePrompt.keywords,
      "negative-prompt-keywords",
      "negative-prompt-result",
      setNegativePromptResult,
      setNegativePromptKeywords
    );
    update(
      "negative-prompt-keywords",
      "negative-prompt-result",
      setNegativePromptResult
    );
  };

  const handlePromptAdd = (keyword) => {
    addKeywords(
      keyword.split(","),
      "prompt-keywords",
      "prompt-result",
      setPromptResult,
      setPromptKeywords
    );
    update("prompt-keywords", "prompt-result", setPromptResult);
  };

  const handlePromptRemove = (index) => {
    handleRemove(
      null,
      "prompt-keywords",
      "prompt-result",
      setPromptResult,
      index,
      setPromptKeywords
    );
  };

  const handleRemove = (
    button,
    divId,
    textareaId,
    setter,
    index,
    setterKeywords
  ) => {
    setterKeywords((prev) => [
      ...prev.slice(0, index),
      ...prev.slice(index + 1),
    ]);
    update(divId, textareaId, setter);
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
