---
title: "DuckDB and OPFS for Browser Storage"
date: "2025-08-02"
tags: ["DuckDB", "OPFS", "WebAssembly", "Functional Programming", "Web Storage", "TypeScript"]
excerpt: "How I built a todo list using DuckDB WebAssembly and Origin Private File System storage to create persistent browser-based database applications."
---

## Persisting Large Databases in the Client

I've been playing around with DuckDB WebAssembly lately, and I wanted to see if I could build something that persists data in the browser without any server. Not just localStorage stuff, but a real database with SQL queries and transactions.

So I built a [todo list demo](https://markwylde.com/duckdb-opfs-todo-list/) using DuckDB and OPFS (Origin Private File System). It's a fully functional app that stores everything locally, survives browser restarts, and uses pure functional programming throughout.

## Why this combo?

DuckDB gives you proper SQL in the browser. Full queries, joins, transactions - the works. It's WebAssembly, so it's fast and runs everywhere.

OPFS is the new browser storage API that actually persists data properly. Unlike localStorage, it can handle large files and gives you direct file system access. Your data survives browser restarts and clearing cache.

Together, they let you build desktop-class applications that run in the browser.

## How I built it

I went with pure functional programming for this. No classes, no mutable state. Everything's a function that takes some input and returns new data:

```typescript
interface TodoState {
  readonly todos: readonly Todo[];
  readonly filter: TodoFilter;
  readonly nextId: number;
}

interface Todo {
  readonly id: number;
  readonly text: string;
  readonly completed: boolean;
  readonly createdAt: Date;
}
```

Each operation creates new state instead of changing existing objects. Makes debugging much easier.

The database schema is simple:

```sql
CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY,
  text VARCHAR NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

I wrapped all the database stuff in functions:

```typescript
async function addTodo(db: Database, text: string): Promise<void> {
  await db.exec(`
    INSERT INTO todos (text, completed, created_at) 
    VALUES (?, FALSE, CURRENT_TIMESTAMP)
  `, [text]);
}

async function toggleTodo(db: Database, id: number): Promise<void> {
  await db.exec(`
    UPDATE todos 
    SET completed = NOT completed 
    WHERE id = ?
  `, [id]);
}
```

The OPFS part is where it gets interesting. When your browser supports it, DuckDB writes directly to the private file system:

```typescript
async function initializeDatabase(): Promise<Database> {
  const bundle = await DuckDBBundle();
  
  if (bundle.logger) {
    bundle.logger.useConsole();
  }

  const worker = new Worker(bundle.mainWorker!);
  const logger = new ConsoleLogger();
  const db = new AsyncDuckDB(logger, worker);
  
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

  // OPFS connection when available
  const conn = await db.connect();
  
  return { db, conn };
}
```

I added a debug console that shows what's actually happening:

- Whether you're using OPFS or just memory
- How big your database file is
- Live SQL queries as they run
- Performance timings

It's helpful to see what's going on behind the scenes.

## What it does

This isn't your typical localStorage todo app. You get real database persistence with ACID transactions. Data survives everything - browser restarts, cache clearing, the lot.

The functional programming makes everything predictable. No mysterious state changes, no hidden mutations. Every function does one thing and returns new data.

The UI updates reactively without any framework:

```typescript
function renderTodos(state: TodoState): void {
  const container = document.getElementById('todo-list');
  if (!container) return;
  
  const filteredTodos = getFilteredTodos(state);
  container.innerHTML = filteredTodos
    .map(todo => renderTodoItem(todo))
    .join('');
}
```

## Performance

It falls back gracefully. If your browser supports OPFS, you get persistence. If not, it runs in memory and you lose data on refresh. No configuration needed.

The WebAssembly overhead is pretty minimal:
- About 2MB initial download
- Queries run at near-native speed
- Memory usage is efficient

## Browser support

Chrome and Edge get the full experience with OPFS. Firefox and Safari fall back to memory-only for now. Mobile browsers are hit-and-miss depending on which one you're using.

## What I learned

WebAssembly is ready for production. DuckDB performs really well for client-side database work.

OPFS is genuinely useful when it works, but browser support is still patchy. You need fallbacks.

Functional programming made the whole thing easier to build and debug. No surprises, no hidden state.

The main challenge is the bundle size. 2MB is a lot for some use cases, though it caches well after the first load.

## When to use this

It's great for:
- Offline-first apps
- Data analysis tools
- Privacy-focused apps where data never leaves the device
- Prototypes that don't need a backend

Probably not ideal for:
- Apps where bundle size matters a lot
- Anything that needs IE support
- Real-time collaboration
- Huge datasets that won't fit in browser memory

## What's next

I think this is where web apps are heading. Local-first software that works offline by default. Your data stays on your device, but you still get the power of SQL and proper databases.

It's pretty exciting stuff.

The [live demo](https://markwylde.com/duckdb-opfs-todo-list/) is worth playing with. Add some todos, refresh the page, watch the debug console. You'll see OPFS doing its thing.

All the source is on [GitHub](https://github.com/markwylde/duckdb-opfs-todo-list) if you want to dig deeper.

## Wrapping up

Building this showed me how powerful browsers are becoming. You can run a real database client-side now, with proper persistence. That opens up a lot of possibilities.

The functional approach made everything cleaner and easier to debug. As these browser apps get more complex, having predictable code becomes really important.

We're heading toward a world where web apps and desktop apps are basically the same thing. OPFS and WebAssembly are big steps in that direction.

## 🚀 Explore the Demo

Ready to see DuckDB and OPFS in action?

<div style="text-align: center; margin: 2rem 0; padding: 1.5rem; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
  <a href="https://markwylde.com/duckdb-opfs-todo-list/" style="display: inline-flex; align-items: center; gap: 0.5rem; color: #0066cc; font-weight: 600; text-decoration: none; font-size: 1.1rem;">
    🦆 Try the Live Demo
  </a>
  <p style="margin-top: 1rem; color: #6c757d; font-size: 0.9rem;">
    Interactive todo list with DuckDB and OPFS persistence
  </p>
</div>

<div style="text-align: center; margin: 2rem 0;">
  <a href="https://github.com/markwylde/duckdb-opfs-todo-list" style="display: inline-flex; align-items: center; gap: 0.5rem; color: #24292f; font-weight: 600; text-decoration: none; font-size: 1.1rem;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
    View Source Code
  </a>
  <p style="margin-top: 1rem; color: #6c757d; font-size: 0.9rem;">
    Complete implementation with TypeScript and documentation
  </p>
</div>