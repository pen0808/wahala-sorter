# 🧸 Wahala Sorter — Explained Like You're 7

Imagine you have a magical to-do list that helps you sort your **wahala** (problems/tasks) into three piles:
- **Now** — things you must do right away
- **Soon** — things you'll do a little later
- **Later** — things that can wait

You can even **drag** tasks between piles! Here's how the code works, one file at a time.

---

## 📄 File: `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Wahala Sorter</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Line 1:** `<!doctype html>` — Says "Hey browser, this is an HTML page!"

**Line 2:** `<html lang="en">` — The whole page starts here. The language is English.

**Lines 3–7:** The `<head>` is like the brain of the page — it holds secret info:
- **Line 4:** `charset="UTF-8"` — Lets the page show letters, emojis, and symbols properly.
- **Line 5:** `viewport` — Tells the phone/tablet how to zoom so it looks nice.
- **Line 6:** The title that shows up on the browser tab: **Wahala Sorter**.

**Line 8:** `<body>` — Everything you see on the screen goes here.

**Line 9:** `<div id="app"></div>` — An empty box. React will fill this box with all our stuff.

**Line 10:** `<script type="module" src="/src/main.jsx"></script>` — "Hey browser, go grab this JavaScript file and run it." That file will wake up React and put our app inside the `<div id="app">` box.

**Lines 11–12:** Close the body and html tags.

---

## 📄 File: `src/main.jsx`

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('app')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Line 1:** `import { StrictMode } from 'react'` — Gets a tool from React that checks for mistakes in our code (like a strict teacher).

**Line 2:** `import { createRoot } from 'react-dom/client'` — Gets the tool that lets React paint inside our HTML page.

**Line 3:** `import App from './App'` — Gets the main **App** component (the boss of our app) from the `App.jsx` file.

**Line 5:** `createRoot(document.getElementById('app'))` — Finds the empty `<div id="app">` box from `index.html` and tells React "this is where you'll work."

**Line 6:** `.render(<StrictMode> ... </StrictMode>)` — Tells React to draw the `<App />` inside that box. `<StrictMode>` wraps it so React can double-check our code for bugs.

**Lines 6–8:** `<StrictMode>` wraps `<App />` so React keeps an eye on everything.

---

## 📄 File: `src/App.jsx`

This is the **heart** of the app!

### The Imports

```jsx
import { useState } from 'react'
import './App.css'
```

**Line 1:** `import { useState } from 'react'` — `useState` is like a magic notebook. If we write something in it, React remembers it and updates the screen when it changes.

**Line 2:** `import './App.css'` — Brings in the styling (colors, sizes, fonts) from `App.css`.

### The Three Columns

```jsx
const COLUMNS = [
  { key: 'now', label: 'Now' },
  { key: 'soon', label: 'Soon' },
  { key: 'later', label: 'Later' },
]
```

**Lines 4–8:** We make a list called `COLUMNS` that has three columns. Each column has:
- `key` — a secret short name (like "now")
- `label` — the name you see on screen (like "Now")

It's like having three buckets: **Now**, **Soon**, and **Later**.

### The Time Helper

```jsx
function formatTime(date) {
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
```

 **Lines 10–17:** A helper that turns a date into something readable — like "Apr 12, 03:45 PM". It takes the date and formats it nicely so we can show when a task was made.

### The App Component (the Boss)

```jsx
export default function App() {
```

**Line 19:** We create the main function called `App`. `export default` means other files can use it. This is the big boss of our app.

### State Variables (the Magic Notebooks)

```jsx
  const [tasks, setTasks] = useState([])
  const [input, setInput] = useState('')
  const [dragOver, setDragOver] = useState(null)
```

**Line 20:** `tasks` starts as an empty list `[]`. It will hold all our tasks. `setTasks` is how we add/remove/change tasks.

**Line 21:** `input` starts as an empty string `''`. It holds whatever the user is typing in the text box. `setInput` is how we update what's being typed.

**Line 22:** `dragOver` starts as `null`. When you drag a task over a column, this remembers which column you're hovering over (so it can light up).

