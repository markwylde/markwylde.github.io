---
title: "Zero-Knowledge without a Password"
date: "2026-06-08"
tags: ["DarkAuth", "Security", "Zero Knowledge", "Passkeys", "OIDC", "SCIM", "Open Source"]
excerpt: "DarkAuth derives your encryption keys from your password and never lets the server see them. So what happens when there's no password? Here's the long, winding road to federation, SCIM and passkeys without giving up zero-knowledge."
---

If you've read my [last DarkAuth update](/blog/darkauth-q1-2026-update), you'll know the whole pitch rests on one stubborn idea: the server should never see your keys.

[DarkAuth](https://github.com/puzed/darkauth) derives an encryption key from your password, entirely in the browser, using OPAQUE. The server never sees the password and never sees the key. Apps get a key delivered in a URL fragment that the server can't read. It's a lovely property to have, and for password logins it works beautifully.

DarkAuth is an open-source project that's still early, and the next things on my list were the features any serious auth server is expected to have: federated SSO, SCIM provisioning, and passkeys. Standard stuff. Every other identity provider does it.

The trouble is, every one of those features breaks my model in the same way: **there's no password to derive a key from.**

## The thing that made it hard

In the password world, the chain is simple:

```
password → OPAQUE export_key → wrapping key → unwrap your root key
```

Your password *is* the secret. Nothing else needs to exist. You type it, the maths happens client-side, and out pops a key the server has never touched.

Now imagine you log in with Google. You've proven who you are. The server is completely happy that you're you. But you've handed over exactly zero secret material that DarkAuth can turn into an encryption key. SSO proves *identity*. It does nothing for *encryption*.

Passkeys are the same trap with extra cruelty. A passkey proves identity brilliantly. But a plain passkey gives you no key material to unlock anything. (There's a WebAuthn extension called PRF that *can* hand you a stable secret, but it isn't available everywhere, so I couldn't lean on it as the only answer.)

SCIM is worse still. A user gets provisioned from a corporate directory and they've *never even visited DarkAuth*. There's no password, no passkey, no session, nothing. Just a row in a table that says this person is allowed to exist.

So I had three features — federation, SCIM, passkeys — all asking the same impossible-sounding question:

> How do you give someone an encryption key the server can't see, when they never gave you a password to derive it from, and there's no password to pin anything against?

## The dead ends

I tried a few things in my head (and some in code) that I'm glad never shipped.

**Derive a key from the SSO identity.** Tempting, and completely wrong. Anything I can derive from claims the server can see, the server can also derive. The moment the server can reconstruct the key, it's not zero-knowledge any more. Dead on arrival.

**Let the server hold a key "just for SSO users".** Same problem wearing a hat. If the server escrows a plaintext key for the federated users, I've quietly built two products: a zero-knowledge one for password users and a normal one for everyone else. That's not a security model, that's a footnote nobody reads.

**Force every SSO user to also set a DarkAuth password.** This actually works, and it's still in there as an option. But it's a miserable experience. The entire point of SSO is "I already logged in, stop asking me things." Bolting a mandatory second password onto it defeats the whole reason federation is appealing.

Each dead end taught me the same lesson from a different angle: **you cannot manufacture key material out of an identity proof.** The key has to come from somewhere that already has it.

And that last sentence is the whole answer, I just didn't see it yet.

## The thing I'd been conflating

The breakthrough wasn't crypto. It was noticing that I'd been treating two completely different things as one.

When you "log in", you're actually doing two jobs at once:

1. **Proving who you are.** (authentication)
2. **Unlocking your encryption keys.** (key unlock)

With a password, those two happen in the same breath, so I'd never had to separate them. But they're not the same thing at all. SSO does job 1 and nothing of job 2. A plain passkey does job 1 and nothing of job 2. SCIM does *neither*. It just creates the account.

Once I wrote that down, the model fell out almost on its own. I split a session into two independent states:

```
identity_state = anonymous | authenticated | mfa_pending | suspended
key_state      = none | locked | unlocked | setup_required | recovery_required
```

The combination that unlocked everything in my head was `authenticated + locked`. It means: *DarkAuth knows exactly who you are, but this browser hasn't got your keys yet.* That's a completely valid, sensible state. SSO lands you there. A passkey without PRF lands you there. And crucially, an app that doesn't need encryption doesn't care; it only ever checks `identity_state`.

So the real question shrank. It was never "how do I derive a key from SSO". It was: **once you're authenticated but locked, how does this device get the keys, without the server ever touching them?**

## The answer: ask a device that already has them

If the key has to come from somewhere that already has it, and the server isn't allowed to have it... then it comes from **another one of your devices.**

Your phone already unlocked your keys this morning. It's sitting there with your Account Root Key in memory. So when you log in on your laptop with SSO or a passkey, your laptop doesn't try to *derive* anything. It just asks: *hey, can one of my trusted devices pass me the key?*

Your phone picks up the pending request and shows "approve laptop login?" with a short verification code. You tap approve. The key moves from phone to laptop, encrypted end-to-end so the server only ever relays sealed bytes, and your laptop is now unlocked. You never typed a password. The server never saw a thing.

The structure underneath is the same ECDH trick I've leaned on before (it's the same idea behind [zerokey](/blog/building-zerokey), if you want the long version):

```
New device (laptop)
  1. Authenticates by SSO / passkey / password — identity_state = authenticated, key_state = locked
  2. Generates an ephemeral ECDH public key
  3. Creates a key-approval request on the server

Existing device (phone, already unlocked)
  4. Sees the request + a short verification code
  5. User approves
  6. Unwraps the Account Root Key locally
  7. Encrypts it to the laptop's public key (ECDH-ES + A256GCM)
  8. Uploads the sealed envelope

New device (laptop)
  9. Downloads the sealed envelope
  10. Decrypts the key locally with its private key
  11. Optionally remembers itself as a trusted device
```

The server's entire role is to hold an opaque, encrypted blob and a verification code for about ten minutes, then forget it. The approval request is single-use and expires fast. At no point does plaintext key material exist anywhere on the server.

A few details I had to get right, and got wrong at least once first:

- **The approval has to be signed by the approving device.** Early on, "approved by device X" was just a claim. That's spoofable. Now the existing device signs the approval with its own key, and the server verifies that signature against the device's stored public key. You can't forge an approval you didn't make.
- **The bound metadata matters.** The sealed envelope's authenticated data ties together the subject, the request ID and a hash of the verification code, so an approval can't be lifted and replayed against a different request.
- **Short verification code, shown on both ends.** It's the human's chance to notice that the thing asking for approval is actually the thing they're holding.

If you dig through the commits around the end of May you'll find a run of `fix(api): harden trusted device approvals`, `docs: clarify trusted-device unlock flow`, `fix(ui): show trusted-device unlock request action`, each one me discovering another corner of the flow that didn't quite hang together. The architecture was right early; the edges took a few days of sanding.

## And this is what quietly unlocked passkeys

Once "get your keys from another device" exists as a first-class unlock method, **passkeys just work**, even the boring ones without PRF.

The flow becomes genuinely lovely:

1. Tap your passkey. You're authenticated. (`key_state = locked`)
2. DarkAuth says "approve this on your other device."
3. You tap approve on your phone.
4. Keys transferred. You're in.

No password anywhere in that sequence. Same for federated SSO: log in with your company identity provider, approve from a device you already trust, done. You *can* still set a DarkAuth password and use it as an unlock method, just one option among several now, not the foundation everything else stands on. PRF passkeys can unlock in a single tap where they're supported. A recovery key covers the "all my devices are at the bottom of a lake" case.

The unlock methods ended up as a small menu, and authentication ended up as a separate small menu, and any item from one composes with any item from the other:

| You authenticate with… | You unlock your keys with… |
| --- | --- |
| Password (OPAQUE) | …the same password, in one step |
| Federated SSO | …an existing device, a passkey PRF, or a recovery key |
| Passkey (no PRF) | …an existing device, or a recovery key |
| Passkey (with PRF) | …the passkey itself |
| SCIM-provisioned, first login | …set up any of the above on first use |

That table is the entire point. None of the rows force the others. SSO never has to know how keys get unlocked; it just gets you to `authenticated`. The key layer never has to know how you proved your identity; it just needs you `authenticated` and a way to receive the key locally.

## SCIM, the easy one (eventually)

SCIM stopped being scary the moment the split was in place. SCIM was never trying to be an authentication protocol, and I'd been wrong to treat it like one. It provisions and deprovisions accounts. That's it.

A SCIM-provisioned user shows up as `authenticated + setup_required` the first time they actually log in (with whatever auth method their org allows). At that point they generate an Account Root Key client-side, wrap it into their first envelope, and they're off. Deprovisioning kills their sessions and refresh tokens immediately, but deliberately *doesn't* nuke their encrypted envelopes on the spot, because an over-eager directory sync shouldn't be able to vaporise someone's encrypted data. Retention policy decides that, not a webhook.

## What I'd tell past me

> You can't make a key out of an identity. But if a device you already trust has the key, it can hand it to a new device without the server ever seeing it, and that one move makes SSO, passkeys and provisioned accounts all fit the same zero-knowledge model.

Separating *who you are* from *can this browser decrypt your stuff* is one of those distinctions that feels obvious the second it's written down and was completely invisible while I was tangled in it. Everything else — the ECDH dance, the signed approvals, the state machine — is just plumbing once you've seen the split.

It's all on GitHub if you want to poke at it. It's still early, and I'm sure I'll find another corner of the approval flow that needs sanding next week. But for the first time, "log in with SSO, approve from your phone, no password anywhere, server still blind" actually works end to end. And I'm pretty happy about that.

<div style="text-align: center; margin: 2rem 0; padding: 1.5rem; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
  <a href="https://github.com/puzed/darkauth" style="display: inline-flex; align-items: center; gap: 0.5rem; color: #24292f; font-weight: 600; text-decoration: none; font-size: 1.1rem;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
    View on GitHub
  </a>
  <p style="margin-top: 1rem; color: #6c757d; font-size: 0.9rem;">
    Open source, self-hosted, and getting closer every week.
  </p>
</div>
