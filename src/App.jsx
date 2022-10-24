import logo from './logo.svg';
import { createSignal } from "solid-js";
import Prompt from "./components/Prompt";

let fileHandle = null;

function App() {
  const [key, setKey] = createSignal([{}]);

  const addKeyword = (keyword, divId, textareaId) => {
    const div = document.getElementById(divId);
    const button = createButton(keyword.trim(), divId, textareaId);
    div.appendChild(button);
    div.appendChild(document.createTextNode("\n"));
  };

  const addKeywords = (keywords, divId, textareaId) => {
    keywords.forEach((keyword) => addKeyword(keyword, divId, textareaId));
  };

  const createButton = (keyword, divId, textareaId) =>
    Object.assign(document.createElement("button"), {
      className: "keyword",
      innerText: keyword,
      onclick: ({ target }) => {
        handleRemove(target, divId, textareaId);
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

  const update = (divId, textareaId) => {
    const newTextarea = createTextarea(textareaId);
    newTextarea.appendChild(
      document.createTextNode(toKeywordArray(divId).join(", "))
    );
    const textarea = document.getElementById(textareaId);
    replaceNode(newTextarea, textarea);
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
    addKeywords(data.prompt.keywords, "prompt-keywords", "prompt-result");
    update("prompt-keywords", "prompt-result");
    addKeywords(
      data.negativePrompt.keywords,
      "negative-prompt-keywords",
      "negative-prompt-result"
    );
    update("negative-prompt-keywords", "negative-prompt-result");
  };

  const handleRemove = (button, divId, textareaId) => {
    button.nextSibling.remove();
    button.remove();
    update(divId, textareaId);
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
      <For each={key()}>{() => <Prompt id="prompt" />}</For>

      <h2>Negative prompt</h2>
      <For each={key()}>{() => <Prompt id="negative-prompt" />}</For>
    </>
  );
}

export default App;