### Adding a Task

```jsx
  function addTask() {
    const title = input.trim()
    if (!title) return
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title, column: 'now', timestamp: new Date() },
    ])
    setInput('')
  }
```

**Line 24:** We define a function called `addTask`.

**Line 25:** We take whatever the user typed and remove empty spaces around it with `.trim()`. That's the `title`.

**Line 26:** `if (!title) return` — If the title is empty (user typed nothing), we stop. No empty tasks allowed!

**Lines 27–30:** `setTasks((prev) => [...prev, { id: crypto.randomUUID(), title, column: 'now', timestamp: new Date() }])` — This looks scary but it's really simple! Let's break it down piece by piece:

Think of each task as a **paper card** with 4 things written on it:

1. **`id: crypto.randomUUID()`** — This gives the task a **secret code** that no other task in the whole world has. `crypto.randomUUID()` is like a magic machine that spits out a unique fingerprint every time you ask. Why do we need this? So if you have two tasks both called "Do homework", we can tell them apart by their secret code!

2. **`title`** — This is just the words you typed in the box. In JavaScript, if you write `{ title }` instead of `{ title: title }`, it's a shortcut that means "make a slot called 'title' and put the value of the variable named 'title' inside." It's like saying "put the thing I typed into a box labeled 'title'."

3. **`column: 'now'`** — This says "this task starts in the **Now** pile." `column` is the name of the pile the task belongs to. Every new task begins in "now" because when you just thought of it, you probably need to do it now!

4. **`timestamp: new Date()`** — `new Date()` is like a clock that snaps a picture of the **exact moment** the task was created — right down to the minute! Later, the app shows this so you know when you wrote the task.

**The whole thing:** `[...prev, { ... }]` — The `...prev` (spread operator) is like taking all the old task cards already on your table and spreading them out. Then we add the new card at the end. `setTasks(...)` puts the whole stack back into the magic notebook so the screen updates.

**Real-world example:** Imagine you have a tray of cookies. You bake one more cookie. You don't throw away the old cookies — you just add the new one next to them. That's exactly what `[...prev, newTask]` does!

**Line 31:** `setInput('')` — Clear the text box so the user can type another task.

### Deleting a Task

```jsx
  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }
```

**Line 34–36:** We define `deleteTask`. When you click the ❌ button on a task, we look at all tasks and **keep only the ones whose id doesn't match** — that removes the one we want to delete. Like saying "everyone except you, leave the room!"

### Moving a Task
0 
```jsx
  function moveTask(id, to) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, column: to } : t))
    )
  }
```

**Lines 38–42:** We define `moveTask`. It goes through all tasks. If a task's id matches the one we want to move, we change its `column` to the new column name (e.g., from "now" to "later"). If it doesn't match, we leave it as is.

### Drag and Drop (the Magic Moving)

```jsx
  function handleDragStart(e, id) {
    e.dataTransfer.setData('text/plain', id)
  }
```

**Lines 44–46:** When you start dragging a task, we remember which task's id we're dragging by storing it in the drag event.

```jsx
  function handleDragOver(e, col) {
    e.preventDefault()
    setDragOver(col)
  }
```

**Lines 48–51:** As you drag over a column, we:
1. Stop the browser from doing its own thing (`e.preventDefault()`)
2. Remember which column you're hovering over so it can light up

```jsx
  function handleDragLeave() {
    setDragOver(null)
  }
```

**Lines 53–55:** When you leave a column, we forget which one was highlighted — the light goes off.

```jsx
  function handleDrop(e, col) {
    e.preventDefault()
    setDragOver(null)
    const id = e.dataTransfer.getData('text/plain')
    if (id) moveTask(id, col)
  }
```

**Lines 57–62:** When you drop the task onto a column:
1. Stop the browser's default behavior
2. Turn off the highlight
3. Grab the id we stored when dragging started
4. Move the task to that column using `moveTask`

### The Visual Part (What You See)

```jsx
  return (
    <div className="app">
```

