# Wahala Sorter — Code Audit

A friendly audit covering four angles: **vulnerabilities**, **performance traps**, **accessibility misses**, and **broken software engineering principles**. Every issue comes with a fix and a plain-English explanation of why that fix works.

---

## Vulnerabilities

### 1. `crypto.randomUUID()` crashes on plain HTTP

**Where:** `src/App.jsx:29`

**The problem:** `crypto.randomUUID()` only works in a **secure context** — that means the page must be served over HTTPS or localhost. If someone deploys this on a regular HTTP server (or opens the HTML file directly from disk), every single `addTask()` call throws `ReferenceError: crypto is not defined` and the app breaks. Nothing gets added. No error message. Just a white screen or silence.

```js
{ id: crypto.randomUUID(), title, column: 'now', timestamp: new Date() },
```

**The fix:** Replace `crypto.randomUUID()` with a simple counter or a `Date.now()`-based fallback that never throws:

```js
let nextId = 0
function generateId() {
  try {
    return crypto.randomUUID()
  } catch {
    return `task-${Date.now()}-${++nextId}`
  }
}
```

Or skip the risk and just use `Date.now() + Math.random()` — unique enough for a to-do app:

```js
{ id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ... }
```

**Why this works:** Now `addTask()` works everywhere — HTTPS, HTTP, file://, even in Node.js environments. The ID doesn't need to be cryptographically secure for a to-do app; it just needs to be unique on the page.

---

### 2. No input length limit — easy to paste a novel

**Where:** `src/App.jsx:78-84`

**The problem:** The text input has no `maxLength` attribute. A user could paste the entire text of *War and Peace* into a single task. The task card would still try to render it. The UI doesn't break, but you get absurdly wide task cards, screen reader verbosity, and a cluttered display.

**The fix:** Add a `maxLength` to cap reasonable task titles:

```jsx
<input className="add-input" value={input}
  onChange={(e) => setInput(e.target.value)}
  placeholder="What's the wahala?" maxLength={200} autoFocus />
```

Also add a character counter or truncate in CSS as a safety net:

```css
.task-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

**Why this works:** `maxLength` prevents absurdly long input at the source — the user can't even submit it. The CSS truncation is a belt-and-suspenders measure that keeps the UI tidy no matter what.

---

## Performance Traps

### 3. Same filter runs three times per render

**Where:** `src/App.jsx:91-92`

**The problem:** Every time React re-renders, the code runs `tasks.filter(...)` inside the `.map()` loop — once per column. With 3 columns, that's 3 full passes through the array. If you had 500 tasks, that's 1,500 iterations per render.

```js
{COLUMNS.map(({ key, label }) => {
  const colTasks = tasks.filter((t) => t.column === key)
  // ...
})}
```

**The fix:** Filter once, cache the result:

```js
// Outside the component or memoized inside:
function groupTasksByColumn(tasks) {
  return tasks.reduce((groups, task) => {
    ;(groups[task.column] ??= []).push(task)
    return groups
  }, {})
}
```

Then inside the component:

```jsx
const grouped = useMemo(() => groupTasksByColumn(tasks), [tasks])

{COLUMNS.map(({ key, label }) => {
  const colTasks = grouped[key] ?? []
  // ...
})}
```

**Why this works:** A single `reduce()` pass groups all tasks into a dictionary (`{ now: [...], soon: [...], later: [...] }`) in one go instead of three separate filters. `useMemo` skips the work entirely if `tasks` hasn't changed, which is most renders.

---

### 4. Stale-closure trap waiting to happen

**Where:** `src/App.jsx:73-75`

**The problem:** The form's `onSubmit` handler is an inline arrow function that closes over `input` and `addTask`. This isn't a problem *yet*, but it's a pattern that leads to stale closures. If you ever extract `addTask` outside the component or pass handlers down to child components, these inline functions break referential equality and trigger unnecessary re-renders.

```jsx
<form className="add-form"
  onSubmit={(e) => {
    e.preventDefault()
    addTask()
  }}
>
```

**The fix:** Extract into a stable function reference:

```jsx
function handleSubmit(e) {
  e.preventDefault()
  addTask()
}

