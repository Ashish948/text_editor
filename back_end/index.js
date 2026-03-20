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
      message: "Content saved successfully",
      id: result.insertId,
    });
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

  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  const query = "UPDATE documents SET content = ? WHERE id = ?";

  connection.query(query, [content, id], (err) => {
    if (err) {
      return res.status(500).json({ error: "Update failed" });
    }

    res.json({ message: "Document updated successfully" });
  });
});


app.delete("/delete-all", (req, res) => {
  const { confirm } = req.body;

  if (confirm !== "YES") {
    return res.status(400).json({
      error: "Confirmation required",
    });
  }

  const query = "TRUNCATE TABLE documents";

  connection.query(query, (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to truncate table" });
    }

    res.json({
      message: "All documents deleted successfully",
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

  socket.on("join-document", (docId) => {
    socket.join(docId);
    console.log(`User joined room: ${docId}`);
  });

  socket.on("editor-change", ({ docId, code }) => {
    socket.to(docId).emit("editor-change", code);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});


server.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});