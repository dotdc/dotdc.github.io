+++
author = "David Calvert"
title = "Replacing pre-commit with prek"
date = "2026-11-04"
description = "Why I replaced pre-commit with prek, a faster drop-in alternative written in Rust, and how to migrate your hooks and CI."
tags = [
    "cicd", "git", "github"
]
categories = [
    "tech"
]
thumbnail = "/img/thumbs/prek.webp"
featureImage = "prek.webp"
featureImageAlt = "The prek logo, a red crab holding a magnifying glass next to the word prek"
+++

<!--more-->

## Introduction

If you use [pre-commit](https://github.com/pre-commit/pre-commit), [prek](https://github.com/j178/prek) is a faster, drop-in replacement written in Rust. It ships as a single binary with no Python dependency, and your existing configs and hooks work as-is.

In [Git hooks management with pre-commit and lefthook](https://0xdc.me/blog/git-hooks-management-with-pre-commit-and-lefthook/), I compared the tradeoffs between these two tools. pre-commit had the community hooks, and lefthook had the performance. Today, prek offers the best of both worlds for most people, with pre-commit's hook compatibility and parallel execution similar to lefthook's.

In this article, I'll go through what prek changes compared to pre-commit, how it performs, and how I migrated my repositories.

## What prek brings

For the most part, prek matches pre-commit's features. But like most rewrites, it's also a good opportunity to revisit well-known pain points.

Over the years, pre-commit's issue tracker has accumulated a lot of declined feature requests. While many of these decisions are valid, I think some of these features would have significantly increased the value of the project. It appears that prek's maintainer came to a similar conclusion, as several features requested by the pre-commit community are available in prek. The most important ones for me are:

- Running separate hooks in parallel ([#2050](https://github.com/pre-commit/pre-commit/issues/2050)), see prek's [priority](https://prek.j178.dev/reference/configuration/#priority).
- Monorepo workspaces ([#466](https://github.com/pre-commit/pre-commit/issues/466)), see prek's [workspace mode](https://prek.j178.dev/monorepos/).

## Performance

pre-commit is written in Python. It creates a virtual environment for each Python hook with virtualenv and installs the hook's dependencies with pip. prek is written in Rust and uses uv for both steps, so installing hooks is faster out of the box. If you already use [pre-commit-uv](https://github.com/tox-dev/pre-commit-uv), you get the uv speedup at install time too, but prek still installs hooks faster because it sets up their environments in parallel.

The [prek benchmark](https://prek.j178.dev/benchmark/#summary) runs 13 hooks from pre-commit-hooks on 960 files, adding one optimization at a time:

| Configuration | Median time |
| --- | --- |
| pre-commit | 1,942 ms |
| prek, running the same Python hooks | 1,534 ms |
| prek, with the fast path | 105 ms |
| prek, with the fast path and `priority` | 94 ms |
| prek, with the fast path, `priority` and two projects running in parallel | 80 ms |

Most of the gain comes from prek's fast path, which swaps these common hooks for built-in Rust versions. prek can also skip the [`git diff`](https://prek.j178.dev/benchmark/#the-hidden-cost-of-git-diff) that pre-commit runs after every hook to detect changes when it already knows the outcome of its hooks, which adds up in large repositories.

## Parallel execution

For individuals and teams looking for fast checks, this is likely the most interesting feature. When I wrote my previous article, I wanted to see if it was possible to have parallel execution in pre-commit, similar to lefthook. I even started a small project in Go that I was planning to call pre-gommit. The idea was to wrap pre-commit calls using goroutines, but I wasn't satisfied with the results, and I didn't want to invest much time in the project.

prek doesn't have a global switch to enable parallel execution like lefthook's `parallel: true`. By default, prek assigns each hook an implicit priority based on its order, which preserves the sequential behavior of pre-commit. Running the five hooks from my previous article takes just as long as it did with pre-commit:

```terminal
$ time prek run --all-files
command-1................................................................Passed
command-2................................................................Passed
command-3................................................................Passed
command-4................................................................Passed
command-5................................................................Passed

real    0m5.044s
user    0m0.010s
sys     0m0.036s
```

Parallel execution is only possible when using the `priority` option. Hooks with a lower priority run first, and hooks sharing the same priority run in parallel.

Let's give all our hooks the same priority:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: command-1
        name: command-1
        entry: bash -c "sleep 1"
        language: system
        priority: 1

      - id: command-2
        name: command-2
        entry: bash -c "sleep 1"
        language: system
        priority: 1

      - id: command-3
        name: command-3
        entry: bash -c "sleep 1"
        language: system
        priority: 1

      - id: command-4
        name: command-4
        entry: bash -c "sleep 1"
        language: system
        priority: 1

      - id: command-5
        name: command-5
        entry: bash -c "sleep 1"
        language: system
        priority: 1
```

All five hooks now run in parallel:

```terminal
$ time prek run --all-files
command-1................................................................Passed
command-2................................................................Passed
command-3................................................................Passed
command-4................................................................Passed
command-5................................................................Passed

real    0m1.047s
user    0m0.075s
sys     0m0.122s
```

If you set the priority of `command-2` to `0`, it will run first, followed by the other four hooks in parallel:

```terminal
$ time prek run --all-files
command-2................................................................Passed
command-1................................................................Passed
command-3................................................................Passed
command-4................................................................Passed
command-5................................................................Passed

real    0m2.059s
user    0m0.083s
sys     0m0.166s
```

This way, priority groups let you choose both the execution order of your hooks and which ones can run in parallel.

Execution safety is not guaranteed by prek, as described in its [documentation](https://prek.j178.dev/reference/configuration/#priority):

> If two hooks run in the same priority group and both mutate the same files (or depend on shared state), results are undefined. Use separate priorities to avoid overlap.

In other words, it's up to you to decide which hooks can safely run in parallel. This is also why pre-commit's maintainer declined the feature, arguing that there's no way to do it safely in general. prek leaves that decision to the user, which I think is the right tradeoff. A good starting point is to group read-only checks together, and give each hook that modifies files its own priority.

## Monorepos

pre-commit expects a single configuration at the root of the repository, which is hard to maintain in a monorepo where each project has its own tools. With prek's [workspace mode](https://prek.j178.dev/monorepos/), every directory containing a configuration file is a project, and there's nothing else to set up:

```terminal
├── .pre-commit-config.yaml
├── backend/
│   └── .pre-commit-config.yaml
└── frontend/
    └── .pre-commit-config.yaml
```

Running prek from the root discovers all the projects. Each hook runs from its own project's directory, and you can target a single project or hook:

```terminal
# Run all projects
$ prek run --all-files

# Run a single project
$ prek run frontend/ --all-files

# Run a single hook from a project
$ prek run frontend:check-json --all-files
```

Nested configurations add to their parents rather than replacing them, so a shared check defined at the root still applies to `frontend/`, unless the project sets `orphan: true`.

## Keeping your hooks fast

While looking for data on prek versus pre-commit, I noticed that many people were complaining about their pre-commit checks running for minutes. A faster runner will help, but it won't fix slow hooks. I think hooks are a great way to catch a bunch of errors early, but they shouldn't be used for tests or other long-running tasks.

For these, I would recommend using a `make tests` or similar, which can be used both locally and in your CI/CD pipelines. This way, your hooks remain small and developers won't be tempted to use `git commit --no-verify`.

## Migration

I've migrated my repositories both at work and at home, and I haven't noticed any compatibility issues.

First, [install prek](https://prek.j178.dev/installation/) using the method of your choice:

```terminal
uv tool install prek
```

Then replace the Git hook in each repository using pre-commit:

```terminal
$ prek install --force
Overwriting existing hook at `.git/hooks/pre-commit`
Installed Git hook at `.git/hooks/pre-commit`
```

That's all you need for the migration itself, as prek reads the same `.pre-commit-config.yaml`.

### Built-in hooks

The only change I made to my configurations was replacing [pre-commit/pre-commit-hooks](https://github.com/pre-commit/pre-commit-hooks) with prek's built-in hooks, which don't require cloning a remote repository.

Replace the old pre-commit hooks:

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v6.0.0
    hooks:
      - id: trailing-whitespace
      - id: check-added-large-files
```

With prek's built-in hooks:

```yaml
repos:
  - repo: builtin
    hooks:
      - id: trailing-whitespace
      - id: check-added-large-files
```

Be aware that `repo: builtin` and `priority` are [specific to prek](https://prek.j178.dev/compatibility/), so these configurations are no longer portable to pre-commit. This is fine once all team members have switched to prek. If that's not the case, keep the original configuration, as you'll still benefit from [prek's fast path](https://prek.j178.dev/built-in-hooks/#use-the-automatic-fast-path).

### GitHub Actions

In CI, the [prek action](https://github.com/j178/prek-action) replaces the steps to set up Python and install pre-commit. Here's a simple GitHub workflow:

```yaml
name: prek-hooks

# Doc: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
  # Allow this workflow to be manually triggered
  workflow_dispatch:

# No permissions by default
permissions: {}

jobs:
  prek-hooks:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Checkout ${{ github.repository }}
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false

      - name: Run prek hooks
        uses: j178/prek-action@44924fe9ef4a6f88253c4b6b1bf11c689d3ce53d # v3.1.0
```

## Final words

Replacing pre-commit with prek is easy and gives you faster hooks out of the box. If you're willing to invest a bit more time, parallel execution and workspaces can take it further, and teams with monorepos or many hooks will benefit the most. The prek community is growing fast, and projects like OpenClaw, Ruff and Sentry are already [using it](https://github.com/j178/prek#who-is-using-prek).

If you're using pre-commit today, give prek a try. It only takes a few minutes, and you'll probably notice the difference!

## References

- [prek](https://github.com/j178/prek)
- [prek benchmark](https://prek.j178.dev/benchmark/)
- [prek compatibility with pre-commit](https://prek.j178.dev/compatibility/)
- [pre-commit](https://github.com/pre-commit/pre-commit)
- [Git hooks management with pre-commit and lefthook](https://0xdc.me/blog/git-hooks-management-with-pre-commit-and-lefthook/)
