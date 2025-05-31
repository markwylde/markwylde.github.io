---
title: "From Frameworks to Functions"
date: "2023-06-22"
tags: ["Functional Programming", "Frameworks", "Express"]
excerpt: "Challenge the norm of using big frameworks and discover the benefits of simple, functional programming approaches."
---

If you've been coding for a while, there's a good chance you've dabbled with some big, fancy frameworks or libraries. Angular, React, Vue, Express. They're cool, they're popular, and they come with lots of shiny features. But do you ever stop and think - am I spending more time learning how to use these tools than actually creating?

That's exactly where I'm coming from. I'm a fan of simple, functional programming. I love writing my apps without the extra baggage of big frameworks and the copious amounts of knowledge they seem to require introducing into my projects. I know, I know, you might be raising an eyebrow right now, thinking, "But I love Express! It does so many things!" But, stick with me.

Before we start, keep in mind - this isn't about being right or wrong. It's about challenging norms, questioning what we take for granted, and most importantly, sparking a conversation. So, whether you're a die-hard Express fan, a functional programming aficionado, or just someone curious about different ways of working, I encourage you to read this with an open mind.

After all, who said a bit of controversy wasn't good for the soul? Buckle up, folks. It's about to get interesting.

# What's Wrong With Big Frameworks?

Let's get this out of the way first: Big frameworks aren't evil. Many of them have actually shaped the landscape of web development and played a significant role in building the modern web. The problem isn't that these frameworks exist or that they're inherently bad. The issue lies in how we tend to use them and the unintended consequences that arise from their use.

## The Illusion of Simplicity

Certainly, the choices made by the creators of these big frameworks are not arbitrary. They come from years of experience, they've been vetted by a community of developers, and there is often a wealth of resources that explain the rationale behind these decisions. It's akin to moving into a fully furnished house where the previous owner was an interior designer. Sure, the 70s wallpaper might not be your cup of tea, but you can appreciate the thought that went into selecting it.

And that's great. I wholeheartedly encourage developers to learn about these choices, to explore the reasons why these frameworks have been designed the way they have. Often, there is a lot to learn from them, and you might find some elements that you'd like to incorporate into your projects. But when the justifications for these choices become convoluted and heavy, so much so that the common advice is to simply adopt the entire framework and let it handle everything, that's where I start to raise an eyebrow.

When we start hearing phrases like "it's too complicated for you to implement yourself, just use XYZ", it can feel as though these big frameworks are less like useful tools and more like black boxes hiding a mess of complexities. Rather than enlightening us, they are obscuring our view of the inner workings of our applications.

But is the system really too complicated for us to understand? I'd argue not. In my opinion, we should strive to simplify the problem, to truly understand as much as we can about the system we are working with. Instead of accepting "it's too complicated for you" as an excuse, we should strive to demystify these complexities, to shine a light into these black boxes.

## Express: It's Not You, It's Me

Let's dive right into my main culprit for today: Express.js. This popular framework has become a staple for many Node.js developers, but it does come with some baggage. One of the most prominent issues is how it encourages mutation of the request object.

Consider this snippet of Express code:

```javascript
import express from 'express';
const app = express();
app.use((req, res, next) => {
    req.session = 1234;
    next();
});
app.get('/', (req, res) => {
    res.send('You are on session ' + req.session);
});
app.listen(3000);
```

What's happening here? We're attaching a new property (`session`) to the request object within middleware. The modified request object is then passed along to the next middleware, and ultimately to our route handler, which just 'knows' that `req.session` exists. The problem with this? We're mutating an object that we don't truly own or control, which goes against the functional programming principle of immutability.

In the above example, middleware takes care of setting a session for our application. It's like a magical gatekeeper that imparts the `req` object with certain abilities (or properties). However, the magic of middleware can quickly become a muddle if you don't know the underlying structure of your app or the Express framework. Not to mention, if you have two "middlewares" that wants to use the `session` key on request.

Middleware is often used to handle things like authentication, error handling, and a lot more. But the problem is that it happens "up the chain", far away from your endpoint handlers. As a result, you need to 'know' it's there, and you can't really reason about it unless you are aware of the framework and the middleware patterns.

Let's compare it with a more functional approach:

```javascript
import http from 'http'
import getSessionFromRequest from './authentication/getSessionFromRequest';

const server = http.createServer(async (request, response) => {
  if (request.url === '/') {
    const session = await getSessionFromRequest(request);
    response.end('You are on session ' + session);
    return;
  }
});
server.listen(3000);
```

