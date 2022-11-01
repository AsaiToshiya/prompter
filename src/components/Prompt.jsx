import { createSignal } from "solid-js";

function Prompt(props) {
  const [keyword, setKeyword] = createSignal("");

  const handleAdd = () => {
    props.onAdd?.(keyword());
    setKeyword("");
  };

  const handleCopy = (textareaId) => {
    const textarea = document.getElementById(textareaId);
    navigator.clipboard.writeText(textarea.value);
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
        <button onClick={handleAdd}>Add</button>
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
