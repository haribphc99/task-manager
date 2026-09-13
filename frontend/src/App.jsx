import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get tasks from backend
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();

      setTasks(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load tasks. Please check the backend.");
    } finally {
      setLoading(false);
    }
  };

  // Run once when the component loads
  useEffect(() => {
    fetchTasks();
  }, []);

  // Add task
  const addTask = async () => {
    if (!title.trim()) {
      return;
    }

    try {
      setError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      const newTask = await response.json();

      setTasks((previousTasks) => [newTask, ...previousTasks]);

      setTitle("");
    } catch (error) {
      console.error(error);
      setError("Unable to add task.");
    }
  };

  // Add task when pressing Enter
  const handleInputKeyDown = (event) => {
    if (event.key === "Enter") {
      addTask();
    }
  };

  // Complete / uncomplete task
  const toggleTask = async (task) => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();

      setTasks((previousTasks) =>
        previousTasks.map((item) =>
          item.id === updatedTask.id ? updatedTask : item,
        ),
      );
    } catch (error) {
      console.error(error);
      setError("Unable to update task.");
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task.id !== id),
      );
    } catch (error) {
      console.error(error);
      setError("Unable to delete task.");
    }
  };

  // Apply filter
  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") {
      return !task.completed;
    }

    if (filter === "completed") {
      return task.completed;
    }

    return true;
  });

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <div className="logo">✓</div>
            <span>Task Manager</span>
          </div>

          <div className="header-message">Stay Organized, Get More Done!</div>

          <button className="menu-button">☰</button>
        </div>
      </header>

      {/* Main */}
      <main className="main">
        {/* Add Task */}
        <section className="add-card">
          <h2>Add a New Task</h2>

          <div className="add-form">
            <input
              type="text"
              placeholder="Enter a task..."
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={handleInputKeyDown}
            />

            <button className="add-button" onClick={addTask}>
              Add Task
            </button>
          </div>
        </section>

        {/* Tasks */}
        <section className="tasks-section">
          <div className="tasks-header">
            <h2>Your Tasks ({tasks.length})</h2>

            <div className="filters">
              <button
                className={filter === "all" ? "filter active" : "filter"}
                onClick={() => setFilter("all")}
              >
                All
              </button>

              <button
                className={filter === "active" ? "filter active" : "filter"}
                onClick={() => setFilter("active")}
              >
                Active
              </button>

              <button
                className={filter === "completed" ? "filter active" : "filter"}
                onClick={() => setFilter("completed")}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Error */}
          {error && <div className="error-message">{error}</div>}

          {/* Loading */}
          {loading && <div className="empty-state">Loading tasks...</div>}

          {/* Empty */}
          {!loading && filteredTasks.length === 0 && (
            <div className="empty-state">
              {filter === "all"
                ? "No tasks yet. Add your first task!"
                : `No ${filter} tasks.`}
            </div>
          )}

          {/* Task list */}
          {!loading && filteredTasks.length > 0 && (
            <div className="task-list">
              {filteredTasks.map((task) => (
                <div
                  className={
                    task.completed ? "task-card completed-task" : "task-card"
                  }
                  key={task.id}
                >
                  <div className="task-left">
                    <button
                      className={
                        task.completed ? "checkbox checked" : "checkbox"
                      }
                      onClick={() => toggleTask(task)}
                      aria-label={
                        task.completed
                          ? "Mark task active"
                          : "Mark task completed"
                      }
                    >
                      {task.completed ? "✓" : ""}
                    </button>

                    <div className="task-info">
                      <div
                        className={
                          task.completed
                            ? "task-title completed-title"
                            : "task-title"
                        }
                      >
                        {task.title}
                      </div>

                      <div className="task-date">
                        Created: {formatDate(task.created_at)}
                      </div>
                    </div>
                  </div>

                  <button
                    className="delete-button"
                    onClick={() => deleteTask(task.id)}
                  >
                    <span className="trash-icon">🗑</span>

                    <span className="delete-text">Delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">Stay Organized, Get More Done!</footer>
    </div>
  );
}

export default App;
