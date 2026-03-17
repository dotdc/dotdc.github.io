+++
author = "David Calvert"
title = "Migrating from ingress-nginx to Envoy Gateway"
date = "2026-03-17"
description = "How I managed the migration from ingress-nginx to Envoy Gateway."
tags = [
    "sre", "kubernetes", "envoy", "nginx"
]
categories = [
    "tech"
]
thumbnail = "/img/thumbs/envoy.webp"
featureImage = "envoy-gateway.webp"
featureImageAlt = "Banner with the Envoy Gateway logo."
+++

<!--more-->

## Introduction

At work, I recently had to plan the migration from [ingress-nginx](https://github.com/kubernetes/ingress-nginx) to [Envoy Gateway](https://github.com/envoyproxy/gateway). The main reason was the announced [retirement of ingress-nginx](https://www.kubernetes.dev/blog/2025/11/12/ingress-nginx-retirement/), but it was also a good opportunity to adopt [Gateway API](https://gateway-api.sigs.k8s.io/). In this article, I'll go through the main differences between the two solutions, the migration plan I used, how I converted the existing manifests and how I made the switch without affecting customers.

## What changes?

The goal here is not to list all changes or replace the existing documentation, but to focus on the most common ones and those related to my use case. For each `nginx.ingress.kubernetes.io/*` annotation you use, you'll need to make sure you can achieve the same result with Gateway API resources.

Here are a few differences worth checking:

- **Default timeout**: `60s` on ingress-nginx, `15s` on Envoy Gateway. This timeout difference matters because requests that were fine with ingress-nginx may now fail earlier, especially for slow HTTP endpoints or long-lived gRPC calls.
- **Headers containing underscores**: Envoy Gateway rejects headers with underscores by default. Depending on your existing configuration, you may need to use `withUnderscoresAction: Allow` in `ClientTrafficPolicy` or another configuration scope. (See [envoyproxy/gateway #8351](https://github.com/envoyproxy/gateway/issues/8351))
- **External auth**: Envoy Gateway appends the original request path to the configured auth path, so you may need to update your auth endpoint to handle more paths, and more HTTP methods than you had with ingress-nginx. ([Documentation](https://gateway.envoyproxy.io/docs/api/extension_types/#httpextauthservice))

To get all Ingress resources:

```bash
kubectl get ingress -A
```

To get nginx-ingress annotations in use:

```bash
kubectl get ingress -A -o yaml | grep "nginx.ingress.kubernetes.io" | sort -u
```

## Migration strategy

Here's my migration plan:

1. Install the Gateway API CRDs and Envoy Gateway.
2. Create a [GatewayClass](https://gateway.envoyproxy.io/latest/api/gateway_api/gatewayclass/) and a [Gateway](https://gateway.envoyproxy.io/latest/api/gateway_api/gateway/).
3. Create new AWS target groups and security rules.
4. Convert existing [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) resources into [HTTPRoute](https://gateway-api.sigs.k8s.io/api-types/httproute/), [BackendTrafficPolicy](https://gateway-api.sigs.k8s.io/api-types/backendtrafficpolicy/), [SecurityPolicy](https://gateway.envoyproxy.io/latest/concepts/gateway_api_extensions/security-policy/) and [ReferenceGrant](https://gateway-api.sigs.k8s.io/api-types/referencegrant/).
5. Validate all routes and test in staging.
6. Switch traffic using the new target groups.
7. Clean up old resources.

This step-by-step approach makes the migration easier to manage without impacting developers and customers.

## Installing Envoy Gateway

The first step is to install the Gateway API CRDs and Envoy Gateway. I used the [official Helm chart](https://gateway.envoyproxy.io/latest/install/install-helm/) to do so and then created a [GatewayClass](https://gateway.envoyproxy.io/latest/api/gateway_api/gatewayclass/) and a [Gateway](https://gateway.envoyproxy.io/latest/api/gateway_api/gateway/).

In order to validate the deployment, make sure all the resources have been created:

```bash
kubectl get deploy,po,svc,gtw,eproxy -n envoy-gateway-system
```

## Creating new AWS resources

We use Terraform to provision our AWS infrastructure, so I added new resources behind a `use_envoy_gateway` feature flag in our Terraform modules alongside the existing ones. In my case, I had to:

- Create new target groups for the AWS ALBs and NLBs
- Add security group rules to allow traffic on the new port

This allowed me to leave the current load balancer configuration untouched until everything was ready.

## Converting Ingress resources

To translate the existing `Ingress` resources to Gateway API resources, I initially tried [ingress2gateway](https://github.com/kubernetes-sigs/ingress2gateway) from Kubernetes SIGs, but it didn't support many of our use cases. That's when I found the [ingress2eg](https://github.com/kkk777-7/ingress2eg) fork, which supports many more features.

### Conversion script

To speed things up, I created a script to convert all ingresses from all namespaces in the current Kubernetes context:

```bash
#!/usr/bin/env bash

Y="\033[1;33m"
W="\033[0m"

# ./ingress2gateway or ./ingress2eg
# See:
# - https://github.com/kubernetes-sigs/ingress2gateway
# - https://github.com/kkk777-7/ingress2eg
binary="./ingress2eg"

# Loop through all namespaces and convert all ingresses
for ns in $(kubectl get ingress -A --no-headers | awk '{ print $1 }' | sort -u); do
    for ingress in $(kubectl get ingress -n "$ns" --no-headers | awk '{ print $1 }'); do
        kubectl get ingress "$ingress" -n "$ns" -o yaml > "ingress-${ns}-${ingress}.yaml"

        # Files and command definition
        input_file="ingress-${ns}-${ingress}.yaml"
        output_file="converted-ingress-${ns}-${ingress}.gateway.yaml"
        cmd=(
          "$binary" print
          --providers=ingress-nginx
          -n "$ns"
          --input-file "$input_file"
        )

        if "${cmd[@]}" &> "$output_file"; then
            echo -e "✅ ${Y}${ingress}${W} in namespace ${Y}${ns}${W} converted!"
        else
            echo -e "❌ Error converting ${Y}${ingress}${W} in namespace ${Y}${ns}${W}."
        fi
    done
done
```

For the Ingresses that fail to convert, you'll need to handle them manually, but the others may work out of the box. In our case, it turned out that many generated manifests lacked critical configuration, especially for routes requiring external auth (`extAuth`), so I had to fix them.

Note that using ingress2eg will add the following annotations which you may want to remove:

```yaml
annotations:
  gateway.networking.k8s.io/generator: ingress2eg-dev
```

Depending on your setup, you will likely end up with:

- [HTTPRoute](https://gateway-api.sigs.k8s.io/api-types/httproute/) for routing rules
- [BackendTrafficPolicy](https://gateway-api.sigs.k8s.io/api-types/backendtrafficpolicy/) for traffic settings
- [SecurityPolicy](https://gateway.envoyproxy.io/latest/concepts/gateway_api_extensions/security-policy/) for auth and security settings
- [ReferenceGrant](https://gateway-api.sigs.k8s.io/api-types/referencegrant/) for cross-namespace references

## Making the switch

Once all the Gateway API and Envoy Gateway resources were running alongside the existing configuration, the final switch was straightforward and had no impact on customers. In our case, this simply meant enabling the `use_envoy_gateway` feature flag in our Terraform module. It also made rollback easy in case something went wrong.

## Final thoughts

The complexity of migrating from ingress-nginx to Envoy Gateway depends heavily on your platform requirements. It also requires some attention, especially if you are new to the Gateway API. I hope this article gives you a useful starting point if you need to make the switch.

You can also follow me on:

- GitHub : [https://github.com/dotdc](https://github.com/dotdc)
- LinkedIn : [https://www.linkedin.com/in/0xDC](https://www.linkedin.com/in/0xDC)
- Bluesky : [https://bsky.app/profile/0xdc.me](https://bsky.app/profile/0xdc.me)
- Twitter : [https://twitter.com/0xDC_](https://twitter.com/0xDC_)

👋