// In JSX:
<form className="add-form" onSubmit={handleSubmit}>
```

**Why this works:** `handleSubmit` is the same function object every render. If you later pass it as a prop to a child component wrapped in `React.memo`, that child won't re-render unnecessarily. It also makes the code easier to test — you can call `handleSubmit` directly with a mock event.

---

## Accessibility Misses

### 5. The input field is invisible to screen readers

**Where:** `src/App.jsx:78-84`

**The problem:** The text input has no `<label>`. A placeholder does not count as a label — it disappears the moment you type. Screen reader users hear "edit text" with no context about what they should type.

```jsx
<input className="add-input" value={input}
  onChange={(e) => setInput(e.target.value)}
  placeholder="What's the wahala?" autoFocus />
```

**The fix:** Add a visible or screen-reader-only `<label>` with `htmlFor` connected to the input's `id`:

```jsx
<label htmlFor="task-input" className="sr-only">New task</label>
<input id="task-input" className="add-input" value={input}
  onChange={(e) => setInput(e.target.value)}
  placeholder="What's the wahala?" autoFocus />
```

Add a utility class to visually hide the label while keeping it accessible:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

**Why this works:** Screen readers now announce "New task, edit text" when the input receives focus. The label stays invisible on screen but fully available to assistive technology. Users know exactly what they're supposed to type.

---

### 6. Delete button says "times" to a screen reader

**Where:** `src/App.jsx:116-122`

**The problem:** The button contains `&times;` (the × character) with a `title="Delete task"`. But `title` attributes are spotty across screen readers — many ignore them entirely. Without it, a screen reader announces "times button" or reads the raw character. Nobody knows it deletes anything.

```jsx
<button className="delete-btn" onClick={() => deleteTask(task.id)}
  title="Delete task">
  &times;
</button>
```

**The fix:** Add `aria-label` to give the button a clear accessible name:

```jsx
<button className="delete-btn" onClick={() => deleteTask(task.id)}
  aria-label={`Delete "${task.title}"`}>
  &times;
