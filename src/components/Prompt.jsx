import { createSignal, createMemo, Index } from "solid-js";

function Prompt(props) {
  const [keyword, setKeyword] = createSignal("");
  const result = createMemo(() => props.keywords.join(", "));

  const handleAdd = () => {
    props.onAdd?.(keyword());
    setKeyword("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result());
  };

  const handleDecreaseAttention = () => {
    setKeyword((prev) => `[${prev}]`);
  };

  const handleIncreaseAttention = () => {
    setKeyword((prev) => `(${prev})`);
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
        <button onclick={handleIncreaseAttention}>Increase Attention</button>
        &nbsp;
        <button onclick={handleDecreaseAttention}>Decrease Attention</button>
        &nbsp;
        <button onClick={handleAdd}>Add</button>
      </div>
      <br />
      Keywords:
      <div class="row">
        <div class="keywords">
          <Index each={props.keywords}>
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
        &nbsp;
        <button onClick={props.onClear}>Clear</button>
      </div>
      <br />
      Result:
      <div class="row">
        <textarea readonly value={result()}></textarea>
        &nbsp;
        <button onClick={() => handleCopy()}>Copy</button>
      </div>
    </>
  );
}

export default Prompt;
