+++
author = "David Calvert"
title = "Building a written culture with RFDs"
date = "2026-10-23"
description = "How I introduced Requests for Discussion (RFDs) to my team to make decisions in the open, and how it spread across the company."
tags = [
    "leadership", "culture", "process", "rfd"
]
categories = [
    "tech"
]
thumbnail = "/img/thumbs/rfd.webp"
featureImage = "rfd.webp"
featureImageAlt = "Screenshot of the RFD search bar from the Oxide Computer Company"
+++

<!--more-->

## Introduction

When I started at [StrangeBee](https://strangebee.com), my role covered both the technical aspects, which I'm used to, and the organizational side of leading the team, which was new to me. I've done many things in my career, but this was the first time I had the chance to shape how a team works, from its methodology and tooling to its processes and approach to quality.

Like many distributed teams, most of our discussions and collaboration happen asynchronously. When working remotely, a written culture isn't a nice-to-have, it's what keeps everyone aligned, and it was missing. Ideas and decisions were spread across conversations, and rarely written down in a way everyone could find, discuss and come back to. We needed a framework to change the current habits.

Inspired by the IETF's [Requests for Comments](https://www.ietf.org/process/rfcs/) (RFC) and [Oxide](https://oxide.computer)'s [Requests for Discussion](https://rfd.shared.oxide.computer/rfd/0001) (RFD), I started working on an RFD process tailored to our needs. In this article, I'll go through why we chose RFDs, how our process works, how we adapted it along the way, and how it spread beyond my team.

## Why write things down?

Writing down ideas helps us formulate them clearly and share them openly with everyone they may affect. Anyone is free to give feedback, raise concerns or suggest alternatives before we commit. This way, decisions are made collectively and in the open, and the reasoning behind them remains available long after the discussion is over.

That written record also becomes shared context for both humans and AI agents. A new teammate can read it to understand how and why things are done. Published RFDs can also feed an `AGENTS.md`, a `CLAUDE.md` or agent skills, so that AI agents work as closely as possible to what the team expects.

## Why RFD and not RFC or ADR?

We chose the name RFD over RFC for two reasons. First, RFC was already used internally at StrangeBee for "Request for Change", so it would have been confusing. Second, I believe that `discussion` is more welcoming than `comments`. Comments suggest a review, where you comment on someone else's proposal. A discussion, instead, invites collaboration and contributions. While this may sound like a minor detail, this alone changed how people perceived the idea when I pitched it.

A few initiatives had also started using [Architecture Decision Records](https://github.com/architecture-decision-record/architecture-decision-record) (ADR) to document architecture choices. But because of their name, ADRs are heavily associated with architecture, and often seen as reserved for architects, technical leads and the like. RFDs, on the other hand, are broader in both subject and audience. Anyone can write one, about anything that deserves a discussion, which makes adoption much easier.

## When to write an RFD

We write an RFD whenever a decision is significant enough to deserve a discussion. Common cases include the following:

- Adding or changing a team process
- Making an architectural or design decision
- Choosing a tool or technology
- Introducing a breaking change

Casual work such as regular features, bug fixes, small tooling decisions or generally anything with a low blast radius doesn't need an RFD, a pull request is enough.

## Anatomy of an RFD

The structure of an RFD is open, but we strongly encourage the following format, which also serves as our template.

- **Title and ID**: formatted as `RFD n: Title`, where `n` is the next available ID, or `n.x` for an amendment.
- **Description**: what the RFD is about.
- **Problem**: what it solves and why it matters.
- **Proposal**: the proposal and which alternatives were considered.
- **Impact**: who will be affected and how.

### Requirement keywords

All our RFDs MUST respect [RFC 2119](https://www.rfc-editor.org/info/rfc2119/) when using requirement keywords. We use them to clearly declare whether what we're discussing is required, recommended or optional. As clarified by [RFC 8174](https://www.rfc-editor.org/info/rfc8174/), these keywords only carry this meaning when capitalized.

> The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in BCP 14 [RFC2119] [RFC8174] when, and only when, they appear in all capitals, as shown here.

It may look a bit formal for a team process, but it removes a lot of ambiguity. For example, "Pull requests MUST be reviewed by at least two team members" leaves no room for interpretation, while "Commit messages SHOULD follow Conventional Commits" is a strong recommendation that can be ignored if there's a good reason.

## Lifecycle of an RFD

Oxide's RFD 1 defines six states, but we decided to keep it simple and only use four:

| State | Meaning |
| --- | --- |
| `DRAFT` | The document is created but not yet ready for discussion. |
| `DISCUSSION` | The document is ready and under active discussion. |
| `PUBLISHED` | The document has been accepted. |
| `ABANDONED` | The document was either not approved, resulted in a dead end, or was replaced by a newer version. |

### Acceptance

An RFD is published once the team has collectively agreed on it. We aim for consensus, but we don't wait for unanimity, as that would delay every decision. Once an RFD is published, we commit to it as one team, including those who argued for something else, in the spirit of [disagree and commit](https://en.wikipedia.org/wiki/Disagree_and_commit).

## Updating an RFD

RFDs aren't immutable. Requiring a new RFD for every change would be too restrictive, and updates would end up lost much further in the index, with something like RFD 172 updating RFD 25. Instead, we clearly define when to update an RFD in place and when to create a new one.

A published RFD can be updated in one of three ways, depending on how much the decision is affected:

| Change | When | Result |
| --- | --- | --- |
| Edit | A minor change that doesn't affect the meaning or the decision (typos, phrasing, added details, broken links...). | The RFD is updated in place. |
| Amend | A change that affects part of the decision, but not all of it (adding, removing or changing something related to the decision). | A new version is created, and RFD `n` becomes RFD `n.x`. |
| Supersede | A change that replaces the entire decision. | A new RFD is written and the previous one is `ABANDONED`. |

For example, amending RFD 42 creates RFD 42.1, amending RFD 42.1 creates RFD 42.2, and so on.

Amending or superseding an RFD MUST go through a new discussion, which follows the same lifecycle as any other RFD. Once the new RFD is published, the previous one is flagged as `ABANDONED` with a link to the latest version. Readers immediately know it has been replaced, and the reasoning and timeline behind every decision remain available to everyone.

## Rolling it out

### The team

After my initial RFD proposal, my teammates quickly understood the format and had their own ideas for RFDs. Within a few days, new RFDs had been created, and the RFD process itself was improved several times along the way. That was the best sign I could have hoped for, as the team embraced the process and made it their own.

### Beyond my team

I then pitched the idea to the Head of Infrastructure & Security at StrangeBee, who had recently started a similar initiative with ADRs. He liked the format and our ideas, and wanted a single process for the whole division. Since there were only a few ADRs, he converted them to RFDs and generalized the format across the entire Infrastructure & Security division, which includes the Infrastructure, Cloud, IT and Security teams.

From there, it reached other engineering teams. Our VP of Engineering liked the idea, and the frontend team started writing their own RFDs. They reached out to share their ideas to improve both the process and how RFDs are managed across teams.

Seeing the idea spread that quickly in a company with already established processes was a really good sign. I believe the open format and the name played a key role in its adoption. Anyone can write an RFD about anything, and everyone is invited to take part, so it's easy to jump in.

## Final words

Implementing RFDs turned out to be a simple way to make decisions in the open, and to give everyone a voice before we commit. Thanks to Oxide for sharing their process publicly, and to my teammates for writing and challenging the first RFDs!

If your team struggles to keep track of its decisions, I hope this article gives you a good starting point to build your own RFD process!

## References

- [Oxide RFD 1: Requests for Discussion](https://rfd.shared.oxide.computer/rfd/0001)
- [Architecture Decision Record](https://github.com/architecture-decision-record/architecture-decision-record)
- [Requests for Comments](https://www.ietf.org/process/rfcs/)
- [RFC 2119: Key words for use in RFCs to Indicate Requirement Levels](https://www.rfc-editor.org/info/rfc2119/)
- [RFC 8174: Ambiguity of Uppercase vs Lowercase in RFC 2119 Key Words](https://www.rfc-editor.org/info/rfc8174/)
