import React, { useRef, useState } from "react";

function TextPage() {
  const editorRef = useRef(null);
  const [dark, setDark] = useState(false);

  const format = (command) => {
    document.execCommand(command, false, null);
  };

  const changeFontSize = (size) => {
    if (!size) return;
    document.execCommand("fontSize", false, "7");

    const fonts = editorRef.current.getElementsByTagName("font");
    for (let font of fonts) {
      if (font.size === "7") {
        font.removeAttribute("size");
        font.style.fontSize = size;
      }
    }
  };

  const downloadText = () => {
    const text = editorRef.current.innerText;
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "document.txt";
    a.click();
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${
        dark ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <div
        className={`w-full max-w-4xl rounded-2xl shadow-xl ${
          dark ? "bg-gray-800 text-white" : "bg-white"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h1 className="text-xl font-semibold">Text Editor</h1>
          <button
            onClick={downloadText}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Save
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b bg-gray-50">
          <ToolbarButton label="Bold" onClick={() => format("bold")} />
          <ToolbarButton label="Italic" onClick={() => format("italic")} />
          <ToolbarButton label="Underline" onClick={() => format("underline")} />

          <select
            onChange={(e) => changeFontSize(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Font Size</option>
            <option value="14px">14</option>
            <option value="16px">16</option>
            <option value="18px">18</option>
            <option value="24px">24</option>
          </select>

          <button
            onClick={() => setDark(!dark)}
            className="ml-auto px-4 py-2 border rounded-lg text-sm hover:bg-gray-200"
          >
            {dark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Editor */}
        <div className="px-6 py-4">
          <div
            ref={editorRef}
            contentEditable
            className={`min-h-[300px] p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              dark
                ? "bg-gray-900 text-white border-gray-700"
                : "bg-white text-gray-800 border-gray-300"
            }`}
          >
            Start typing here...
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-200 focus:outline-none"
    >
      {label}
    </button>
  );
}

export default TextPage;