</button>
```

**Why this works:** `aria-label` is the authoritative accessible name — it overrides all other naming methods. The user hears "Delete 'Buy groceries'" instead of "times". They know exactly what will be deleted. Including the task title is an extra touch that prevents accidental deletions.

---

### 7. Drag-and-drop only works with a mouse

**Where:** `src/App.jsx:44-62`

**The problem:** The entire drag-and-drop system uses native HTML5 Drag and Drop events — `dragstart`, `dragover`, `drop`, etc. These are mouse-only. Keyboard users, switch users, and screen reader users cannot move a task between columns. They're locked out of a major feature.

**The fix:** Add keyboard-based move controls. The simplest approach: add two buttons per task — "Move left" and "Move right".

```jsx
// Find the current and adjacent column positions:
function getAdjacentColumns(currentKey) {
  const idx = COLUMNS.findIndex((c) => c.key === currentKey)
  return {
    left: idx > 0 ? COLUMNS[idx - 1].key : null,
    right: idx < COLUMNS.length - 1 ? COLUMNS[idx + 1].key : null,
  }
}
```

Then inside each task card:

```jsx
{getAdjacentColumns(task.column).left && (
  <button onClick={() => moveTask(task.id, getAdjacentColumns(task.column).left)}
    aria-label={`Move "${task.title}" left`}>
    &larr;
  </button>
)}
{getAdjacentColumns(task.column).right && (
  <button onClick={() => moveTask(task.id, getAdjacentColumns(task.column).right)}
    aria-label={`Move "${task.title}" right"`}>
    &rarr;
  </button>
)}
```

**Why this works:** Keyboard users can now tab to the move buttons and press Enter/Space to move tasks. No mouse needed. The `aria-label` keeps screen readers informed. This also benefits power users who can tab through tasks faster than dragging.

---

### 8. No feedback when tasks change — users hear silence

**Where:** `src/App.jsx:102-124`

**The problem:** When a task is added, deleted, or moved, there's no `aria-live` region to announce the change. A sighted user sees the task appear/disappear. A screen reader user — nothing. They have to manually navigate around to discover what happened.

**The fix:** Add a live region that announces task count changes:

```jsx
export default function App() {
  const [tasks, setTasks] = useState([])
  const [input, setInput] = useState('')
  const [dragOver, setDragOver] = useState(null)
  const [announcement, setAnnouncement] = useState('')
```

Update `addTask()`, `deleteTask()`, and `moveTask()` to set announcements:

```jsx
function addTask() {
  const title = input.trim()
  if (!title) return
  setTasks((prev) => [...prev, { id: crypto.randomUUID(), title, column: 'now', timestamp: new Date() }])
  setInput('')
  setAnnouncement(`Added "${title}" to Now`)
}

function deleteTask(id) {
  const task = tasks.find((t) => t.id === id)
  setTasks((prev) => prev.filter((t) => t.id !== id))
  if (task) setAnnouncement(`Deleted "${task.title}"`)
}
```

Then render a visually hidden live region:

```jsx
<div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
  {announcement}
</div>
```

**Why this works:** `aria-live="polite"` tells the browser to announce the content when the user is idle — no interruption. `role="status"` tells screen readers this is status information. The `.sr-only` class keeps it invisible on screen. Users now hear "Added 'Buy groceries' to Now" right after they add a task.

---

### 9. Keyboard focus outline is removed

**Where:** `src/App.css:53-54`

**The problem:** The input has `outline: none` and relies only on a border-color change for focus indication. For users who navigate by keyboard, the focus ring is their cursor — it tells them where they are on the page. Removing it without a strong visual replacement leaves them lost.

```css
.add-input:focus {
  border-color: #7fa99b;
}
```

**The fix:** Keep the outline or make it very visible:

```css
.add-input:focus {
  border-color: #7fa99b;
  outline: 2px solid #7fa99b;
  outline-offset: 2px;
}
```

**Why this works:** The outline is visible around the input, making it clear where keyboard focus is. Every user who tabs through the page can see their position.

---

## Violated Software Engineering Principles

### 10. God Component — SRP violation

**Where:** `src/App.jsx:19-132` (the entire `App` function)

**The problem:** The single `App` component does everything:

- Manages three different pieces of state
- Handles form submission
- Handles drag-and-drop events
- Renders the header
- Renders the form
- Renders all three columns
- Renders every task card
- Formats dates

That's about a dozen responsibilities. If you need to change how a task card looks, you're editing the same function that handles drag events and manages form state. This makes the code harder to read, harder to test, and harder to change without breaking something.

**The fix:** Split into smaller components:

```
src/
  components/
    Header.jsx         — title and subtitle
    AddTaskForm.jsx    — input and add button
    Board.jsx          — the three-column grid
    Column.jsx         — a single column (Now/Soon/Later)
    TaskCard.jsx       — a single task with move/delete
  hooks/
    useTasks.js        — custom hook for all task CRUD logic
```

Example — a `TaskCard` component:

```jsx
export default function TaskCard({ task, onDelete, onMove }) {
  return (
    <div className="task" draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', task.id)}>
      <div className="task-body">
        <span className="task-title">{task.title}</span>
        <span className="task-meta">
          {task.column} &middot; {formatTime(task.timestamp)}
        </span>
      </div>
      <button className="delete-btn"
        onClick={() => onDelete(task.id)}
        aria-label={`Delete "${task.title}"`}>
        &times;
      </button>
    </div>
  )
}
```

**Why this works:** Each component has one job. `TaskCard` only knows how to display a task — if you change its layout, you don't risk breaking drag logic in `Board`. You can test `TaskCard` in isolation. The `App` component becomes a thin orchestrator that wires everything together.

---

### 11. Magic string baked into logic

**Where:** `src/App.jsx:29`

**The problem:** New tasks always land in the `'now'` column because the string `'now'` is hardcoded.

```js
{ id: crypto.randomUUID(), title, column: 'now', timestamp: new Date() },
```

If someone changes `COLUMNS` to rename `'now'` to `'urgent'`, or reorders the array, this line silently creates tasks that belong to a column that no longer exists. No error. No warning. Tasks just disappear — they're filtered out because `t.column === key` never matches.

**The fix:** Reference the first column by its position in the data:

```js
{ id: generateId(), title, column: COLUMNS[0].key, timestamp: new Date() },
```

**Why this works:** `COLUMNS[0].key` is a single source of truth. If the column key changes, every piece of code that references it automatically picks up the change. The relationship between "new tasks go in the first column" and "the first column is defined in COLUMNS" is explicit.

---

### 12. Business logic is untestable

**Where:** `src/App.jsx:24-42`

**The problem:** `addTask`, `deleteTask`, and `moveTask` are local functions inside the React component. To test them, you'd have to render the full component in a browser environment, simulate events, and wait for re-renders. This makes testing slow, fragile, and complex for simple logic.

**The fix:** Extract the logic into pure functions or a custom hook:

```js
// hooks/useTasks.js
import { useState, useCallback } from 'react'

function createTask(title, column) {
  return {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    column,
    timestamp: new Date(),
  }
}

export default function useTasks(initialColumn) {
  const [tasks, setTasks] = useState([])

  const addTask = useCallback((title) => {
    if (!title.trim()) return
    const task = createTask(title.trim(), initialColumn)
    setTasks((prev) => [...prev, task])
  }, [initialColumn])

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const moveTask = useCallback((id, to) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, column: to } : t))
    )
  }, [])

  return { tasks, addTask, deleteTask, moveTask }
}
```

Now you can test `createTask` directly — no React needed. And you can test `useTasks` with `renderHook` from React Testing Library.

```js
// __tests__/tasks.test.js
test('createTask assigns the given column', () => {
  const task = createTask('Test', 'later')
  expect(task.title).toBe('Test')
  expect(task.column).toBe('later')
  expect(task.timestamp).toBeInstanceOf(Date)
})
```

**Why this works:** Extracting logic makes it testable without a browser. You verify `createTask` returns the right shape, that `deleteTask` removes by id, that `moveTask` changes the column — all in milliseconds, all deterministic. The React component becomes a thin shell that delegates to tested code.

---

### 13. App state dies on refresh — no persistence

**Where:** The entire app, no persistence strategy

**The problem:** Close the tab, reopen it — all tasks are gone. Every task you carefully sorted into Now, Soon, and Later is wiped. Users expect their data to survive a page refresh. This violates the principle of **least surprise**.

**The fix:** Persist tasks to `localStorage`:

```js
function loadTasks() {
  try {
    const saved = localStorage.getItem('wahala-sorter-tasks')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveTasks(tasks) {
  try {
    localStorage.setItem('wahala-sorter-tasks', JSON.stringify(tasks))
  } catch {
    // Storage full or unavailable — fail silently
  }
}
```

Then wire them into the app:

```jsx
const [tasks, setTasks] = useState(loadTasks)

// Save whenever tasks change:
useEffect(() => { saveTasks(tasks) }, [tasks])
```

**Why this works:** `localStorage` survives page refreshes — data persists in the browser. The `try/catch` handles edge cases (private browsing in some browsers, full storage) without crashing. Users refresh the page and see their tasks exactly where they left them.

---

### 14. Open/Closed Principle — adding a feature means editing App.jsx

**Where:** Every new feature touches `src/App.jsx`

**The problem:** The Open/Closed Principle says: *open for extension, closed for modification*. If you want to add search, filtering by date, priority tags, or a dark mode toggle, you have to open `App.jsx` and modify it directly. Every new feature increases its complexity and risk of regression.

**The fix:** Use composition from the start. Each feature lives in its own component and communicates upward:

```
App
├── Header
├── AddTaskForm
├── TaskFilters         ← new, doesn't touch existing code
├── Board
│   ├── Column (Now)
│   │   └── TaskCard × N
│   ├── Column (Soon)
│   │   └── TaskCard × N
│   └── Column (Later)
│       └── TaskCard × N
└── ThemeToggle         ← new, doesn't touch existing code
```

**Why this works:** Adding `TaskFilters` means creating a new file `<TaskFilters>` and dropping it into `App`. You never touch `Board`, `Column`, or `TaskCard`. No risk of breaking existing layout or logic. Each component is a sealed unit that can be extended or replaced independently.

---

## Summary

| # | Category | Issue | Severity | Fix |
|---|----------|-------|----------|-----|
| 1 | Vulnerability | `crypto.randomUUID()` needs HTTPS | High | Use fallback ID generation |
| 2 | Vulnerability | No input length limit | Low | Add `maxLength` |
| 3 | Performance | 3x filter per render | Medium | Single `reduce` + `useMemo` |
| 4 | Performance | Inline functions create stale closures | Low | Extract stable handlers |
| 5 | Accessibility | Input has no label | High | Add `<label htmlFor>` |
| 6 | Accessibility | Delete button has no accessible name | High | Add `aria-label` |
| 7 | Accessibility | Drag-and-drop is mouse-only | High | Add keyboard move buttons |
| 8 | Accessibility | No live region for status changes | Medium | Add `aria-live` region |
| 9 | Accessibility | Focus outline removed | Medium | Restore visible outline |
| 10 | SRP | God component does everything | High | Split into smaller components |
| 11 | DRY/Magic string | Hardcoded `'now'` column | Medium | Use `COLUMNS[0].key` |
| 12 | Testability | Logic trapped inside component | High | Extract to pure functions/hooks |
| 13 | Robustness | No persistence, state lost on refresh | Medium | Add `localStorage` |
| 14 | Open/Closed | Adding features requires modifying App.jsx | Medium | Compose from start |
