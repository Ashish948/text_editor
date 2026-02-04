import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

function App() {
  const [code, setCode] = useState(``);

  return (
    <div style={{ padding: "20px" }}>
      <h2>CodeMirror + Vite + React</h2>

      <CodeMirror
        value={code}
        height="900px"
        theme={oneDark}
        extensions={[javascript({ jsx: true })]}
        onChange={(value) => setCode(value)}
      />
    </div>
  );
}

export default App;
