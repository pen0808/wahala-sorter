# Software Engineering Principles in Wahala Sorter

## 1. Separation of Concerns (SoC)

**Plain meaning:** Different parts of the code handle different kinds of work. Don't mix HTML with JavaScript with CSS in the same place.

**Where it appears:**
- `src/App.jsx` — Component logic and UI (JSX)
- `src/App.css` — All styling/presentation
- `src/main.jsx` — App bootstrapping / entry point
- `index.html` — Static HTML shell

Each file has one distinct concern. If you want to change how something _looks_, you edit `App.css`. If you want to change how something _behaves_, you edit `App.jsx`.

---

## 2. Single Responsibility Principle (SRP)

**Plain meaning:** Every function should do exactly one thing and do it well.

**Where it appears:**
- `formatTime(date)` at `App.jsx:10` — Only formats a date for display. Nothing else.
- `addTask()` at `App.jsx:24` — Only creates and adds a task. No rendering, no deletion logic.
- `deleteTask(id)` at `App.jsx:34` — Only removes a task by id.
- `moveTask(id, to)` at `App.jsx:38` — Only changes a task's column.
- `handleDragStart(e, id)` at `App.jsx:44` — Only stores the dragged task id.
- `handleDragOver(e, col)` at `App.jsx:48` — Only sets which column is being hovered.
- `handleDragLeave()` at `App.jsx:53` — Only clears the hovered column.
- `handleDrop(e, col)` at `App.jsx:57` — Only finalizes the drop and moves the task.

Each of these functions has a single reason to change. `addTask` will only change if _how we add tasks_ changes.

---

## 3. Composition

**Plain meaning:** Build big things by putting smaller things together. A car is composed of wheels, an engine, and seats — not carved from a single block of metal.

**Where it appears:**
- The whole UI is composed of parts: `header` + `form` + `board`
- `board` is composed of three `column` elements rendered by `COLUMNS.map(...)` at `App.jsx:91`
- Each `column` is composed of a heading (`h2`) and a `task-list`
- Each `task-list` is composed of individual `task` cards rendered by `colTasks.map(...)` at `App.jsx:103`

The app is built by composing small pieces together, not by one giant monolithic block.

---

## 4. Immutability

**Plain meaning:** Never change data directly. Instead, make a copy with the change applied. Like photocopying a document with your edit rather than erasing the original.

**Where it appears:**
- `App.jsx:27-30` — New task added with `[...prev, newTask]` (spread operator creates a new array instead of pushing into the old one)
- `App.jsx:35` — Task deleted with `prev.filter(...)` which returns a new array without modifying the original
- `App.jsx:39-41` — Task moved with `prev.map(...)` — creates a new array; the changed task uses `{ ...t, column: to }` (new object via spread)
- `App.jsx:31` — Input cleared with `setInput('')` instead of mutating the old string

No `push`, `splice`, or direct mutation of state anywhere.

---

## 5. Declarative Programming

**Plain meaning:** Tell the computer _what_ you want, not _how_ to build it. Instead of saying "create a div, then add a child, then set its text..." you say "I want a div that looks like this."

**Where it appears:**
- `App.jsx:64-131` — The entire JSX block declares what the UI should look like based on current state. The code says "render a header, a form, and a board with columns" — not "first empty the screen, then create a div, then add text..."
- `App.jsx:92`: `const colTasks = tasks.filter((t) => t.column === key)` — Declares _what_ tasks belong in each column rather than manually shuffling DOM nodes.

React figures out _how_ to update the DOM; you just declare what you want.

---

## 6. DRY (Don't Repeat Yourself)

**Plain meaning:** Write a piece of information or logic once and reuse it. If you find yourself copying and pasting, extract it.

**Where it appears:**
- `App.jsx:4-8` — `COLUMNS` array defines all three columns as data. The same structure is iterated over with `.map()` at line 91 instead of writing three nearly identical `<div>` blocks by hand.
- `App.jsx:10-17` — `formatTime` is a single function reused every time a task's timestamp is displayed (line 113). Without it, that formatting would be duplicated inline.

---

## 7. Encapsulation / Information Hiding

**Plain meaning:** Keep internal details private so outside code can't mess with them. You don't need to know how a TV works to change the channel.

**Where it appears:**
- `App.jsx:20-22` — State (`tasks`, `input`, `dragOver`) is local to the component via `useState`. Nothing outside this file can read or mutate it directly.
- `App.jsx:24-62` — All event handlers (`addTask`, `deleteTask`, `moveTask`, `handleDragStart`, etc.) are defined as local functions inside the component. They access state through closure, not through global variables.

---

## 8. Functional Core / Pure Functions

**Plain meaning:** Functions that always return the same output for the same input and don't cause side effects. Like a vending machine — press B3 and you always get chips.

**Where it appears:**
- `App.jsx:10-17` — `formatTime(date)` is a pure function: given the same date, it always returns the same formatted string. It doesn't read or write any external state.
- `App.jsx:27`, `App.jsx:35`, `App.jsx:39-40` — The updater callbacks inside `setTasks(prev => ...)` use pure array/object transformations (spread, filter, map) that produce new values without mutating anything.
