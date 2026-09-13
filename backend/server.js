const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.get("/", (req, res) => {
  res.send("Task Manager Backend is running");
});

app.get("/api/tasks", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks ORDER BY created_at DESC",
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      error: "Failed to fetch tasks",
    });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: "Task title is required",
      });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title)
             VALUES ($1)
             RETURNING *`,
      [title.trim()],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);

    res.status(500).json({
      error: "Failed to create task",
    });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const result = await pool.query(
      `UPDATE tasks
             SET completed = $1
             WHERE id = $2
             RETURNING *`,
      [completed, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);

    res.status(500).json({
      error: "Failed to update task",
    });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const result = await pool.query(
      `UPDATE tasks
             SET completed = $1
             WHERE id = $2
             RETURNING *`,
      [completed, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);

    res.status(500).json({
      error: "Failed to update task",
    });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM tasks
             WHERE id = $1
             RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);

    res.status(500).json({
      error: "Failed to delete task",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
