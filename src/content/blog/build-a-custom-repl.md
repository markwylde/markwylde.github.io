---
title: "Build a custom REPL using NodeJS"
date: "2022-12-12"
tags: ["Node.js", "REPL", "CLI"]
excerpt: "Learn how to build your own custom Read-Eval-Print Loop (REPL) using Node.js for interactive development and administration."
---

REPLs have become a really useful way to administer or develop modern tech. For example, they allow us to query databases, insert test users or evaluate code on the fly. With NodeJS, you can build a custom REPL, and this article will attempt to walk you through the basics.

First let's create a brand new project using npm.

```shell
mkdir myrepl
cd myrepl
npm init --yes
touch repl.js
chmod +x repl.js
```

Now point your favourite code editor to the folder and open our new `repl.js` file.

We're going to start with a hashbang at the start, the tell your terminal to use Node to execute the file. This will let us run `./repl.js` without having to preface it with `node`.

```javascript
#!/usr/bin/env node
```

## Using the built-in NodeJS REPL

The easiest way to build a REPL is to use NodeJS's built-in REPL api.

We'll start by importing the REPL module and creating a new REPL instance.

```javascript
const repl = require('repl');
const replInstance = repl.start({ prompt: '> ' });
```

This instantly allows the user to start writing JavaScript and evaluate it.

```shell
$ ./repl.js
> console.log('Hello there!')
Hello there!
> 1 + 1
2
```

The built-in REPL is great for evaluating JavaScript, but we can also extend it with our own custom commands. To do this, we can use the `defineCommand` method of the REPL instance.

For example, let's define a command that prints out a friendly message to the user when they type `.hello` followed by their name.

```javascript
replInstance.defineCommand('hello', {
  // When our user types `.help` a list of commands will
  // appear, including our new hello with this description
  help: 'Say hello',

  action (name) {
    // clears any command that has been buffered
    // but not yet executed
    this.clearBufferedCommand();

    // print our message
    console.log(`Hello, ${name}!`);

    // print the configured prompt to a new line in the
    // output and resuming the input to accept new input
    this.displayPrompt();
  }
});
```

Now, when the user types ".hello name", our custom command will be executed.

We can also define custom evaluation functions. For example, let's define a function that evaluates a string as JavaScript code.

```javascript
replInstance.defineCommand('eval', {
  help: 'Evaluate some JS',

  action (expression) {
    this.clearBufferedCommand();
    console.log(eval(expression));
    this.displayPrompt();
  }
});
```

Now, when the user types ".eval 1 + 1", our custom command will evaluate the expression and print out the result.

## Advanced Custom Made NodeJS REPL

Of course, using the built in REPL has its limitations. Instead, we can use a more barebones solution, giving us more control.

First, let's discuss the NodeJS modules we'll need. The most important one is the `readline` module, which lets us read user input from the command line. We'll also use the `process` module to access the terminal input/output and the `fs` module to read and write files.

```javascript
const readline = require('readline');
const process = require('process');
const fs = require('fs');
```

Next, we'll create a function to read user input from the REPL. We'll use the readline module to set up a readline interface, which will allow us to prompt the user for input. We'll then use the `on` method to listen for the `line` event, which will be triggered when the user enters a line of input. Finally, we'll use the `prompt` method to prompt the user for input.

```javascript
function readLine() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('line', (input) => {
    rl.prompt();
    // Do something with the input here
  });

  rl.prompt();
}
```

Now that we have a way of reading user input from the REPL, we can start building the actual REPL. We'll start by creating a function to handle the user's input. This function will take the input as an argument and process it accordingly.

```javascript
function handleInput(input) {
  const args = input.split(' ');
  const command = args[0];

if (command === 'hello') {
  console.log('Hello there!');
  return;
}

if (command === 'read') {
  const filename = args[1];
  const contents = fs.readFileSync(filename, 'utf8');
  console.log(contents);
  return;
}

console.error('Unknown command');
```

Finally, we can call our readLine function and pass the user's input to our handleInput function.

```javascript
readLine(input => handleInput(input));
```

## Error handling
Regardless of which approach you take to writing your REPL, you will note any errors will crash the REPL session.

For example, running the following will crash Node.

```shell
> .eval 1+
node:internal/readline/emitKeypressEvents:74
            throw err;
            ^

SyntaxError: Unexpected end of input
    at REPLServer.action (/tmp/cli/repl.js:25:24)
```

You will probably want to handle errors more gracefully.

We can add an event listener for `uncaughtException` to the process object. This will allow us to catch any errors that occur in our REPL, output them to the terminal, and continue prompting for the next command.

```javascript
process.on('uncaughtException', (err) => {
  console.error(err);
});
```

## Conclusion

REPLs are a great way to interact with your system. They can be used to test out new ideas, debug your code or even as a way to administer your application.

Now you know how easy it is, why not start adding a useful REPL to your project's development environment.

## Resources

- [NodeJS REPL](https://nodejs.org/api/repl.html)
- [NodeJS Readline](https://nodejs.org/api/readline.html)
- [NodeJS Process](https://nodejs.org/api/process.html)