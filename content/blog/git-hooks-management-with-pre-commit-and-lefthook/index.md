+++
author = "David Calvert"
title = "Git hooks management with pre-commit and lefthook"
date = "2024-06-12"
description = "In this article, I'll compare pre-commit and lefthook, two git hooks managers for your projects."
tags = [
    "cicd", "git"
]
categories = [
    "tech"
]
thumbnail = "/img/thumbs/git-hooks.webp"
featureImage = "git-hooks.webp"
featureImageAlt = 'A person standing in the middle of a street by Jon Tyson on Unspash.'
+++
<!-- https://unsplash.com/photos/a-person-standing-in-the-middle-of-a-street-PXB7yEM5LVs -->

<!--more-->

## Introduction

In modern software development, maintaining code quality and consistency is important. Unlike other approaches, using git hooks for this matter has the advantage of providing immediate feedback. The [pre-commit](https://github.com/pre-commit/pre-commit) and [lefthook](https://github.com/evilmartians/lefthook) projects are two popular options for managing git hooks. In this article, I'll compare their features, ease of use, community support, and performance to help you decide which tool is best suited for your project.

## TL;DR

|  | pre-commit | lefthook | Best |
| --- | --- | --- | --- |
| GitHub Stars | 12.3k | 4.3k | pre-commit |
| Community Hooks | Yes | No | pre-commit |
| Parallel execution (performance) | No | Yes | lefthook |
| Glob and regexp filters | Yes | Yes | = |
| Run scripts  | Yes | Yes | = |
| Language | Python | Go | N/A |

## Pre-commit

Pre-commit is a versatile git hooks manager written in Python and was created in 2014. Its primary goal is to catch and address issues such as missing semicolons, trailing whitespace, and debug statements before code review, allowing reviewers to focus on the architecture and logic of changes. The installation and configuration are designed to be user-friendly, enabling teams to quickly set up and enforce coding standards. Pre-commit supports running various [git hooks](https://pre-commit.com/#supported-git-hooks), commands, and scripts, and provides flexible options for matching and excluding patterns.

The big advantage of pre-commit is that it allows you to easily create remote hooks, or reuse existing [community hooks](https://pre-commit.com/hooks.html).\
If you want to see a real-world example, check out the [pre-commit configuration](https://github.com/dotdc/grafana-dashboards-kubernetes/blob/master/.pre-commit-config.yaml) on the [dotdc/grafana-dashboards-kubernetes](https://github.com/dotdc/grafana-dashboards-kubernetes) project.

On the downside, pre-commit runs hooks sequentially, which means one hook after another. The lack of option to execute them in parallel can have a significant impact on large repositories. It's important to keep this in mind for performance considerations, especially when using pre-commit in CI pipelines.

Here's an example that illustrates the issue.

Configuration file:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: command-1
        name: command-1
        entry: bash -c "sleep 1"
        language: system

      - id: command-2
        name: command-2
        entry: bash -c "sleep 1"
        language: system

      - id: command-3
        name: command-3
        entry: bash -c "sleep 1"
        language: system

      - id: command-4
        name: command-4
        entry: bash -c "sleep 1"
        language: system

      - id: command-5
        name: command-5
        entry: bash -c "sleep 1"
        language: system
```

Execution:

```console
$ time pre-commit run
command-1................................................................Passed
command-2................................................................Passed
command-3................................................................Passed
command-4................................................................Passed
command-5................................................................Passed

real    0m5.149s
user    0m0.101s
sys     0m0.050s
```

As we can see, hooks are processed sequentially, leading to increased processing times when multiple hooks are involved.

For more information on pre-commit, check out <https://pre-commit.com>.

## Lefthook

Written in Go, lefthook is a powerful git hooks manager that debuted in 2019. Given their shared goals, lefthook and pre-commit share many features. Lefthook also offers straightforward [installation](https://github.com/evilmartians/lefthook/blob/master/docs/install.md), [configuration](https://github.com/evilmartians/lefthook/blob/master/docs/configuration.md) and ease of use.

While lefthook has a beta [remotes](https://github.com/evilmartians/lefthook/blob/master/docs/configuration.md#remotes) feature, which enables the use of remote hooks, this capability is currently limited to flat reuse and lacks advanced options for configuring remote hooks. On this point, lefthook is behind pre-commit, which offers configurable remote hooks and a large catalog of [community hooks](https://pre-commit.com/hooks.html).

On the other hand, lefthook has a significant advantage in performance, especially with its support for concurrent execution.
Like pre-commit, hooks run sequentially by default, but you can enable parallel execution using the [parallel](https://github.com/evilmartians/lefthook/blob/master/docs/configuration.md#parallel) parameter.

Let's adapt the configuration we previously created to lefthook's format and observe the differences.

Configuration file:

```yaml
# .lefthook.yml
pre-commit:
  parallel: true
  commands:
    command-1:
      run: sleep 1
    command-2:
      run: sleep 1
    command-3:
      run: sleep 1
    command-4:
      run: sleep 1
    command-5:
      run: sleep 1
```

Execution:

```console
$ time lefthook run pre-commit
╭───────────────────────────────────────╮
│ 🥊 lefthook v1.6.15  hook: pre-commit │
╰───────────────────────────────────────╯
sync hooks: ✔️  (pre-commit)
┃  command-3 ❯ 

┃  command-2 ❯ 

┃  command-1 ❯ 

┃  command-5 ❯ 

┃  command-4 ❯ 

  ────────────────────────────────────
summary: (done in 1.00 seconds)       
✔️   command-2
✔️   command-3
✔️   command-1
✔️   command-5
✔️   command-4

real    0m1.016s
user    0m0.014s
sys     0m0.017s
```

As we can see, lefthook completed the tasks in 1.016s, whereas pre-commit took 5.149s, which highlights lefthook's faster performance.

To have more information on lefthook, check out <https://evilmartians.com/opensource/lefthook>.

## Using both

I was curious to see if it was possible to use both simultaneously. I wouldn't necessarily recommend it, but it can be done with a small trick! If you're interested, I've explained how to do that in the [dotdc/test-lefthook-and-pre-commit](https://github.com/dotdc/test-lefthook-and-pre-commit) repository.

Example:

```console
$ time git ci -am"feat: test both"
[HOOKS] Running lefthooks hooks
╭───────────────────────────────────────╮
│ 🥊 lefthook v1.6.15  hook: pre-commit │
╰───────────────────────────────────────╯
┃  command-5 ❯ 

┃  command-2 ❯ 

┃  command-1 ❯ 

┃  command-4 ❯ 

┃  command-3 ❯ 

  ────────────────────────────────────
summary: (done in 1.01 seconds)       
✔️   command-5
✔️   command-2
✔️   command-1
✔️   command-4
✔️   command-3
[HOOKS] Running pre-commit hooks
command-1................................................................Passed
command-2................................................................Passed
command-3................................................................Passed
command-4................................................................Passed
command-5................................................................Passed
[main 35c5dfd] feat: test both
 1 file changed, 2 insertions(+), 5 deletions(-)

real    0m6.308s
user    0m0.163s
sys     0m0.051s
```

## Final Words

In this article, we've compared pre-commit and lefthook, two tools designed to streamline git hooks management. Lefthook has better performance due to concurrent execution support, whereas pre-commit offers a smoother start due to its extensive collection of community hooks. Testing both will allow you to find the one that suits your project best, and either choice will be a good one.

Feel free to follow me on:

- GitHub : [https://github.com/dotdc](https://github.com/dotdc)
- Mastodon : [https://hachyderm.io/@0xDC](https://hachyderm.io/@0xDC)
- Twitter : [https://twitter.com/0xDC_](https://twitter.com/0xDC_)
- LinkedIn : [https://www.linkedin.com/in/0xDC](https://www.linkedin.com/in/0xDC)

👋
