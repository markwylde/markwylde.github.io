---
title: "How to create a native http server"
date: "2022-12-11"
tags: ["Node.js", "HTTP", "JavaScript"]
excerpt: "Learn how to build a simple HTTP server using Node.js without any external dependencies or frameworks."
---

NodeJS is a powerful and popular JavaScript runtime that allows you to build a wide range of applications, including native HTTP servers. In this article, we will explore how to create a simple HTTP server using NodeJS.

To get started, you will need to have NodeJS installed on your computer. If you don't already have it, you can download and install it from the official NodeJS website.

Once you have NodeJS installed, you can create a new file called `server.js` and open it in your favorite text editor.

The first thing we need to do is to import the `http` module, which provides all of the functionality we need to create an HTTP server. You can do this by adding the following line of code to your server.js file:

```javascript
import http from 'http';
```

Next, we will use the `http.createServer()` method to create a new HTTP server. This method takes a callback function as an argument, which will be executed every time the server receives a new request.

You can create a new server and pass it a callback function like this:

```javascript
const server = http.createServer((request, response) => {
  // your code here
});
```

The callback function takes two arguments, `request` and `response`, which represent the incoming request and the outgoing response, respectively.

Inside the callback function, you can add code to handle the incoming request and generate a response. For example, you might want to return a simple HTML page to the user. You can do this by setting the response status code, content type, and body, like this:

```javascript
const server = http.createServer((request, response) => {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/html');
  response.end('<h1>Hello, World!</h1>');
});
```

Finally, we need to start the server and listen for incoming requests on a specific port. You can do this using the `server.listen()` method, like this:

```javascript
server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
```

The `server.listen()` method takes two arguments: the port number to listen on, and a callback function that will be executed when the server is ready to receive requests. In the example above, we are listening on port 3000 and logging a message to the console when the server is ready.

With these few lines of code, you can create a simple HTTP server using NodeJS. You can then use this server to handle requests and generate responses for your application.