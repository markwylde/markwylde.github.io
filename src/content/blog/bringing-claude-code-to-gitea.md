---
title: "Bringing Claude Code to Gitea: From GitHub Actions to Self-Hosted Git"
date: "2025-01-31"
tags: ["Gitea", "AI", "Claude", "GitHub Actions", "Open Source"]
excerpt: "How I adapted Anthropic's Claude Code Action for Gitea, enabling AI-powered code assistance in self-hosted Git environments."
---

When Anthropic released [Claude Code Action](https://github.com/anthropics/claude-code-action), it was a game-changer for GitHub users. The ability to have Claude analyze code, implement changes, and provide reviews directly within pull request comments was revolutionary. But there was one problem for those of us running self-hosted Git solutions: it only worked with GitHub.

As someone who uses [Gitea](https://gitea.io/) for my personal projects, I wanted that same AI-powered workflow in my self-hosted environment. So I built [claude-code-gitea-action](https://github.com/markwylde/claude-code-gitea-action) - a port that brings Claude's capabilities to Gitea installations.

## The Challenge: API Differences and Local Operations

The main challenge in adapting the GitHub Action for Gitea wasn't just changing API endpoints. While Gitea implements many of GitHub's APIs for compatibility, there are subtle differences in how certain operations work, especially around file management and branch operations.

### Key Technical Differences

1. **File Operations Strategy**: The original GitHub Action relies heavily on GitHub's file API for creating and updating files. Gitea's API has more limited support for complex file operations, so I switched to using local git commands instead.

2. **Branch Management**: While GitHub's API excels at programmatic branch creation and management, Gitea's approach required a more traditional git-based workflow using local commands.

3. **Authentication Flexibility**: I added support for multiple authentication methods, including Claude Max OAuth credentials for users with subscriptions, in addition to direct API keys.

## Implementation Deep Dive

The core architectural change was introducing a `gitea-client.ts` that handles Gitea-specific API calls while maintaining compatibility with the existing Claude Code framework:

```typescript
export class GiteaApiClient {
  private baseUrl: string;
  private token: string;

  constructor(token: string, baseUrl: string = GITEA_API_URL) {
    this.token = token;
    this.baseUrl = baseUrl.replace(/\/+$/, ""); // Remove trailing slashes
  }
  
  // Gitea-specific API implementations...
}
```

### Local Git Operations

Instead of relying on API-based file operations, the Gitea version uses local git commands through a `local-git.ts` utility:

```typescript
/**
 * Check if a branch exists locally using git commands
 */
export async function branchExists(branchName: string): Promise<boolean> {
  try {
    await $`git show-ref --verify --quiet refs/heads/${branchName}`;
    return true;
  } catch {
    return false;
  }
}
```

This approach is more reliable with Gitea's API limitations and actually provides better performance for file-heavy operations.

### Workflow Configuration

The Gitea version includes specific workflow examples that account for Gitea's event system:

```yaml
name: Claude Assistant for Gitea

on:
  issue_comment:
    types: [created]
  issues:
    types: [opened, assigned]

jobs:
  claude-assistant:
    if: |
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'issues' && contains(github.event.issue.body, '@claude'))
    runs-on: ubuntu-latest
    steps:
      - uses: markwylde/claude-code-gitea-action
        with:
          gitea_token: ${{ secrets.GITEA_TOKEN }}
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

## Enhanced Authentication Options

One improvement I made over the original is supporting multiple authentication methods:

- **Direct Anthropic API** (original method)
- **Claude Max OAuth** (for subscription users)
- **Amazon Bedrock** (for enterprise users)
- **Google Vertex AI** (for Google Cloud users)

This flexibility allows teams to use their preferred authentication method and billing structure.

## Why This Matters

Self-hosted Git solutions like Gitea are increasingly popular among developers who want:

- **Privacy and Control**: Keep code and AI interactions on your own infrastructure
- **Cost Management**: Avoid per-seat licensing for large teams
- **Customization**: Tailor the Git experience to your organization's needs

By bringing Claude Code to Gitea, developers can now have AI-powered code assistance without sacrificing the benefits of self-hosted Git.

## Real-World Usage

In my own projects, I've found the Gitea version particularly useful for:

- **Code Reviews**: Automated analysis of pull requests with security and best practice suggestions
- **Documentation**: Automatically updating README files when API endpoints change
- **Bug Fixes**: Claude can often identify and fix issues directly from screenshots or descriptions

The local git operations actually make certain workflows faster than the GitHub version, especially when dealing with large file changes or multiple commits.

## The Open Source Advantage

Building on Anthropic's open-source foundation made this adaptation possible. The original codebase was well-structured with clear separation between GitHub-specific code and the core Claude integration logic.

Key files that required modification:
- API client implementation (`gitea-client.ts`)
- Local git operations (`local-git.ts`)
- Workflow examples (`gitea-claude.yml`)
- Authentication handling (OAuth support)

Most of the core Claude Code logic remained unchanged, demonstrating the value of good architectural design in the original implementation.

## Getting Started

To try Claude Code with Gitea:

1. Add the workflow file to your repository's `.gitea/workflows/`
2. Configure your secrets (Gitea token and Claude credentials)
3. Start using `@claude` in your issue and PR comments

The setup is straightforward, and the experience is nearly identical to the GitHub version, with the added benefit of running on your own infrastructure.

## Looking Forward

This project demonstrates how AI-powered development tools can be adapted across different platforms. As the ecosystem evolves, having choice in where and how we use these tools becomes increasingly important.

The Gitea version is actively maintained and includes all the latest features from the upstream GitHub Action. It's a testament to the power of open source collaboration and the importance of making AI tools accessible across different platforms.

Whether you're running Gitea for privacy, cost, or customization reasons, you no longer have to choose between self-hosted Git and AI-powered development assistance. You can have both.

## 🚀 Try It Yourself

Ready to bring Claude Code to your Gitea installation? 

<div style="text-align: center; margin: 2rem 0; padding: 1.5rem; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
  <a href="https://github.com/markwylde/claude-code-gitea-action" style="display: inline-flex; align-items: center; gap: 0.5rem; color: #24292f; font-weight: 600; text-decoration: none; font-size: 1.1rem;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
    View on GitHub
  </a>
  <p style="margin-top: 1rem; color: #6c757d; font-size: 0.9rem;">
    Complete setup instructions, examples, and documentation
  </p>
</div>