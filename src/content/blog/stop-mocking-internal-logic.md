---
title: "Stop Mocking Internal Logic"
date: "2023-06-15"
tags: ["Testing", "Mocking", "JavaScript"]
excerpt: "Why you should stop mocking internal application logic and start mocking external dependencies with test servers instead."
---

Traditionally, when testing web applications, we often resort to mocking internal objects and functions like the application's store, `window.fetch`, and other dependencies. While convenient, this approach can lead to brittle tests that do not reflect how the application interacts with the outside world.

In this article, I propose an alternative: stop mocking internals and start mocking externals. Instead of focusing on the inner workings of your application, set up a small test server to simulate your application's real-world interactions.

## What is mocking internal logic?

Imagine we have a login form component that `POST`'s to an endpoint `/sessions` with a JSON body of `{ username, password }`.

To test a login form, we would use Jest alongside the React Testing Library (RTL). Here's an example test case where we're checking for an error message if incorrect username and password are entered.

```javascript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { LoginForm } from '../components/LoginForm';
import * as Auth from '../services/auth';

jest.mock('../services/auth.ts', () => ({
  login: jest.fn()
}));

describe('LoginForm', () => {
  it('shows an error if the wrong username and password is entered', async () => {
    Auth.login.mockImplementation(() => Promise.reject());

    const { getByLabelText, getByRole, getByText } = render(<LoginForm />);
    const usernameInput = getByLabelText('Username');
    const passwordInput = getByLabelText('Password');
    const submitButton = getByRole('button', { name: /submit/i });

    fireEvent.change(usernameInput, { target: { value: 'wrongUsername' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongPassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(getByText('Invalid username or password')).toBeInTheDocument();
    });

    Auth.login.mockReset();
  });
});
```

In this example, we mock the `login` function from `auth.ts` to always reject, simulating a failed login attempt. We then render the `LoginForm`, input incorrect credentials, and click the submit button. We wait for the error message "Invalid username or password" to appear, which validates the application's proper handling of incorrect login credentials. Finally, we reset the mock for subsequent tests, ensuring isolation between them.

## Why should we stop mocking internal?

Mocking internals can result in tests becoming brittle and tightly coupled to implementation. This happens because when we mock internal objects or functions, we inherently assume the workings of a function or module. If we refactor or restructure the system's internal logic, the tests may fail despite the public interface and the functionality remaining the same. Consequently, our tests may hinder development more than they assist it.

Moreover, internally mocked tests often fail to accurately simulate the real-world conditions in which the app operates. This can lead to false positives, with tests passing despite the presence of bugs that would manifest under real conditions.

## Embrace External Mocking

Instead of mocking everything internally, consider mocking the boundaries of your application, i.e., its external dependencies. By doing this, you're not making assumptions about your code's internals; instead, you're simulating the interactions between your code and the outside world.

Setting up a small test server may initially seem like extra work, but it ultimately leads to more robust and meaningful tests. This server should simulate the same conditions your application would face in the real world. For example, it might delay responses, deliver unexpected data, or fail to respond altogether, thereby ensuring your application can handle all these scenarios.

Let's start by creating a small mock server generator function. We'll use `http.createServer` to create a mock server that responds to specific routes. The server listens on a port assigned by the operating system, avoiding potential conflicts with other tests or processes.

```javascript
import http from 'http';

// This can be abstracted into your own helper file
function createMockServer(routes) {
  const server = http.createServer((req, res) => {
    const routeHandler = routes[req.url]?.[req.method];

    if (routeHandler) {
      routeHandler(req, res);
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  server.listen(0);
  return server;
}

// Example of creating a mock server
const server = createMockServer({
  '/sessions': {
    POST: (req, res) => {
      res.writeHead(201);
      res.end();
    },
  },
});

// Make sure to cleanup our server once test test finishes
server.close();
```

In this example, `createMockServer` is a function that sets up a server specifically for testing. It receives a routes object as an argument, which it uses to define the server's behavior based on incoming request URLs and methods. This server stands in for the real API and allows tests to interact with it as if it were the actual backend. Once tests are completed, we close the server to clean up our test environment.

Embracing this approach effectively simulates your application's actual external interactions, resulting in more robust and reliable tests.

### The internal mocking approach

In our original internally mocked test, we used Jest to mock the `login` function to return a predefined response, thus making assumptions about our codebase's internals.

```javascript
jest.mock('../services/auth.ts', () => ({
  login: jest.fn()
}));

// ... Test setup and execution ...
```

