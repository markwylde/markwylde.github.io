---
title: "Building AntNS: DNS for the Decentralized Internet"
date: "2026-01-01"
tags: ["Decentralization", "Autonomi", "DNS", "Cryptography", "Open Source"]
excerpt: "How I built a DNS-like system for Autonomi that solves the fundamental conflict between discoverability and ownership using Ed25519 signatures and shared registers."
---

I've been following the MaidSafe Autonomi project for years now. I love what they stand for and the ambitious project they have to keep the internet a free and safe place.

One of the things they haven't implemented is a DNS like system.

You can currently host a static site, or an interactive app on Autonomi but it's hard routing to it as there is nothing mapping a website like "myfriendlysitename" to the file hash that stores the file.

So, lets look at traditional DNS. You type `example.com` into your browser, it gets resolved into an ip address and then takesyou to a website. But it's controlled by ICANN, managed by registrars, runs on centralized servers, and costs money every year to maintain. It's a single point of failure in an otherwise distributed internet.

## Enter Autonomi: The Decentralized Internet

[Autonomi](https://autonomi.com/) (formerly MaidSafe/Safe Network) is a decentralized data network where both mutable and immutable data can be stored without central servers. Think of it as web3 done right - no blockchain bloat, no proof-of-work mining, just distributed storage and compute.

The network provides:
- **Immutable data** (chunks) - Upload once, addressed by content hash
- **Mutable data** (pointers, registers) - Update as needed while maintaining history
- **No servers** - Data is distributed across nodes with automatic redundancy
- **Pay once** - Upload costs tokens, but downloads are free

It's what the decentralized web should be. And it needs DNS.

## The AntNS Project

I built [AntNS](https://github.com/markwylde/antns) to provide human-readable `.ant` domain names on Autonomi. The goal was simple: make `mysite.ant` work like `mysite.com`, but without registrars, nameservers, or recurring fees.

Just register once, own it cryptographically, and anyone can look it up.

## The Fundamental Problem

Autonomi's register system creates a conflict between **discoverability** and **ownership**:

### Option 1: Unique Keys (Secure)
If everyone generates their own unique register signing key, the register address is `hash(your_unique_key + domain_name)`. This means:
- ✅ Only you can edit it
- ❌ Nobody else can find it (they don't have your key)

### Option 2: Shared Key (Discoverable)
If everyone uses the same well-known key, everyone derives the same address. This means:
- ✅ Anyone can find it
- ❌ Anyone can edit it

You can't have both with a naive approach. This is the core problem any decentralized DNS must solve.

## Two Approaches: AntTP vs AntNS

Before diving into my solution, it's worth looking at how [AntTP](https://github.com/traktion/anttp) - an excellent HTTP server for Autonomi built by the community - tackles this same problem.

### AntTP's Approach: Pointer Counter Maxing

AntTP uses pointers with a clever trick. Autonomi pointers have a counter field that acts as a version number - the highest counter wins in conflict resolution. AntTP's experimental domain resolver works like this:

**Two-level pointer system:**
```
Name "mysite" → Shared Key Pointer (counter = MAX) → User's Own Pointer → Content
```

**Level 1 (Shared Key Pointer):**
- Derived from a shared secret everyone knows
- First person to register sets counter to `u64::MAX` (18,446,744,073,709,551,614)
- Attackers can't override because you literally can't go higher than MAX
- Points to your level 2 pointer

**Level 2 (User's Pointer):**
- Created with your own private key
- You can update this anytime to point to new content
- Owner can transfer by updating level 1 to point to someone else's level 2

It's elegant - the counter CRDT handles "first write wins" at the protocol level. Once you hit counter=MAX, the name is locked to point at your pointer, and you control what that points to.

The trade-off? There's a race condition window until you set counter to MAX, and the pointer chain grows with each transfer (though AntTP caches this so it's fast).

### AntNS Approach: Registers + Signatures

I took a different approach using registers instead of pointers. Registers keep a full history as a linked list rather than just the latest version, which lets me do application-layer validation.

**The hybrid solution:**
1. **Shared register key** → Universal discoverability (everyone can find `mydomain.ant`)
2. **Ed25519 signatures** → Cryptographic ownership (only the key holder creates valid entries)
3. **Spam filtering** → Invalid entries are ignored during lookup

Here's what a register looks like:

```
Register: mydomain.ant (deterministic address via shared key)
├─ Entry 1: { "publicKey": "98daa2aba6513e5c..." } ← Owner document
├─ Entry 2: { "records": [...], "signature": "valid_sig_abc" } ✅ Valid
├─ Entry 3: { "records": [...], "signature": "spam_sig_xyz" } ❌ Invalid (ignored)
└─ Entry 4: { "records": [...], "signature": "valid_sig_def" } ✅ Valid
```

**Lookup behavior:**
1. Download entry 1 to get the owner's public key
2. Process entries 2+ in order
3. Verify each signature against the owner's public key
4. Skip invalid signatures (spam)
5. Return the last valid entry

This is why I like the signature approach - the public key is set as the first history item, then only accepts changes signed by that key. It's application-layer ownership enforcement rather than protocol-layer.

**Why this works:**
- ✅ Anyone can find your domain (shared key = deterministic address)
- ✅ Only you can update it (Ed25519 signature verification)
- ✅ Spam is filtered client-side (invalid signatures ignored)
- ✅ No central authority needed
- ✅ Unlimited updates (registers have no counter limit)
- ✅ Complete audit trail (full history preserved)

The trade-off? Lookup is O(n) where n = number of updates. You have to traverse the full history and verify each signature. For most domains this is fine - even 100 updates is negligible. But it's worth noting.

## Why Decentralized Internet Matters

Traditional internet infrastructure is centralized at multiple points:
- **DNS** - ICANN and registrars control names
- **Hosting** - AWS, Google, Cloudflare host most of the web
- **CDNs** - A handful of companies serve most traffic
- **Certificate authorities** - Trust relies on a few CAs

This creates:
- **Single points of failure** - One company goes down, huge swaths of the internet fail
- **Censorship risk** - Corporations can pressure these choke points
- **Privacy concerns** - These companies see everything
- **Vendor lock-in** - Switching providers is costly and complex

Autonomi solves this by distributing data across thousands of nodes with no single point of control. MaidSafe has been working on this problem since 2006, and the network is finally reaching maturity.

With AntNS, you can register a domain, upload your content, and know that:
- Nobody can take it away from you
- Nobody can censor it
- Nobody controls the infrastructure
- You pay once, own it forever

## How AntNS Works

### Registration

```bash
# Register a domain
antns names register mydomain.ant
```

Behind the scenes:
1. Generate an Ed25519 keypair for the domain
2. Create an owner document with the public key
3. Upload it as a chunk to Autonomi
4. Create a register using the shared DNS key
5. Add the owner chunk as entry 1
6. Create initial DNS records (signed with private key)
7. Upload records as a chunk
8. Add to register as entry 2
9. Backup private key to network vault

### Lookup

```bash
# Look up a domain
antns names lookup mydomain.ant
```

Behind the scenes:
1. Derive register address from domain name using shared key
2. Fetch complete register history
3. Download entry 1 (owner document)
4. Extract public key
5. For each subsequent entry:
   - Download the chunk
   - Parse as signed records document
   - Verify signature with public key
   - Keep if valid, skip if invalid
6. Return records from last valid entry

### DNS Server + HTTP Proxy

The real magic happens when you run the server:

```bash
# Start DNS resolver and HTTP proxy
sudo antns server start
```

This starts:
- **DNS server (port 5354)** - Intercepts `.ant` queries and returns 127.0.0.1
- **HTTP proxy (port 18888)** - Fetches content from Autonomi and serves to browser

Configure your system resolver:

```bash
# /etc/resolver/ant
nameserver 127.0.0.1
port 5354
```

Now when you browse to `http://mysite.ant`, your system:
1. Queries DNS server for `mysite.ant`
2. Gets back 127.0.0.1
3. Sends HTTP request to localhost:18888
4. Proxy looks up domain via AntNS
5. Fetches content from Autonomi
6. Returns it to your browser

It just works. Type a `.ant` domain in your browser and get a website from the decentralized network.

## The Implementation

The core is built in Rust using the Autonomi SDK. I chose Rust because:
- The Autonomi SDK is native Rust
- Cryptographic operations need to be correct
- Performance matters for DNS lookups

Key libraries:
- `ant_protocol` - Autonomi network client
- `ed25519-dalek` - Ed25519 signatures
- `trust-dns-server` - DNS server implementation
- `actix-web` - HTTP proxy server

The trickiest part was signature verification. The records must be serialized to canonical JSON (sorted keys, no whitespace) before signing, otherwise signatures won't verify:

```rust
// Canonical JSON for signature
let canonical = serde_json::to_string(&records)?;
let signature = signing_key.sign(canonical.as_bytes());
```

I also implemented caching with configurable TTL. DNS lookups can be expensive (downloading chunks, verifying signatures), so caching dramatically improves response times:

```bash
# Default 60 minute cache
sudo antns server start

# Custom TTL (10 minutes)
sudo antns server start --ttl=10

# Disable caching for testing
sudo antns server start --ttl=0
```

## Comparing Approaches

Both AntTP's pointer maxing and AntNS's signature validation solve the same problem in different ways:

| Aspect | AntTP (Pointers) | AntNS (Registers) |
|--------|------------------|-------------------|
| Lookup speed | O(1) after cache | O(n) signature checks |
| Update limit | One (at MAX) per level | Unlimited |
| Protocol security | Counter CRDT | Application layer |
| Transfer complexity | Pointer chain grows | No change |
| Spam resistance | Can't add (locked at MAX) | Client-side filtering |
| History | Only current state | Complete audit trail |

Neither is strictly better - it depends on your use case. AntTP's approach is simpler and faster for static names. AntNS provides unlimited updates and a full audit trail.

I went with registers because I wanted:
- Complete update history
- No practical limit on updates
- Application-layer flexibility (can add features like subdomain delegation)
- Explicit ownership model (first entry = public key)

## What's Next

AntNS currently supports basic DNS records (ANT, TEXT, CNAME). Future plans:

**Subdomain support:**
```json
{
  "type": "ant",
  "name": "www",
  "value": "chunk_address_for_www"
}
```

**Multiple record types:**
- A records (IPv4 addresses)
- AAAA records (IPv6)
- MX records (email)
- TXT records (arbitrary data)

**Performance optimizations:**
- Skip known spam entries
- Cache signature verification results
- Parallel chunk downloads

**Privacy features:**
- Optional encrypted records
- Private domain registration

## Why This Matters

The internet was designed to be decentralized. Email works peer-to-peer. The web was meant to be a mesh of interconnected nodes. DNS was distributed across many nameservers.

But over time, we've centralized everything for convenience. Now a handful of companies control the infrastructure, and with it, the internet.

Autonomi brings us back to the original vision. AntNS is one piece of that - human-readable names without central control.

You register `mysite.ant`, and it's yours. Forever. Nobody can take it away, nobody can censor it, nobody can shut it down.

That's what the decentralized internet is supposed to be.

## Try It Yourself

AntNS is open source and ready to use. If you're interested in decentralized systems, cryptography, or just want to experiment with Autonomi, give it a try.

The hardest part isn't the crypto or the networking - it's rethinking how we build systems without central points of control. Once you embrace that mindset, a lot of things become simpler.

No registrars. No recurring fees. No intermediaries.

Just cryptographic ownership and a distributed network.

## 🚀 Get Started

<div style="text-align: center; margin: 2rem 0; padding: 1.5rem; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
  <a href="https://github.com/markwylde/antns" style="display: inline-flex; align-items: center; gap: 0.5rem; color: #24292f; font-weight: 600; text-decoration: none; font-size: 1.1rem;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
    View on GitHub
  </a>
  <p style="margin-top: 1rem; color: #6c757d; font-size: 0.9rem;">
    Documentation, RFC, and installation instructions
  </p>
</div>

<div style="text-align: center; margin: 2rem 0;">
  <p style="color: #6c757d; font-size: 0.9rem;">
    Install AntNS: <code>cargo install --path .</code>
  </p>
</div>
