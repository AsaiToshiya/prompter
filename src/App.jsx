import logo from './logo.svg';

let fileHandle = null;

function App() {
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
    replaceNode(
      createInput("prompt-keyword"),
      document.getElementById("prompt-keyword")
    );
    replaceNode(
      createDiv("prompt-keywords"),
      document.getElementById("prompt-keywords")
    );
    replaceNode(
      createTextarea("prompt-result"),
      document.getElementById("prompt-result")
    );
    replaceNode(
      createInput("negative-prompt-keyword"),
      document.getElementById("negative-prompt-keyword")
    );
    replaceNode(
      createDiv("negative-prompt-keywords"),
      document.getElementById("negative-prompt-keywords")
    );
    replaceNode(
      createTextarea("negative-prompt-result"),
      document.getElementById("negative-prompt-result")
    );
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

  const handleAdd = (inputId, divId, textareaId) => {
    const newInput = createInput(inputId);
    const input = document.getElementById(inputId);
    replaceNode(newInput, input);
    addKeywords(input.value.split(","), divId, textareaId);
    update(divId, textareaId);
  };

  const handleCopy = (textareaId) => {
    const textarea = document.getElementById(textareaId);
    navigator.clipboard.writeText(textarea.value);
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

      <button onClick={handleNew}>New</button>
      <button onClick={handleOpen}>Open</button>
      <button onClick={handleSave}>Save</button>
      <button onClick={handleSaveAs}>Save As</button>

      <h2>Prompt</h2>
      Keyword:
      <div class="row">
        <input type="text" id="prompt-keyword" />
        &nbsp;
        <button
          onClick={() => handleAdd('prompt-keyword', 'prompt-keywords', 'prompt-result')}
        >
          Add
        </button>
      </div>
      <br />
      Keywords:
      <div id="prompt-keywords"></div>
      <br />
      Result:
      <div class="row">
        <textarea id="prompt-result" readonly></textarea>
        &nbsp;
        <button onClick={() => handleCopy('prompt-result')}>Copy</button>
      </div>

      <h2>Negative prompt</h2>
      Keyword:
      <div class="row">
        <input type="text" id="negative-prompt-keyword" />
        &nbsp;
        <button
          onClick={() => handleAdd('negative-prompt-keyword', 'negative-prompt-keywords', 'negative-prompt-result')}
        >
          Add
        </button>
      </div>
      <br />
      Keywords:
      <div id="negative-prompt-keywords"></div>
      <br />
      Result:
      <div class="row">
        <textarea id="negative-prompt-result"></textarea>
        &nbsp;
        <button onClick={() => handleCopy('negative-prompt-result')}>Copy</button>
      </div>
    </>
  );
}

export default App;
