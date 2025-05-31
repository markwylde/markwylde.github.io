---
title: "React Mind Trap"
date: "2023-04-18"
tags: ["React", "Architecture", "Event Emitters"]
excerpt: "Learn how to separate business logic from React components using event emitters and hooks for more maintainable applications."
---

React is undoubtedly the most popular frontend library, providing a powerful library for building user interfaces with reusable components. But React may not be the best fit for every part of your website. You can separate your business logic from React components using event emitters and hooks, which could lead to more maintainable, scalable, and performant applications.

## Why Separate Business Logic from React Components?

1. Scaling: Separating business logic from UI components makes it easier to scale your application as it grows. You can organize your code into separate, modular units that are easier to manage and maintain.

2. Testing: Keeping business logic separate from React components allows you to write more straightforward, focused unit tests for both your UI and logic.

3. Flexibility: Decoupling business logic from React components makes it easier to switch to a different UI library or framework in the future, if necessary.

## Using Event Emitters and Hooks:

Event emitters provide a way to communicate between your business logic and React components without tightly coupling them together. Let's see how we can use event emitters and hooks to achieve this separation:

1. Create an event emitter:

```javascript
import { EventEmitter } from 'events';

const eventEmitter = new EventEmitter();

export default eventEmitter;
```

2. Implement business logic outside of React:

Create a separate `app` folder to store your business logic, and use the event emitter to communicate with your UI components.

```javascript
// app/counter.js
import eventEmitter from './eventEmitter';

let count = 0;

export const increment = () => {
  count++;
  eventEmitter.emit('count', count);
};

export const decrement = () => {
  count--;
  eventEmitter.emit('count', count);
};
```

3. Subscribe to events using hooks:

Create a custom hook that subscribes to the event emitter, allowing your React components to respond to changes in your business logic.

```javascript
// hooks/useEventEmitter.js
import { useEffect, useState } from 'react';
import eventEmitter from '../app/eventEmitter';

const useEventEmitter = (eventName) => {
  const [value, setValue] = useState(null);

  useEffect(() => {
    const listener = (newValue) => setValue(newValue);

    eventEmitter.on(eventName, listener);
    return () => eventEmitter.removeListener(eventName, listener);
  }, [eventName]);

  return value;
};
```

4. Use the custom hook in your React components:

```javascript
// components/Counter.js
import React from 'react';
import { increment, decrement } from '../app/counter';
import useEventEmitter from '../hooks/useEventEmitter';

const Counter = () => {
  const count = useEventEmitter('count');

  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
};
```

React is an excellent library for building user interfaces, but it's crucial to recognize that it may not be the right choice for your entire website. By separating your business/application logic, you can create more maintainable, scalable, and performant applications. This approach also promotes flexibility, making it easier to switch between different UI libraries or frameworks as needed.