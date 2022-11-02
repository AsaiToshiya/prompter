import logo from './logo.svg';
import { createSignal } from "solid-js";
import Prompt from "./components/Prompt";

let fileHandle = null;

function App() {
  const [key, setKey] = createSignal([{}]);
  const [negativePromptResult, setNegativePromptResult] = createSignal("");
  const [promptResult, setPromptResult] = createSignal("");

  const addKeyword = (keyword, divId, textareaId, setter) => {
    const div = document.getElementById(divId);
    const button = createButton(keyword.trim(), divId, textareaId, setter);
    div.appendChild(button);
    div.appendChild(document.createTextNode("\n"));
  };

  const addKeywords = (keywords, divId, textareaId, setter) => {
    keywords.forEach((keyword) =>
      addKeyword(keyword, divId, textareaId, setter)
    );
  };

  const createButton = (keyword, divId, textareaId, setter) =>
    Object.assign(document.createElement("button"), {
      className: "keyword",
      innerText: keyword,
      onclick: ({ target }) => {
        handleRemove(target, divId, textareaId, setter);
      },
    });

  const createDiv = (id) =>
    Object.assign(document.createElement("div"), {
      id,
    });

  const createInput = (id) =>
    Object.assign(document.createElement("input"), {
      id,
      type: "text",
    });

  const createTextarea = (id) =>
    Object.assign(document.createElement("textarea"), {
      id,
      readonly: true,
    });

  const replaceNode = (newNode, oldNode) => {
    oldNode.parentNode.replaceChild(newNode, oldNode);
  };

  const reset = () => {
    setKey([{}]);
    setNegativePromptResult("");
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
      setNegativePromptResult
    );
    update(
      "negative-prompt-keywords",
      "negative-prompt-result",
      setNegativePromptResult
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
      setPromptResult
    );
    update("prompt-keywords", "prompt-result", setPromptResult);
    addKeywords(
      data.negativePrompt.keywords,
      "negative-prompt-keywords",
      "negative-prompt-result",
      setNegativePromptResult
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
      setPromptResult
    );
    update("prompt-keywords", "prompt-result", setPromptResult);
  };

  const handleRemove = (button, divId, textareaId, setter) => {
    button.nextSibling.remove();
    button.remove();
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
          <Prompt id="prompt" onAdd={handlePromptAdd} result={promptResult} />
        )}
      </For>

      <h2>Negative prompt</h2>
      <For each={key()}>
        {() => (
          <Prompt
            id="negative-prompt"
            onAdd={handleNegativePromptAdd}
            result={negativePromptResult}
          />
        )}
      </For>
    </>
  );
}

export default App;
