---
title: "An introduction to the JavaScript event loop"
date: "2022-12-11"
tags: ["JavaScript", "Node.js", "Event Loop"]
excerpt: "Deep dive into how the JavaScript event loop works in Node.js and why it's essential for building scalable applications."
---

Node.js is an event-driven JavaScript runtime that allows you to build scalable and efficient server-side applications. One of the key features that makes this possible is the event loop.

In this article, we'll take a closer look at the event loop and how it works in Node.js. We'll also explore some of the key concepts and terminology that are important to understand when working with the event loop.

But first, let's define what the event loop is and why it's so important.

The event loop is a central mechanism in JavaScript that allows the runtime to execute code in a non-blocking manner. It does this by continuously checking for new events or tasks that need to be processed, and then executing them asynchronously. This allows Node.js to handle multiple requests concurrently and efficiently, without having to wait for one request to finish before moving on to the next.

The event loop operates in a single thread, but it uses multiple internal components to manage the flow of events. These components include the task queue, the microtask queue, and the event loop phases.

The task queue is where events or tasks that need to be processed by the event loop are placed. This could include things like I/O operations, timers, or other async events.

The microtask queue is a separate queue that holds microtasks, which are smaller tasks that need to be executed after the current task has been completed. This could include things like promise callbacks or process.nextTick callbacks.

The event loop phases refer to the different stages that the event loop goes through in order to process events and tasks. These phases include the following:

**Timers phase**: This phase executes callbacks scheduled by `setTimeout()` and `setInterval()` whose time thresholds have been reached.

**Pending callbacks phase**: This phase executes I/O callbacks deferred to the next loop iteration (previously called "I/O callbacks phase").

**Idle, prepare phase**: This phase is used internally by Node.js for housekeeping tasks.

**Poll phase**: This is the most important phase where the event loop fetches new I/O events and executes I/O-related callbacks. If no timers are scheduled, the event loop will wait here for new events.

**Check phase**: This phase executes callbacks scheduled by `setImmediate()` immediately after the poll phase completes.

**Close callbacks phase**: This phase executes close event callbacks (e.g., `socket.on('close', ...)`).

Importantly, **microtasks** (Promise callbacks, `process.nextTick`) are executed between each phase, not in a specific phase.

After the event loop has gone through all of these phases, it will start again at the timers phase and repeat the process. This allows the event loop to continuously process events and tasks as they come in.

## Examples of Async Code
One common use case for the event loop is to schedule timers or intervals. This is done using the setTimeout and setInterval functions, which allow you to specify a callback function that will be executed after a certain amount of time has passed.

For example, the following code sets a timer that logs a message to the console after 2 seconds:

```javascript
setTimeout(() => {
  console.log('Hello, world!');
}, 2000);
```

Another common use case is to process I/O operations asynchronously. This is done using the fs module, which provides functions for reading and writing files.

For example, the following code demonstrates how different async operations are handled:

```javascript
const fs = require('fs');

console.log('Start');

// Timer (executed in Timers phase)
setTimeout(() => {
  console.log('Timer callback');
}, 0);

// I/O operation (executed in Poll phase)
fs.readFile(__filename, () => {
  console.log('File read callback');
  
  // setImmediate inside I/O callback
  setImmediate(() => {
    console.log('setImmediate inside I/O');
  });
  
  // setTimeout inside I/O callback
  setTimeout(() => {
    console.log('setTimeout inside I/O');
  }, 0);
});

// setImmediate (executed in Check phase)
setImmediate(() => {
  console.log('setImmediate callback');
});

console.log('End');

// Typical output:
// Start
// End
// Timer callback
// setImmediate callback
// File read callback
// setImmediate inside I/O
// setTimeout inside I/O
```

Node.js also provides `process.nextTick()` and `setImmediate()` for different scheduling behaviors:

```javascript
// process.nextTick has the highest priority
process.nextTick(() => {
  console.log('1: process.nextTick');
});

// setImmediate is executed in the Check phase
setImmediate(() => {
  console.log('2: setImmediate');
});

// setTimeout is executed in the Timers phase
setTimeout(() => {
  console.log('3: setTimeout');
}, 0);

// Promise callbacks are microtasks
Promise.resolve().then(() => {
  console.log('4: Promise');
});

console.log('5: synchronous');

// Output order: 5, 1, 4, 3, 2
```

## Understanding Execution Order

The key to understanding the event loop is knowing the execution priority:

1. **Synchronous code** (call stack)
2. **Microtasks** (`process.nextTick`, Promise callbacks)
3. **Timer callbacks** (`setTimeout`, `setInterval`)
4. **I/O callbacks**
5. **setImmediate callbacks**

## Common Pitfalls and Best Practices

Understanding the event loop helps avoid common mistakes:

**Avoid blocking the event loop:**
```javascript
// Bad: Blocking operation
const result = fs.readFileSync('large-file.txt');

// Good: Non-blocking operation
fs.readFile('large-file.txt', (err, data) => {
  // Handle the result
});
```

**Be careful with `process.nextTick()` recursion:**
```javascript
// This will starve the event loop
function recursiveNextTick() {
  process.nextTick(recursiveNextTick);
}
```

## Conclusion

The event loop is the heart of Node.js's asynchronous, non-blocking I/O model. Understanding its phases and execution order is crucial for:

- Writing performant Node.js applications
- Debugging timing-related issues
- Optimizing application responsiveness
- Avoiding common event loop pitfalls

By mastering these concepts, you'll be better equipped to build scalable and efficient server-side applications that leverage Node.js's full potential.