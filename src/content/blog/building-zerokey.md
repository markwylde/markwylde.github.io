---
title: "Building Zerokey: A Zero-Knowledge Cross-Domain Secret Sharing Library"
date: "2025-06-26"
tags: ["Cryptography", "Security", "Web Development", "Zero Knowledge", "Privacy"]
excerpt: "How I built a library to share encryption keys between domains without servers ever seeing them, using URL fragments and modern cryptography."
---

## The Problem That Started It All

Picture this: You're building a modern web application with end-to-end encryption. Your users log in on `auth.example.com`, where you derive an encryption key from their password. But your actual application lives on `app.example.com`.

How do you get that encryption key from the auth domain to the app domain without the server ever seeing it?

This isn't a theoretical problem—it's one I faced while building a privacy-focused application. The encryption key, derived from the user's password, needed to remain entirely client-side. The server should never see it, not even encrypted. Not in cookies, not in headers, not anywhere.

## Why Traditional Approaches Don't Work

My first instinct was to reach for the usual tools:

**Cookies?** They're sent to the server with every request. Even with the `httpOnly` flag off, the server still receives them. That violates our zero-knowledge requirement.

**LocalStorage with iframes?** Modern browsers have strict same-origin policies. An iframe from `auth.example.com` can't access the parent window's localStorage on `app.example.com`. The browser treats them as completely separate worlds.

**PostMessage API?** This could work, but it requires both domains to be loaded simultaneously. It's complex to coordinate and doesn't work well with traditional redirect flows.

**URL parameters?** They're logged in server access logs and browser history. Definitely not suitable for secrets.

## The Inspiration: URL Fragments

Then I remembered something fundamental about how browsers work: URL fragments (the part after `#`) are never sent to servers. They're purely client-side.

```
https://example.com/page#this-part-never-reaches-the-server
```

This was the key insight. But fragments are visible in the URL bar, so we couldn't just put the secret there in plaintext. We needed encryption, and not just any encryption—we needed a way to encrypt on one domain and decrypt on another without any shared state.

## Enter ECDH: Elliptic Curve Diffie-Hellman

ECDH allows two parties to establish a shared secret without ever transmitting that secret. Here's how we adapted it for cross-domain use:

1. **App domain** generates an ephemeral ECDH keypair
2. **App domain** redirects to auth domain with the public key
3. **Auth domain** encrypts the secret with that public key
4. **Auth domain** redirects back with the encrypted secret in the fragment
5. **App domain** decrypts using the private key it kept

The beauty is that each transfer uses a fresh keypair. There's no long-term key management, and even if someone intercepts the encrypted data, it's useless without the private key that never left the app domain.

## Implementation Deep Dive

### The Crypto Layer

We used the Web Crypto API with the P-256 curve for ECDH and AES-GCM for the actual encryption:

```javascript
async function generateKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256'
    },
    true,
    ['deriveKey']
  );

  return {
    publicKey: await exportPublicKey(keyPair.publicKey),
    privateKey: keyPair.privateKey
  };
}
```

The P-256 curve gives us good security with reasonable URL lengths when base64url encoded. We use hybrid encryption: ECDH for key agreement and AES-GCM for the actual secret encryption.

### The URL Dance

The redirect flow looks like this:

```
1. App: https://app.example.com
   → Generate keypair, store private key
   → Redirect to...

2. Auth: https://auth.example.com/secret?
         publicKey=<base64url>&
         redirect=<encoded-url>&
         state=<random>
   → User logs in, derives encryption key
   → Encrypt key with public key
   → Redirect to...

3. App: https://app.example.com#
        secret=<encrypted-base64url>&
        state=<same-random>
   → Decrypt with stored private key
   → Clear fragment from URL
   → Store decrypted secret
```

### Critical Security Details

**One-time keys**: Each transfer generates a fresh keypair. The private key is stored temporarily and deleted after use.

**5-minute expiration**: Pending keys expire after 5 minutes to prevent replay attacks if someone abandons the flow.

**State parameter**: We include a random state parameter to prevent CSRF attacks. The app domain generates it and validates it on return.

**Fragment clearing**: We immediately clear the fragment from the URL after reading it. No sensitive data lingers in the browser history.

```javascript
function clearFragment() {
  window.history.replaceState(null, '',
    window.location.pathname + window.location.search);
}
```

## The Testing Challenge

Testing cross-domain flows is notoriously difficult. We needed to simulate two different domains, test the redirect flow, and verify that secrets never leak to servers.