In that example, we are mocking the `login` function to always reject, simulating a failed login attempt.

### The external mocking approach

Now, let's implement the same test using our proposed approach. Instead of mocking the `login` function, we will set up a mock server to simulate the actual API interaction.

```javascript
import http from 'http';
import createMockServer from './helpers/createMockServer';

const mockInvalidUsernameOrPassword = () => {
  const server = createMockServer({
    '/sessions': {
      POST: (req, res) => {
        res.writeHead(401);
        res.end(JSON.stringify({ message: 'Invalid username or password' }));
      },
    },
  });
  const apiUrl = `http://localhost:${server.address().port}`;

  return {
    apiUrl,
    server
  }
}

describe('LoginForm', () => {
  it('shows an error if the wrong username and password is entered', async () => {
    const { apiUrl, server } = mockInvalidUsernameOrPassword();

    const { getByLabelText, getByRole, getByText } = render(
      <ApiContext.Provider value={{ apiUrl }}>
        <LoginForm />
      </ApiContext.Provider>
    );
    const usernameInput = getByLabelText('Username');
    const passwordInput = getByLabelText('Password');
    const submitButton = getByRole('button', { name: /submit/i });

    fireEvent.change(usernameInput, { target: { value: 'wrongUsername' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongPassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(getByText('Invalid username or password')).toBeInTheDocument();
    });

    server.close();
  });
});
```

## Benefits of External Mocking

External mocking brings multiple benefits to your testing strategy:

1. **Realistic Environment**: Tests run in an environment that closely mirrors the production environment, resulting in more reliable results. This approach ensures that your application's interactions with the backend are tested under conditions that closely simulate actual user experiences.

2. **Fewer False Positives**: Without making assumptions about your code's internal behavior, you're less likely to have tests that pass despite the presence of bugs. By testing the actual outcomes, you can better identify potential bugs and discrepancies that might be missed with internal mocking.

3. **Better Coverage**: By testing against a server, you cover more of your codebase with each test. This includes not only the API interactions themselves, but also how your app handles various server responses and network conditions.

4. **Flexibility**: A dedicated server gives you full control over the conditions your tests face. You can simulate server errors, slow network conditions, different response formats, and other real-world scenarios to ensure your app handles them well.

5. **Test the Unexpected**: External mocking allows you to test unexpected or erroneous conditions. You can configure your server to return unusual status codes, malformed data, or unexpected delays to test your app's resilience and error handling capabilities.

6. **Isolation**: When using a mock server, your tests are independent of any external factors. They're not affected by real server or third-party API downtime, changing data, or rate limits.

7. **Consistency**: A mock server provides a consistent environment for your tests. You can reliably reproduce the same conditions across multiple test runs, which isn't always the case with real servers where data can change between requests.

8. **Safety**: Using a mock server eliminates the risk of accidentally performing destructive operations on your real server during tests. For instance, your tests might create, modify, or delete data, which, if done on your real server, could have undesired effects.

These benefits make external mocking an essential tool for comprehensive, effective, and safe testing. However, like any approach, external mocking has its own challenges and potential drawbacks.

## Potential Downsides of External Mocking

While external mocking offers significant benefits, it's crucial to recognize potential drawbacks and understand when it may not be the best choice. Here are some challenges:

1. **Increased Complexity**: Setting up an external mock server for your tests can be more complex and time-consuming than using simple internal mocks. Maintaining a separate test server could add substantial overhead to your testing process, depending on your application's specifics.

2. **Slower Tests**: Tests interacting with a server can slow down due to additional latency, leading to longer testing times, especially in large-scale applications where thousands of tests might run.

3. **Risk of Over Mocking**: When setting up a mock server, you might mock more than necessary, almost creating a parallel development effort. Keeping the mock server's behavior aligned with the actual server's behavior could become a daunting task as your application grows.

4. **Increased Surface for Errors**: Building and maintaining a mock server can introduce errors. If a discrepancy arises between the behaviors of the real server and the test server, tests might pass or fail incorrectly.

Despite these downsides, the external mocking approach provides a robust and effective way to simulate real-world conditions for your application during testing. Striking the right balance is key. Use external mocking for high-level integration and end-to-end tests where real-world conditions are crucial, and complement it with unit tests for individual components where internal mocking, or no mocking at all, might be more appropriate. Remember, the goal of testing is to build confidence in your software, and different types of tests contribute to that goal in different ways.