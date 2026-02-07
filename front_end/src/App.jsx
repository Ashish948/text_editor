import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { socket } from "./client"; // uncomment if you have socket setup

function App() {

  // ✅ State added
  const [code, setCode] = useState("");

  // ✅ Big font theme
  const bigFontTheme = EditorView.theme({
    "&": {
      fontSize: "20px",
    },
  });

    // 🔹 Receive updates from backend
  useEffect(() => {
    socket.on("editor-change", (newCode) => {
      setCode(newCode);
    });

    return () => socket.off("editor-change");
  }, []);

   const handleSave = () => {
    console.log("Saved text:", code);
    socket.emit("editor-change", code);
   };

  return (
    <div style={{ padding: "20px" }}>
      <h1 className="font-serif text-center text-4xl font-bold my-7">The TEXT EDITOR</h1>

      <CodeMirror
        value={code}
        height="750px"
        theme={oneDark}
        extensions={[javascript({ jsx: true }), bigFontTheme]}
        onChange={(value) => setCode(value)}
      />

      <div className="flex justify-center mt-4">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-[rgb(11,165,204)] text-white rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default App;