Enter Playwright. We set up two test servers:
- `localhost:3001` acting as the app domain
- `localhost:3002` acting as the auth domain

This let us test the complete flow, including edge cases like:
- Browser back/forward navigation
- Page refreshes mid-flow
- Concurrent flows in multiple tabs
- Network failures
- Corrupted data handling

```javascript
test('happy path - complete secret transfer flow', async ({ page }) => {
  await page.goto('http://localhost:3001');
  await page.click('#requestSecret');

  // Should redirect to auth domain
  await page.waitForURL(/localhost:3002/);

  // Simulate login
  await page.fill('#password', 'my-secret-password');
  await page.click('#login');

  // Should redirect back with secret
  await page.waitForURL(/localhost:3001/);
  await expect(page.locator('#status')).toHaveText('Secret received!');
});
```

## Lessons Learned

### What Worked Well

**URL fragments as transport**: This approach is simple, secure, and works everywhere. No special browser APIs, no compatibility issues.

**Ephemeral keys**: Generating fresh keys for each transfer eliminates key management complexity and improves security.

**Web Crypto API**: Despite its somewhat awkward promise-based API, it provides solid, hardware-accelerated cryptography.

### Unexpected Challenges

**Testing crypto.subtle**: In our test environment, mocking the absence of crypto.subtle proved impossible. The browsers Playwright uses are too modern!

**Fragment timing**: We discovered that checking `window.location.hash` immediately after navigation might miss the fragment. A small delay or event listener solves this.

**Error messages**: Crypto errors are often opaque. We had to add careful error handling to provide meaningful feedback when things go wrong.

### What We'd Do Differently

**TypeScript**: The library would benefit from type definitions, especially for the crypto operations.

**Streaming encryption**: For larger secrets, we could implement streaming encryption to handle data that doesn't fit comfortably in a URL.

**WebAuthn integration**: The library could be extended to work with WebAuthn for passwordless authentication flows.

## When Should You Use Zerokey?

Zerokey is perfect when you need to:
- Share secrets between different subdomains
- Maintain zero-knowledge architecture
- Avoid server-side session management
- Implement client-side encryption across domains

It's not suitable when:
- You need to share very large amounts of data
- The domains are not under your control
- You require persistent server-side sessions
- Older browser support is critical (pre-2017)

## Security Considerations

While zerokey provides strong security guarantees, remember:

1. **HTTPS is mandatory**: Both domains must use HTTPS in production
2. **Domain validation**: Consider adding additional validation for the redirect URLs
3. **Content Security Policy**: Set appropriate CSP headers to prevent XSS
4. **Rate limiting**: Consider rate-limiting the auth endpoint to prevent brute force attacks

## Conclusion

Building zerokey taught me that sometimes the best solutions come from combining simple browser features with modern cryptography. URL fragments have been around since the early days of the web, but combined with ECDH and AES-GCM, they become a powerful tool for privacy-preserving applications.

The library is now open source and available on [npm](https://www.npmjs.com/package/zerokey). If you're building applications that prioritize user privacy and need cross-domain secret sharing, give it a try.

Remember: in an age of increasing surveillance and data breaches, zero-knowledge architectures aren't just nice to have—they're essential for protecting user privacy. Every secret that never reaches your server is a secret that can't be stolen from it.

## 🚀 Try It Yourself

Ready to implement zero-knowledge secret sharing in your applications?

<div style="text-align: center; margin: 2rem 0; padding: 1.5rem; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
  <a href="https://github.com/markwylde/zerokey" style="display: inline-flex; align-items: center; gap: 0.5rem; color: #24292f; font-weight: 600; text-decoration: none; font-size: 1.1rem;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
    View on GitHub
  </a>
  <p style="margin-top: 1rem; color: #6c757d; font-size: 0.9rem;">
    Complete documentation, examples, and implementation details
  </p>
</div>

<div style="text-align: center; margin: 2rem 0;">
  <a href="https://www.npmjs.com/package/zerokey" style="display: inline-flex; align-items: center; gap: 0.5rem; color: #cb3837; font-weight: 600; text-decoration: none; font-size: 1.1rem;">
    <svg width="20" height="20" viewBox="0 0 780 250" fill="currentColor">
      <path d="M240 250h100v-50h100V0H240v250zM340 50h50v100h-50V50zM480 0v200h100V50h50v150h50V50h50v150h50V0H480zM0 200h100V50h50v150h50V0H0v200z"/>
    </svg>
    Install from npm
  </a>
  <p style="margin-top: 1rem; color: #6c757d; font-size: 0.9rem;">
    npm install zerokey
  </p>
</div>