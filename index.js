let fileHandle = null;

const addKeyword = (keyword, divId, textareaId) => {
  const div = document.getElementById(divId);
  const button = createButton(keyword, divId, textareaId);
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
    className: "keywords",
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
  addKeywords(
    input.value.split(",").map((keyword) => keyword.trim()),
    divId,
    textareaId
  );
  update(divId, textareaId);
};

const handleClear = (divId, textareaId) => {
  replaceNode(createDiv(divId), document.getElementById(divId));
  replaceNode(createTextarea(textareaId), document.getElementById(textareaId));
};

const handleCopy = (textareaId) => {
  const textarea = document.getElementById(textareaId);
  navigator.clipboard.writeText(textarea.value);
};

const handleDecreaseAttention = (inputId) => {
  const input = document.getElementById(inputId);
  const newInput = Object.assign(createInput(inputId), {
    value: `[${input.value}]`,
  });
  replaceNode(newInput, input);
};

const handleIncreaseAttention = (inputId) => {
  const input = document.getElementById(inputId);
  const newInput = Object.assign(createInput(inputId), {
    value: `(${input.value})`,
  });
  replaceNode(newInput, input);
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