Firstly, notice how we've removed the "magic" from our code. In the Express example, the session information seems to appear out of nowhere within the route handler. However, in the functional approach, we clearly see where the session information comes from: the getSessionFromRequest function. We're no longer mutating the request object or adding properties that the next developer has to somehow 'know' about. Instead, we have a clear, understandable flow of information.

By breaking the problem down into smaller, reusable parts—like our getSessionFromRequest function—we're also adhering to one of the main principles of functional programming: composing small, pure functions to create complex behavior.

Furthermore, this more functional style is more flexible. In the Express example, we're tied to the structure and design decisions of the framework. But in the functional example, we have the freedom to structure our code in a way that suits our application's needs. If we need to change how we handle sessions, we can just modify or replace our getSessionFromRequest function. Our route handler remains unchanged, which simplifies testing and reduces the chance of bugs.

By separating concerns—HTTP handling, session management, and request handling—we end up with a system that is easier to reason about, simpler to test, and more resilient to change. It might require a little more effort upfront, but the long-term benefits of clarity, simplicity, and maintainability are well worth it.

That's the beauty of the functional approach: it might seem a bit more daunting at first, but it gives you the freedom and flexibility to create code that is clean, modular, and easy to understand. Remember, code is read more often than it is written, so make sure it's as clear as possible for the next person who has to read it, even if that person is you in six months' time.

## What about routing?

One of the common counter-arguments I hear is about routing. "But Express provides a great routing system!" Yes, it does. But let's follow Ron Swanson's philosophy here: "Never half-ass two things. Whole-ass one thing." If you need routing functionality, use a library dedicated to routing, like [`routemeup`](https://github.com/markwylde/routemeup) (shameless plug).

A specialized library would do one job and do it well. Plus, you'd have the flexibility to switch it out whenever you want, without having to overhaul your entire project. No more being handcuffed to a behemoth framework that dictates how you should structure and write your application.

## DRY Out Your Tears

"But I don't want to repeat myself!" Ah, DRY (Don't Repeat Yourself) - an acronym that has been both a boon and a bane. While DRY is a good principle in general, it's not a commandment etched in stone. Sometimes, a bit of repetition can lead to more readable, maintainable code. It's okay to repeat yourself if it helps to clarify your code.

Remember, our goal is not to write the most concise code, but to write code that we, and our fellow developers, can understand, maintain, and extend. As developers, our task is to solve problems, and sometimes that requires us to write some 'extra' code.

But if we look back to my `getSessionFromRequest` example. We have abstracted the session retrieval logic into it's own function. We just haven't magically injected it into each of our route handlers.

# Both sides

## Supporting Points:

1. **Simplicity:**

   First and foremost, the functional approach places a premium on simplicity and comprehension. The functional code is explicit, each line serving a defined purpose that developers can readily understand. This clarity can streamline both the development process and debugging, reducing the cognitive load required to work with the code.

2. **Decoupling:**

   Adopting a functional approach fosters the decoupling of code, paving the way for more modular and maintainable applications. Components aren't bound to a specific framework or library, making it easier to swap them in and out as needed. This flexibility ensures the longevity and scalability of your codebase.

3. **Control over Code:**

   By eschewing comprehensive frameworks, the functional approach grants developers full control over their code. This control is particularly beneficial in large or complex applications where the 'magic' of frameworks can obfuscate understanding and introduce unnecessary difficulties.

4. **Performance:**

   Less reliance on hefty frameworks could potentially yield improved performance. With fewer lines of code to parse and fewer abstractions between the code and the machine, the application could function more efficiently and responsively.

5. **Flexibility:**

   Freedom of choice is a cornerstone of the functional approach. As developers aren't bound to any specific library or framework, they can select the optimal tool for each task. If a new library proves superior for a particular function, switching is a breeze, with no need to worry about comprehensive application upheaval.

## Counterpoints:

1. **Learning Curve:**

   There's no denying the learning curve associated with the functional approach. While I would argue that a more functional approach is simpler and easier for all levels of developers to pick up your code, more junior developers may be unsure how to implement a new project in this style from scratch, while keeping things modular and well structured.

   Developers familiar with Express.js or similar frameworks may need to unlearn certain habits and acquire new ones.

2. **Boilerplate Code:**

   Using a more 'raw' approach like `http` might require you to write more boilerplate code. While there's merit in 'repetition is fine', it can be seen as inefficient and potentially error-prone.

3. **Community Support:**

   Larger frameworks often come with robust community support and extensive documentation, which can be invaluable for solving problems and learning best practices.

4. **Security:**

   Frameworks often provide built-in mechanisms to deal with common security threats. When working without a framework, you need to implement these security measures yourself, which can be tricky if you're not an expert in the field.