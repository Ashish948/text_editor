const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "Ashish@2311054",
  database: "textEditor",
});

connection.connect((err) => {
  if (err) {
    console.log("MySQL Connection Failed:", err.message);
  } else {
    console.log("Connected to MySQL");
  }
});

app.get("/users", (req, res) => {
  connection.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

app.post("/edit", (req, res) => {
  const { content } = req.body;

  res.json({
    message: "Edit received",
    data: content,
  });
});

app.delete("/delete", (req, res) => {
  res.json({
    message: "Delete route working",
  });
});

app.post("/save", (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  const query = "INSERT INTO documents (content) VALUES (?)";

  connection.query(query, [content], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to save data" });
    }

    res.json({
      message: "✅ Content saved successfully",
      id: result.insertId,
    });
  });
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("editor-change", (code) => {
    console.log("Code updated");
    
    socket.broadcast.emit("editor-change", code);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});


app.get("/load", (req, res) => {
  const query = "SELECT * FROM documents ORDER BY id DESC LIMIT 1";

  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error loading data" });
    }

    if (results.length === 0) {
      return res.json({ content: "" });
    }

    res.json({ content: results[0].content });
  });
});


app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.get("/document/:id", (req, res) => {
  const { id } = req.params;

  const query = "SELECT * FROM documents WHERE id = ?";

  connection.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching document" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json(results[0]);
  });
});

app.put("/update/:id", (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  const query = "UPDATE documents SET content = ? WHERE id = ?";

  connection.query(query, [content, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Update failed" });
    }

    res.json({ message: "Document updated successfully" });
  });
});

app.delete("/delete/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM documents WHERE id = ?";

  connection.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Delete failed" });
    }

    res.json({ message: "Document deleted successfully" });
  });
});


server.listen(5000, () => {
  console.log("🚀 Server running at http://localhost:5000");
});