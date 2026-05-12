import { useState } from 'react'
import './App.css'

const COLUMNS = [
  { key: 'now', label: 'Now' },
  { key: 'soon', label: 'Soon' },
  { key: 'later', label: 'Later' },
]

function formatTime(date) {
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function App() {
  const [tasks, setTasks] = useState([])
  const [input, setInput] = useState('')
  const [dragOver, setDragOver] = useState(null)

  function addTask() {
    const title = input.trim()
    if (!title) return
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title, column: 'now', timestamp: new Date() },
    ])
    setInput('')
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function moveTask(id, to) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, column: to } : t))
    )
  }

  function handleDragStart(e, id) {
    e.dataTransfer.setData('text/plain', id)
  }

  function handleDragOver(e, col) {
    e.preventDefault()
    setDragOver(col)
  }

  function handleDragLeave() {
    setDragOver(null)
  }

  function handleDrop(e, col) {
    e.preventDefault()
    setDragOver(null)
    const id = e.dataTransfer.getData('text/plain')
    if (id) moveTask(id, col)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Wahala Sorter</h1>
        <p className="subtitle">Sort your wahala into Now, Soon, or Later</p>
      </header>

      <form
        className="add-form"
        onSubmit={(e) => {
          e.preventDefault()
          addTask()
        }}
      >
        <input
          className="add-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What's the wahala?"
          autoFocus
        />
        <button className="add-btn" type="submit" disabled={!input.trim()}>
          Add
        </button>
      </form>

      <div className="board">
        {COLUMNS.map(({ key, label }) => {
          const colTasks = tasks.filter((t) => t.column === key)
          return (
            <div
              key={key}
              className={`column ${dragOver === key ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, key)}
            >
              <h2 className="column-title">{label}</h2>
              <div className="task-list">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="task"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  >
                    <div className="task-body">
                      <span className="task-title">{task.title}</span>
                      <span className="task-meta">
                        {task.column} &middot; {formatTime(task.timestamp)}
                      </span>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => deleteTask(task.id)}
                      title="Delete task"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
