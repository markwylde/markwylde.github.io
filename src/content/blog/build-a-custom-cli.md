---
title: "Building a simple command-line tool with NodeJS"
date: "2022-12-12"
tags: ["Node.js", "CLI", "JavaScript"]
excerpt: "Learn how to create command-line tools using Node.js from scratch, with both bare-bones and library-assisted approaches."
---

In this article, we will walk you through creating a simple command line tool in NodeJS.

## Setting up the project

First let's create a brand new project using npm.

```shell
mkdir mycli
cd mycli
npm init --yes
touch cli.js
chmod +x cli.js
```

Now point your favourite code editor to the folder and open our new `cli.js` file.

We're going to start with a hashbang at the start, the tell your terminal to use Node to execute the file. This will let us run `./cli.js` without having to preface it with `node`.

```javascript
#!/usr/bin/env node
```

We can now run the command:

```shell
./cli.js
```

Let's look at two ways to implement the CLI.

## Method 1: Zero dependency, bare bones
However, nothing will happen just yet.

### Parsing the arguments

Now that we have our project set up, we can start adding the code for our command line tool.

The first step is to parse the arguments that were passed to our script. We can do this by accessing the `process.argv` array.

`process.argv` contains the arguments that were passed to the NodeJS process when it was started. The first two elements of the array are always the path to the NodeJS executable and the path to the script that was executed.

We can access the arguments that were passed to our script by taking a slice of the array from index 2 onwards.

```javascript
const args = process.argv.slice(2);
```

We now have all the arguments that were passed to our script in the `args` array.

### Defining commands

We now need to define the commands that our tool will support. We can do this by creating an object with the command names as keys and the command functions as values.

The command functions should accept the arguments that were passed to the command as an array.

For example, let's define three commands: `hello`, `eval` and `help`.

```javascript
function hello(name) {
  console.log('Hello', name);
}

function eval(code) {
  console.log(eval(code));
}

function help() {
return `
My Simple Greeter

Usage:
  greeter [command] [...arguments]

Commands:
  hello           [name]          Respond with "Hello {name}"
  eval            [code]          Respond with the output of the evaluated code
  help                            Respond with this command
`.trim();
}
```

### Executing commands

Now that we have our commands defined, we can execute them.

We can do this by checking the first item in the `args` array to see if it is a valid command. If it is, we can take the remaining items in the array and pass them to the command function.

```javascript
const commands = {
  hello,
  eval,
  help
};

const commandName = args[0];

if (commandName in commands) {
  const commandArgs = args.slice(1);
  const output = commands[commandName](commandArgs);
  console.log(output);
} else {
  console.log('Invalid command');
}
```

## Method 2: Using Minimist
But as your CLI grows, you will notice that `process.argv` can be a bit cumbersome to work with, and that's where a library like [Minimist](https://www.npmjs.com/package/minimist) comes in.

Minimist is a lightweight library that allows you to parse the `process.argv` array and convert it into a more usable object.

For example, if we called our script with the following arguments:

```shell
./cli.js --name foo --verbose
```

We would get the following output from Minimist:

```javascript
{
  _: [],
  name: 'foo',
  verbose: true
}
```

We can now easily access the arguments that were passed to our script without having to manually parse the `process.argv` array.

## Conclusion

This article has walked you through the steps of creating a simple command line tool in NodeJS, without any dependencies.

You now know how to parse the `process.argv` array, how to define commands, and how to execute them.