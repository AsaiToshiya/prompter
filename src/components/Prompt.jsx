import { createSignal } from "solid-js";

function Prompt(props) {
  const [keyword, setKeyword] = createSignal("");

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

  const handleAdd = (divId, textareaId) => {
    addKeywords(keyword().split(","), divId, textareaId);
    update(divId, textareaId);
    setKeyword("");
  };

  const handleCopy = (textareaId) => {
    const textarea = document.getElementById(textareaId);
    navigator.clipboard.writeText(textarea.value);
  };

  const handleRemove = (button, divId, textareaId) => {
    button.nextSibling.remove();
    button.remove();
    update(divId, textareaId);
  };

  return (
    <>
      Keyword:
      <div class="row">
        <input
          type="text"
          value={keyword()}
          onInput={(e) => setKeyword(e.target.value)}
        />
        &nbsp;
        <button
          onClick={() => handleAdd(`${props.id}-keywords`, `${props.id}-result`)}
        >
          Add
        </button>
      </div>
      <br />
      Keywords:
      <div id={`${props.id}-keywords`}></div>
      <br />
      Result:
      <div class="row">
        <textarea id={`${props.id}-result`} readonly></textarea>
        &nbsp;
        <button onClick={() => handleCopy(`${props.id}-result`)}>Copy</button>
      </div>
    </>
  );
}

export default Prompt;
