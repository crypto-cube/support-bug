# support-bug tracker

A single-page bug tracker dashboard that pulls issues labeled `support-bug` from a GitHub repository and displays them with status indicators and age tracking.

> **Disclaimer:** This project was vibe coded. No tests, no framework, no regrets.

## What it does

- Fetches open and closed issues from the GitHub API filtered by the `support-bug` label
- Shows stats at a glance: total, open, stale (>7 days), and closed
- Color-coded status indicators so you can spot what needs attention
- Lets you create new issues directly from the UI via a modal form

## Setup

1. Open `ticket.html`
2. Edit the config at the top of the `<script>` block:

```js
const REPO  = "owner/repo";   // your GitHub repo
const TOKEN = "ghp_...";      // GitHub personal access token (needed to create issues)
```

3. Open `ticket.html` in a browser. That's it.

## Tech stack

One HTML file. Vanilla JS. No build step. No dependencies.
