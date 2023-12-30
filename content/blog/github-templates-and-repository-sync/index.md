+++
author = "David Calvert"
title = "GitHub templates and repository sync"
date = "2023-12-30"
description = "In this article, I will explain how to create GitHub templates, and how to sync the generated repositories with their template using a GitHub action."
tags = [
    "git", "github"
]
categories = [
    "tech"
]
thumbnail = "/img/thumbs/github-mat.webp"
featureImage = "banner.webp"
featureImageAlt = 'A picture of my GitHub mat!'
+++

<!--more-->

In this article, I will explain how to create GitHub templates, and how to sync the generated repositories with their template using a GitHub action.

## Introduction

When you create and manage many Git repositories, some of them probably share code or configuration with one another. This could be anything, general repository information like `LICENSE` or `CONTRIBUTING.md`, code, CI/CD workflows, or any other third party configuration. In most cases, these files and repositories are good candidates for templating.

There are many tools and approaches for templating, and all of them don’t necessarily share the same goals. For example, [cookiecutter](https://github.com/cookiecutter/cookiecutter) is a command-line utility that help you bootstrap a new project using predefined templates. GitHub templates on the other hand, is just an ordinary GitHub repository that you declare to be a template in order to be able to generate new repositories with the same files and directory structure.

While this article shows a few possibilities with GitHub and GitHub actions, the principles could be adapted to another platform pretty easily.

## Use-cases

I recently had to create several GitHub repository templates, like a generic repository template for an organization and a template for Terraform modules.

For the first use-case, I wanted to create a default repository template to bootstrap any project that doesn’t have a more specific repository template. For this article, I’ve created [dotdc/template-repository](https://github.com/dotdc/template-repository), a similar template which contains a default licence, contributing guidelines, code of conduct and GitHub templates for Issues and Pull Requets. The purpose of this template was just to have a simple project boilerplate, I didn't necessarily needed to keep the generated projects in sync with the template, fire and forget was what I needed.

Similarly, we could use a [.github repository](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file) containing the default community health files for our organization, like the [dotdc/.github](https://github.com/dotdc/.github) example. But in my case, it just made more sense to manage that using a dedicated template. That’s especially true if you have to manage various licences, languages, and projects types…

Regarding the second use-case, I wanted to create a template for my Terraform modules. In [dotdc/template-terraform-module](https://github.com/dotdc/template-terraform-module), you can see a Terraform module example, this one includes some basic [pre-commit](https://github.com/pre-commit/pre-commit) hooks, the [semantic-release](https://github.com/semantic-release/semantic-release) workflow and the [Git repository sync](https://github.com/AndreasAugustin/actions-template-sync) workflow. For this use-case, I wanted to keep some files from my generated modules in sync with my Terraform template to reduce toil.

## Creating GitHub templates

As explained in the [GitHub documentation](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository), you will need to create a regular repository first, then make it a template in the repository settings. You can also make any existing repository a template. The only difference I’ve noticed between a regular and a template repository, is that the templates will be available in the template dropdown when you create a new repository.

Once you have created your GitHub templates, you can start creating new projects with it!

![Screenshot: Creation of GitHub repository using a template](create-repo.webp "Screenshot: Creation of GitHub repository using a template.")

## Git repository sync

The [actions-template-sync](https://github.com/marketplace/actions/actions-template-sync) GitHub action was created by [Andreas Augustin](https://github.com/AndreasAugustin), and despite its name, it’s a general purpose Git repository sync solution for GitHub.

From the project abstract:

> It is possible to create repositories within Github with [GitHub templates](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-template-repository). This is a nice approach to have some boilerplate within your repository. Over time, the template repository will get some code changes. The problem is that the already created repositories won't know about those changes. This GitHub action will help you to keep track of the template changes. The initial author of this repository faced that issue several times and decided to write a GitHub action to face that issue. Because of the nice community, several feature requests helped to go on with the development of the action. Now several other features are supported.

I will not dive into the details, because everything is already explained in the project's [documentation](https://github.com/marketplace/actions/actions-template-sync#usage), but in most cases, you’ll need:

- A source Git repository
- A target GitHub repository
- A GitHub Personal Access Token (PAT), with workflows privileges if you need to sync GitHub workflows (other auth methods are available)
- A GitHub repository secret containing your PAT (if using PAT)
- A GitHub workflow that uses the [actions-template-sync](https://github.com/marketplace/actions/actions-template-sync) GitHub action (see the example below)

Here’s a workflow example from the [dotdc/template-terraform-module](https://github.com/dotdc/template-terraform-module):

```yaml
name: repo-sync

# Doc: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions

on:
  schedule:
    - cron:  "0 1 * * MON"
  # Allow this workflow to be manually triggered
  workflow_dispatch:

env:
  SOURCE_BRANCH: main
  SOURCE_REPOSITORY: dotdc/template-terraform-module

jobs:
  repo-sync:
    runs-on: ubuntu-latest

    steps:
      # Doc: https://github.com/marketplace/actions/checkout
      - name: Checkout ${{ github.repository }}
        uses: actions/checkout@v4
        if: github.repository != env.SOURCE_REPOSITORY
        with:
          token: ${{ secrets.REPO_SYNC_PAT }}

      # Doc: https://github.com/marketplace/actions/actions-template-sync
      - name: actions-template-sync
        uses: AndreasAugustin/actions-template-sync@v1.1.8
        if: github.repository != env.SOURCE_REPOSITORY
        with:
          github_token: ${{ secrets.REPO_SYNC_PAT }}
          source_repo_path: ${{ env.SOURCE_REPOSITORY }}
          upstream_branch: ${{ env.SOURCE_BRANCH }}
          pr_title: "[actions-template-sync] Upstream template update"
          pr_commit_msg: "chore(template): upstream template update"
```

This example is pretty close to the default configuration, I just changed the pull request title and commit message, and also added the `if: github.repository != env.SOURCE_REPOSITORY` condition, because this workflow is included in my template repository.

There are several other [parameters](https://github.com/AndreasAugustin/actions-template-sync#configuration-parameters) you can set, like specifying the list of reviewers using `pr_reviewers`, or adding custom labels with `pr_labels`. You can also ignore some files from the sync by creating a [.templatesyncignore](https://github.com/AndreasAugustin/actions-template-sync?tab=readme-ov-file#ignore-files) file, which works similarly to a `.gitignore` file.

Once the workflow is triggered, it will compare the target repository with the source, and will open a Pull Request on the target repository if there's any differences. You can see how it looks like in the Pull Requests [#1](https://github.com/dotdc/terraform-module-example/pull/1) and [#2](https://github.com/dotdc/terraform-module-example/pull/2) from [dotdc/terraform-module-example](https://github.com/dotdc/terraform-module-example).

## Conclusion

In this article, we've see how easy it is to sync Git repository using the [actions-template-sync](https://github.com/marketplace/actions/actions-template-sync) GitHub action. While this action was made to solve a missing feature in GitHub repository templates, it can be used as a generic repository sync solution for GitHub repositories.

If you want to learn more, check out the project's [documentation](https://github.com/AndreasAugustin/actions-template-sync?tab=readme-ov-file#actions-template-sync) or Andreas's initial [blog post](https://andreas-augustin.dev/blogs/git/git_action_sync/)!

I hope you found this article useful, happy New Year's Eve!

Feel free to follow me on:

- GitHub : [https://github.com/dotdc](https://github.com/dotdc)
- Mastodon : [https://hachyderm.io/@0xDC](https://hachyderm.io/@0xDC)
- Twitter : [https://twitter.com/0xDC_](https://twitter.com/0xDC_)
- LinkedIn : [https://www.linkedin.com/in/0xDC](https://www.linkedin.com/in/0xDC)

👋