**Line 64–65:** The `return` says "here's what to draw on screen." Everything inside this `<div className="app">` is our app.

#### Header

```jsx
      <header className="header">
        <h1>Wahala Sorter</h1>
        <p className="subtitle">Sort your wahala into Now, Soon, or Later</p>
      </header>
```

**Lines 66–69:** The title at the top: **Wahala Sorter** with a little subtitle explaining what it does.

#### Input Form

```jsx
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
```

**Lines 71–88:** A form with:
- **Text input** — where you type your task. Every time you type, `onChange` updates the `input` in our magic notebook.
  - `value={input}` — shows whatever is in the notebook
  - `placeholder="What's the wahala?"` — light gray text asking "What's the wahala?"
  - `autoFocus` — the cursor automatically starts blinking here when the page loads
- **Add button** — when clicked (or Enter pressed), it calls `addTask()` to add the task.
  - `disabled={!input.trim()}` — the button is grayed out if nothing is typed

The `onSubmit` on the form calls `e.preventDefault()` to stop the page from refreshing, then calls `addTask()`.

#### The Board (Three Columns)

```jsx
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
```

**Line 90:** The `<div className="board">` holds all three columns side by side.

**Line 91:** We go through each column in `COLUMNS` (Now, Soon, Later) using `.map()` — like saying "for each column, draw this."

**Line 92:** `colTasks` are only the tasks that belong to THIS column (filtered by `t.column === key`).

**Lines 94–99:** Each column box:
- `key={key}` — React needs this to keep track
- `className={`column ${dragOver === key ? 'drag-over' : ''}`}` — if a task is being dragged over this column, add the `drag-over` class to make it light up
- `onDragOver`, `onDragLeave`, `onDrop` — the drag-and-drop magic we explained above

**Line 101:** Shows the column name (Now, Soon, or Later) as a heading.

**Line 102:** `<div className="task-list">` — the container that holds all tasks in this column.

**Lines 103–124:** For each task in this column, we draw a task card:
- `draggable` — makes the task drag-able with your mouse
- `onDragStart` — remembers the task's id when you start dragging
- **Task body:** shows the title and a small meta line with the column name and formatted time
- **Delete button:** a little ❌ (`&times;`) that calls `deleteTask(task.id)` when clicked

```jsx
    </div>
  )
}
```

**Lines 130–132:** Close the app div, close the function.

---

## 📄 File: `src/App.css`

This file makes everything pretty. Let's go through the main parts.

### Reset

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```

**Lines 1–7:** Gets rid of all default spacing. `box-sizing: border-box` makes sizing easier — borders are counted inside the box, not outside.

### Body

```css
body {
  font-family: ...sans-serif;
  background: #f4f1ea;
  color: #2c3e4f;
  min-height: 100vh;
}
```

**Lines 9–15:** Sets the font (fancy computer font), a warm beige background color (`#f4f1ea`), dark blue-gray text (`#2c3e4f`), and makes sure the background fills the whole screen.

### App Container

```css
.app { max-width: 960px; margin: 0 auto; padding: 2rem 1.5rem; }
```

