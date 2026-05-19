# Detector: Spot the Lie

Read the five statements below about **Wahala Sorter**. Four are true, one is false. Can you spot the lie?

---

1. Wahala Sorter is a kanban-style task board with three columns (Now, Soon, Later) that uses native HTML5 drag-and-drop and `crypto.randomUUID()` for unique task IDs.

2. The board is laid out with CSS Grid (`grid-template-columns: repeat(3, 1fr)`) and collapses to a single column on screens narrower than 640px via a media query.

3. Tasks persist to `localStorage` so they survive page refreshes — the `useState` hook reads from `localStorage` on initial load and writes back on every change.

4. The app is built with React 19 and Vite, bootstrapped from `src/main.jsx` which mounts the `<App />` component into a `<div id="app">` element.

5. The delete button renders the `&times;` HTML entity and, on hover, changes its color to red (`#c0392b`) with a pink background (`#fce8e6`).

---

**Answer:** Statement 3 is the lie. Wahala Sorter stores all tasks in React `useState` only — there is no `localStorage`, `sessionStorage`, or any other persistence mechanism. Refreshing the page loses all tasks.
