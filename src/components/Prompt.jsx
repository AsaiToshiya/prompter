import { createSignal, Index } from "solid-js";

function Prompt(props) {
  const [keyword, setKeyword] = createSignal("");

  const handleAdd = () => {
    props.onAdd?.(keyword());
    setKeyword("");
  };

  const handleCopy = (textareaId) => {
    navigator.clipboard.writeText(props.result());
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
      <div id={`${props.id}-keywords`}>
        <Index each={props.keywords()}>
          {(keyword, i) => (
            <>
              <button class="keyword" onClick={[props.onRemove, i]}>
                {keyword()}
              </button>
              {"\n"}
            </>
          )}
        </Index>
      </div>
      <br />
      Result:
      <div class="row">
        <textarea
          id={`${props.id}-result`}
          readonly
          value={props.result()}
        ></textarea>
        &nbsp;
        <button onClick={() => handleCopy(`${props.id}-result`)}>Copy</button>
      </div>
    </>
  );
}

export default Prompt;
