+++
title = "Resume"
description = "My resume"
date = "2023-08-30"
aliases = ["projects"]
author = "David Calvert"
showDate = false
showReadTime = false
showShare = false
sidebar = false
+++

> {{< details summary="Table of content" open=false >}}
<!-- no toc -->
- [Work Experience](#work-experience)
- [Key Skills](#key-skills)
- [Programming Skills](#programming-skills)
- [Soft Skills](#soft-skills)
- [Certifications](#certifications)
- [Education](#education)
- [Volunteering](#volunteering)
- [Languages](#languages)
- [Interests](#interests)
{{< /details >}}

## WORK EXPERIENCE

> ### [Hivebrite](https://hivebrite.io) -- Staff Site Reliability Engineer <span class="grey">(March 2024 - Today)</span>
>
> ---
>
> Drove cross-team initiatives to improve reliability, scalability and developer productivity across a multi-tenant SaaS platform. Built internal tools to automate infrastructure and incident workflows, defined standards for CI/CD and mentored engineers across the organization.
>
> #### CI/CD & Infrastructure
>
> - Deployed self-hosted GitHub Actions runners on GKE with autoscaling.
> - Designed and operated Terraflow, an internal CI/CD orchestrator for Terraform to reduce deployment toil and prevent infrastructure drift. ([article](https://0xdc.me/blog/creating-terraflow-a-cicd-orchestrator-to-scale-terraform/))
> - Migrated legacy Buildkite pipelines to GitHub Workflows for faster, more reliable builds.
> - Added automated security and quality checks using pre-commit hooks across all repositories.
> - Integrated Temporal for workflow orchestration and Qdrant as the vector database for the content-recommendation service.
> - Leading AI tooling transition within the team, training, Cursor rules creation and AI pull request review tool comparison (Cursor Bugbot vs Claude Code vs Graphite Diamond)
> - Led AI tooling transition within the team and participated in AI PR review comparison (Cursor Bugbot vs Claude Code vs Graphite Diamond).
>
> #### Reliability & Observability
>
> - Redefined cross-team incident management workflows to improve runbook and postmortem quality and enhance production support and on-call experience.
> - Migrated the Istio Operator to Helm-based Istio deployments to eliminate downtime, simplify upgrades and reduce tech debt.
> - Created an agentic Slack Incident Response Bot to automate Datadog monitors and vendor status updates while integrating with Claude Code and MCP servers to retrieve related incidents, recovery steps and documentation.
> - Led observability platform comparison across Datadog, Grafana Cloud, Coralogix, Signoz and self-hosted with OSS.
>
> #### Performance & Optimization
>
> - Drove the Ruby on Rails webserver migration from Puma to Falcon, performing benchmarks to achieve ~36% lower latency, ~67% higher throughput and ~86% fewer 5xx responses with flat memory usage. Trade-off: ~58% more CPU usage.
>
> #### Leadership & Org Impact
>
> - Helped on cross-team initiatives, contributing to architecture reviews and engineering roadmap.
> - Founded the company [Engineering Blog](https://engineering.hivebrite.io) and established publishing standards.
> - Mentored engineers through pairing sessions and internal technical workshops.
> - Terraflow recognized in Hivebrite's *Crédit Impôt Recherche & Innovation 2024*.
>
> **<span style="color:#30c992">Stack</span>** : GCP, GKE, Kubernetes, Istio, Helm, Keda, Terraform, Terragrunt, ArgoCD, Kargo, Wiz, Datadog, PostgreSQL, Temporal, Qdrant, GitHub, CI/CD, Cursor, MCP, Dust, Claude Code, Graphite Diamond<br>
> **<span style="color:#30c992">Languages</span>** : Python, Bash, Golang

> ### [3D Systems](https://www.3dsystems.com) -- Senior Site Reliability Engineer <span class="grey">(March 2023 - March 2024)</span>
>
> ---
>
> As a Senior DevOps Engineer and Observability Specialist within 3D Systems' cloud software division, I improved the company observability stack, optimized system performance and trained teams in advanced monitoring and troubleshooting techniques.
>
> #### Observability & Monitoring
>
> - Investigated and resolved Prometheus high cardinality and OOM issues, improving cluster stability. ([article](https://0xdc.me/blog/how-to-find-unused-prometheus-metrics-using-mimirtool/))
> - Optimized Prometheus performance, reducing average CPU usage by 119% and RAM usage by 139%. ([article](https://0xdc.me/blog/prometheus-performance-and-cardinality-in-practice/))
> - Rebuilt and enhanced the Thanos stack, including StoreGateway reliability fixes and Redis optimizations.
> - Implemented Service Level Objectives (SLOs) using Pyrra, following a comparative study against Sloth. ([article](http://0xdc.me/blog/service-level-objectives-made-easy-with-sloth-and-pyrra/))
> - Implemented continuous profiling with Polar Signals to gain deeper insight into system performance.
> - Delivered a major Grafana update and refactor using Infrastructure-as-Code for dashboards, plugins and data sources.
>
> #### Infrastructure & Automation
>
> - Implemented Harbor for secure and efficient container image management.
> - Developed GitHub repository templates with automatic child synchronization, improving development consistency. ([article](http://0xdc.me/blog/github-templates-and-repository-sync/))
> - Provided ongoing production operations support and incident response.
>
> #### Technical Leadership & Advocacy
>
> - Authored documentation, comparative studies and internal training sessions.
> - Led community initiatives around observability and monitoring practices:
>   - Speaker at PromCON EU 2023: [Finding useless and resource-hungry Prometheus metrics](https://www.youtube.com/watch?v=NRXAB_Ug8zo)
>   - Speaker at Geekle DevOps Global Summit 2023 : [Modern Grafana dashboard design](https://www.youtube.com/live/SBhNR5ZoKb4?si=kcyF66vffY-kVO9e&t=20279)
>   - Joined the [Grafana Champion](https://grafana.com/community/champions/) program, engaging further with the Grafana community.
>
> **<span style="color:#30c992">Stack</span>** : GCP, GKE, Kubernetes, Terraform, Helm, Keda, Grafana, Prometheus, Thanos, Polar Signals, ELK, Redis, Harbor, GitHub, Copilot, CI/CD<br>
> **<span style="color:#30c992">Languages</span>** : Bash, Golang

> ### [Powder](https://powder.gg) -- DevOps Engineer / Technical Lead <span class="grey">(December 2021 - March 2023)</span>
>
> ---
>
> As a Technical Lead working in an AI-powered startup building a gaming clips platform on AWS, I was responsible for the platform's architecture and end-to-end implementation. My work covered cloud infrastructure management, automation, observability, CI/CD, Kubernetes operations and platform security.
>
> #### Key Projects
>
> - Designed and deployed a complete observability stack using Grafana, Prometheus, Loki, OpenTelemetry and Tempo. Added black-box monitoring, status pages and alerting to ensure service availability and reliability. ([article](https://grafana.com/blog/2023/01/06/how-to-monitor-kubernetes-with-grafana-and-prometheus-inside-powders-observability-stack/))
> - Migrated all workloads to a GitOps model with ArgoCD, improving deployment consistency and rollback safety.
>
> #### Infrastructure & Automation
>
> - Managed a multi-account AWS environment using Infrastructure-as-Code (Terraform with custom modules).
> - Standardized CI/CD with GitHub Actions and reusable workflows across all repositories.
> - Developed internal tools, including a custom CLI to simplify AWS and Kubernetes related operations.
> - Authored extensive technical documentation and led internal training sessions.
>
> #### Security & Reliability
>
> - Built a bastion architecture to secure access to production systems. ([article](https://0xdc.me/blog/is-your-kubernetes-api-server-exposed/))
> - Implemented secure secret management using AWS Secrets Manager.
> - Applied security best practices across the platform with Trivy, tfsec and Kyverno.
> - Provided ongoing production operations support and incident response.
>
> **<span style="color:#30c992">Stack</span>** : AWS, EKS, Kubernetes, Linux, Ubuntu, Ansible, Terraform, ArgoCD, Helm, Keda, Grafana, Prometheus, Grafana Loki, Grafana Tempo, GitHub, PostgreSQL<br>
> **<span style="color:#30c992">Languages</span>** : Bash, Golang

> ### [Acoss](https://www.urssaf.org) -- DevOps Engineer <span class="grey">(May 2020 - December 2021)</span>
>
> ---
>
> Worked on an on-premises Java application platform built upon OpenStack and Kubernetes. Using Prometheus, Grafana, and the EFK stack, I was responsible for the platform's observability, reliability and performance.
>
> **<span style="color:#30c992">Stack</span>** : OpenStack, Kubernetes, Cilium, Terraform, Flatcar Linux, ArgoCD, Prometheus, Grafana, Elastic Stack (ELK), Fluent Bit, Gitlab, CI/CD<br>
> **<span style="color:#30c992">Languages</span>** : Bash, Python

> ### [Airbus](https://www.airbus.com) -- DevOps Engineer <span class="grey">(June 2018 - April 2020)</span>
>
> ---
>
> Contributed to the [Airbus OneAtlas](https://www.youtube.com/watch?v=cLWRsYA9RJU) program, a military-grade satellite image processing solution built on Kubernetes, within a SAFe/Scrum framework. In a highly secure environment, I was responsible for the solution's architecture, provisioning, performance and quality assurance on Google Cloud Platform.
>
> **<span style="color:#30c992">Stack</span>** : GCP, GKE, Kubernetes, Terraform, MongoDB, Gitlab, CI/CD, Prometheus, Grafana, Thanos, JMeter<br>
> **<span style="color:#30c992">Languages</span>** : Golang, Python, Bash

> ### [Orange](https://orange.fr) -- System Engineer & Technical Lead <span class="grey">(January 2015 - June 2018)</span>
>
> ---
>
> As a Technical Lead, I managed the on-premises infrastructure of Orange's Digital Factory, leading multiple technical platforms and projects with a strong focus on infrastructure services, automation and security. I played a key role in three major projects: building a new Linux container-based cloud platform, developing a hardened hosting platform for the internal PKI and secret management service and implementing the Cassandra NoSQL database.
>
> **<span style="color:#30c992">Stack</span>** : Data Centers, Ubuntu, CentOS, ITIL, Gitlab, Ansible, Cassandra, Vault, LAMP, MariaDB (Galera), Docker, Docker Swarm, Rancher, Xymon, OpenSCAP, Bareos<br>
> **<span style="color:#30c992">Languages</span>** : Python, Bash, Golang

> ### [Air France](https://wwws.airfrance.fr) -- System Engineer <span class="grey">(August 2013 - January 2015)</span>
>
> ---
>
> In a business-critical environment, collaborated closely with all IT departments to maintain data center reliability, operating Unix and Linux systems without impacting strict uptime and performance SLAs.
>
> **<span style="color:#30c992">Stack</span>** : Data Centers, Red Hat Enterprise Linux (RHEL), Solaris, Solaris Zones, ZFS, VMware, ITIL, SAN, CFEngine, Veritas Cluster Server (VCS), Veritas Volume Manager (VxVM), IBM Tivoli Storage Manager (TSM), HP IBM Tivoli Workload Scheduler (TWS), OpenView Operations (OVO)<br>
> **<span style="color:#30c992">Languages</span>** : Bash

> ### [i2N](https://i2n.mc) -- System Administrator <span class="grey">(February 2011 - June 2013)</span>
>
> ---
>
> Built and operated a customer-facing web and mail hosting platform using open-source technologies, handling system administration and custom front-end development for client websites.
>
> **<span style="color:#30c992">Stack</span>** : OVH, Linux, Debian, LAMP, Postfix, Plesk, SVN<br>
> **<span style="color:#30c992">Languages</span>** : HTML5, CSS3, JS, jQuery, PHP, Bash

> ### [Computacenter](https://www.computacenter.com) -- System Administrator <span class="grey">(October 2010 - December 2010)</span>
>
> ---
>
> Updated the [FAED](https://www.cnil.fr/fr/faed-fichier-automatise-des-empreintes-digitales) system across PACA for the National Forensic Police Service (SNPS).

## KEY SKILLS

> - Unix & Linux Systems
> - Scripting & CI/CD Automation
> - Kubernetes & CNCF Ecosystem
> - Infrastructure as Code
> - Automation & Scripting
> - Monitoring / Observability
> - Cloud platforms (AWS / GCP)
> - DevOps & Platform Engineering
> - AI Tooling (Cursor, Dust, MCP)

## PROGRAMMING SKILLS

> - Bash / Shell scripting
> - Go (Golang)
> - Python

## SOFT SKILLS

> - Teamwork
> - Analytical Thinking
> - Problem Solving
> - Effective Communication
> - Versatility

## CERTIFICATIONS

> - Certified Kubernetes Security Specialist (CKS)
> - Certified Kubernetes Administrator (CKA)
> - Linux Professional Institute (LPIC-1)
> - Professional Scrum Master (PSM I)
> - ITIL V3-2011 Foundation (ITILF)

## EDUCATION

> CNAM -- Bachelor's Degree in Computer Science (BAC +3)

## VOLUNTEERING

> - [Grafana Champion](https://grafana.com/community/champions/)
> - [Open Source Contributor](https://github.com/dotdc)
> - [Sophia Hack Lab - Board Member](https://shl.contact)

## LANGUAGES

> - French - Native speaker
> - English - Native speaker

## INTERESTS

> - Rock climbing
> - Old adventure games
> - Books
> - FOSS
