---
title: "DarkAuth: Hardening the Zero-Knowledge Auth Server"
date: "2026-03-02"
tags: ["DarkAuth", "Security", "OIDC", "Zero Knowledge", "Open Source"]
excerpt: "January and February were a massive 'security sprint' for DarkAuth. From a total overhaul of the session model to building a standardized UI, here's how I'm taking it from prototype to production-ready."
---

I've been quiet on the blog for a few weeks because I've been deep in the trenches with [DarkAuth](https://github.com/puzed/darkauth). 

If you're new here, DarkAuth is my attempt at a zero-knowledge OAuth/OIDC server. It uses the OPAQUE protocol so the server never actually sees your password, and it can deliver encryption keys (DRKs) to clients without them ever hitting the backend.

The project is still very much in its early days, but the last two months have been about moving away from "it works on my machine" toward something I'd actually trust to run in production.

## The Shift to Server-Managed Sessions

In the early prototype days, I was obsessed with the idea that *nothing* sensitive should ever touch the server, not even in an encrypted form. I was building DarkAuth as a pure SPA where the client handled everything, storing tokens and secrets in `localStorage` just to keep them away from the server's reach.

But as the project evolved, I realized this created its own set of problems--mostly around security and the lack of a proper session lifecycle. 

I've since simplified my stance: as long as the server can't read or decrypt the keys, it's okay for the server to hold onto the "envelopes." By accepting that the server can store wrapped Data Root Keys (DRKs) that only the client can unwrap, I was able to move back to a much more robust and standard OIDC flow.

## The "Cookie-Only" Security Model

With that shift, I've completely ditched `localStorage` for session management. Storing JWTs in the browser's local storage is common, but if you have an XSS vulnerability, your session is gone. 

Now, DarkAuth enforces a strict **cookie-only first-party session model**. I've moved the token and refresh token handling to server-managed cookies with all the safety flags you'd expect: `HttpOnly`, `Secure`, and `SameSite=Lax`.

I even split the cookies by cohort:
*   `__Host-DarkAuth-User`: For the user-facing OIDC flow.
*   `__Host-DarkAuth-Admin`: For the administrative dashboard.

This isolation means that even if a session is compromised on the user side, the admin side remains untouched. I also added double-submit CSRF protection for all state-changing requests, which was a bit of a pain to coordinate across the monorepo but absolutely worth it for the peace of mind.

## Hardening the ZK Flow

The "magic" of DarkAuth remains the Zero-Knowledge (ZK) delivery of Data Root Keys. Even though the server now stores the wrapped DRK, it still has no way to decrypt it without the `export_key` derived from the user's password (via OPAQUE).

To make this flow rock-solid, I implemented strict hash binding (`drk_hash`) for authorization requests. 

The flow now looks like this:
1. Client initiates auth with an ephemeral key and a hash of the DRK they expect.
2. The server binds the pending authorization to that specific hash.
3. During token exchange, the server validates the binding before releasing the JWE.

This ensures the entire exchange is cryptographically bound to the initiating session, preventing replay or interception attacks.

## Standardizing the UI (Finally)

Until recently, the Admin and User UIs were a bit of a mess of different components and styles. It made building new features twice as slow because I was constantly reinventing the wheel.

I spent a week standardizing the UI library across the entire project. Now, both UIs share a consistent set of components, sortable tables, and better error handling. 

![DarkAuth Admin UI](../../assets/darkauth-admin-2026.png)

*The new Admin UI with standardized tables and RBAC management.*

## Role-Based Access Control (RBAC)

I finally landed the full RBAC implementation. Previously, permissions were a bit "all or nothing." Now, I've got a proper system for:
*   **Permissions:** Granular actions (e.g., `client:create`, `user:delete`).
*   **Groups:** Bundles of permissions.
*   **Organization Scoping:** Ensuring that an admin in one org can't see users in another.

## Running on Node 24

I've also moved the entire project to **Node 24**. Using the native TypeScript runtime has been a game-changer--it’s faster, simpler, and means fewer dependencies to manage in the build pipeline. 

If you're running the Docker image (`ghcr.io/puzed/darkauth:latest`), you're already using this new runtime.

## What's Next?

The goal for the rest of Q1 is to keep improving the documentation and making the "first-run" experience as smooth as possible. I've added a lot of power features recently, but I don't want to lose the simplicity that makes DarkAuth easy to self-host.

If you want to poke around the code or try running it yourself, it's all on GitHub. It's still early, but it's getting closer to where I want it to be.

## 🚀 Try It Yourself

Ready to run your own zero-knowledge auth server?

<div style="text-align: center; margin: 2rem 0; padding: 1.5rem; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
  <a href="https://github.com/puzed/darkauth" style="display: inline-flex; align-items: center; gap: 0.5rem; color: #24292f; font-weight: 600; text-decoration: none; font-size: 1.1rem;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
    View on GitHub
  </a>
  <p style="margin-top: 1rem; color: #6c757d; font-size: 0.9rem;">
    Open source, self-hosted, and production-ready.
  </p>
</div>
