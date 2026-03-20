import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { socket } from "./client";

function App() {
  const [code, setCode] = useState("");
  const docId = "default-doc";

  const bigFontTheme = EditorView.theme({
    "&": {
      fontSize: "20px",
    },
  });

  useEffect(() => {
    fetch("http://localhost:5000/load")
      .then((res) => res.json())
      .then((data) => {
        setCode(data.content);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    socket.emit("join-document", docId);

    socket.on("editor-change", (newCode) => {
      setCode(newCode);
    });

    return () => socket.off("editor-change");
  }, []);

  const handleSave = async () => {
    try {
      await fetch("http://localhost:5000/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: code }),
      });

      alert("Saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving data");
    }
  };

  const handleEdit = async () => {
    try {
      const res = await fetch("http://localhost:5000/load");
      const data = await res.json();
      setCode(data.content);
      alert("Document loaded!\nStart editing.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete everything?")) return;

    try {
      await fetch("http://localhost:5000/delete-all", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirm: "YES" }),
      });

      setCode("");

      socket.emit("editor-change", {
        docId,
        code: "",
      });

      alert("Deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Error deleting data");
    }
  };

  return (
    <div style={{ padding: "15px" }}>
      <h1 className="font-serif text-center text-4xl font-bold my-7">
        The TEXT EDITOR
      </h1>

      <div className="flex bg-[rgb(235,233,233)] my-1 py-1 ml-[75%] w-110 justify-evenly rounded-xl">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-[rgb(11,165,204)] text-white rounded"
        >
          Save
        </button>

        <button
          onClick={handleEdit}
          className="px-6 py-2 bg-[rgb(11,165,204)] text-white rounded"
        >
          Edit
        </button>

        <button
          onClick={handleDelete}
          className="px-6 py-2 bg-[rgb(11,165,204)] text-white rounded"
        >
          Delete
        </button>
      </div>

      <CodeMirror
        value={code}
        height="750px"
        theme={oneDark}
        extensions={[javascript({ jsx: true }), bigFontTheme]}
        onChange={(value) => {
          setCode(value);

          socket.emit("editor-change", {
            docId,
            code: value,
          });
        }}
      />
    </div>
  );
}

export default App;