**Lines 17–21:** The app is at most 960px wide (doesn't get too wide on big screens), centered (`margin: 0 auto`), with some space inside.

### Header

```css
.header { text-align: center; margin-bottom: 1.5rem; }
.header h1 { font-size: 1.75rem; font-weight: 700; ... }
.subtitle { font-size: 0.875rem; color: #7a8b99; margin-top: 0.25rem; }
```

**Lines 23–38:** The title is centered, medium-big, and bold. The subtitle is smaller and gray.

### Add Form

```css
.add-form { display: flex; gap: 0.5rem; margin-bottom: 2rem; }
.add-input { flex: 1; padding: 0.65rem 1rem; border-radius: 8px; ... }
.add-input:focus { border-color: #7fa99b; }
```

**Lines 40–59:** The form uses `flex` to put the input and button side by side with a gap. The input takes up all remaining space (`flex: 1`). When you click on the input (`:focus`), its border turns a nice green.

```css
.add-btn { background: #7fa99b; color: #fff; border-radius: 8px; ... }
.add-btn:hover:not(:disabled) { background: #6b9587; }
.add-btn:disabled { opacity: 0.5; cursor: not-allowed; }
```

**Lines 61–80:** The Add button is green. When you hover over it (and it's not disabled), it gets darker. When it's disabled (nothing typed), it's half-transparent and shows a "no" cursor.

### Board (Three Columns)

```css
.board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
```

**Line 82–86:** The board is a **grid** with three equal columns (`1fr 1fr 1fr`). Each takes one-third of the width.

### Columns

```css
.column { background: #ebe7dd; border-radius: 12px; padding: 1rem; min-height: 260px; }
.column.drag-over { background: #e0dad0; outline: 2px dashed #7fa99b; }
```

**Lines 88–100:** Each column has a slightly darker beige background and rounded corners. When you drag a task over it (`.drag-over`), it gets a dashed green border to show "drop here!"

### Tasks

```css
.task { display: flex; align-items: center; gap: 0.5rem; background: #fff; border-radius: 8px; cursor: grab; box-shadow: 0 1px 2px ...; }
.task:active { cursor: grabbing; transform: scale(0.98); }
```

**Lines 117–132:** Each task is a white card with a very light shadow. The cursor changes to a "grab" hand. When you click and hold (`:active`), the cursor changes to "grabbing" and the card shrinks just a tiny bit to feel like you're lifting it.

### Task Body

```css
.task-title { display: block; font-size: 0.9rem; font-weight: 500; }
.task-meta { display: block; font-size: 0.7rem; color: #9aabac; text-transform: lowercase; }
```

**Lines 139–152:** The title is normal-sized and bold-ish. The meta (column name and time) is tiny and gray.

### Delete Button

```css
.delete-btn { background: none; border: none; font-size: 1.2rem; color: #bcc5c6; cursor: pointer; ... }
.delete-btn:hover { color: #c0392b; background: #fce8e6; }
```

**Lines 154–169:** The ❌ button is light gray. When you hover over it, it turns red with a pink background — scary-looking so you know it deletes!

### Mobile Responsiveness

```css
@media (max-width: 640px) {
  .board { grid-template-columns: 1fr; }
}
```

**Lines 171–175:** On small screens (phones), the columns stack on top of each other instead of being side by side — just one column per row.

---

## 📄 File: `package.json`

```json
{
  "name": "wahala-sorter",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^8.0.12"
  },
  "dependencies": {
    "react": "^19.2.6",
    "react-dom": "^19.2.6"
  }
}
```

**Line 2:** The project's name is **wahala-sorter**.

**Line 3:** `"private": true` — this app is private (not published online for everyone).

**Line 4:** Version `0.0.0` — just starting out!

**Line 5:** `"type": "module"` — we use modern JavaScript `import` statements.

**Scripts:**
- **Line 7:** `"dev": "vite"` — `npm run dev` starts a dev server so you can see your app while building it.
- **Line 8:** `"build": "vite build"` — `npm run build` packages the app into a `dist/` folder ready to share.
- **Line 9:** `"preview": "vite preview"` — lets you preview the built version.

**Dependencies** (tools our app needs):
- **`vite`** — a fast tool that bundles our code and runs the dev server
- **`react`** — the library that helps us build interactive UIs easily
- **`react-dom`** — the part of React that talks to the web browser

---

## 🎮 How It All Works Together (The Big Picture)

1. You open `index.html` in a browser.
2. It loads `src/main.jsx`, which tells React to wake up.
3. React runs `App.jsx` — the boss component.
4. `App.jsx` draws three columns (**Now**, **Soon**, **Later**) and a text box.
5. You type a problem and press Add — it creates a new task in the **Now** column.
6. Each task shows its title and when it was created.
7. You can **drag** any task to a different column to say "this can wait" or "do this soon."
8. You can **delete** a task by clicking the ❌ button.
9. `App.css` makes everything look nice with colors, spacing, and rounded corners.

And that's it! 🎉 You've built a Wahala Sorter — your personal problem organizer!
