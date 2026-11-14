# Resume experience and tag button styles (draft)

```sass

.resume-experience
  border-left: 0.2rem solid $theme
  background: var(--haze)
  color: #555555
  margin: 25px auto
  padding: 0
  display: block
  transition: background 0.2s ease

  &:hover
    background: color-mix(in srgb, var(--haze) 85%, white 15%)

  & + .resume-experience
    margin-top: 1.5rem

.resume-experience__summary
  cursor: pointer
  list-style: none
  margin: 0
  padding: 1rem 1.5rem
  display: flex
  align-items: center
  gap: 0.75rem
  font-weight: 600
  color: inherit
  background: transparent
  transition: background 0.2s ease

.resume-experience__summary::-webkit-details-marker
  display: none

.resume-experience__summary::after
  content: '▸'
  margin-left: auto
  font-size: 0.85em
  transition: transform 0.2s ease

.resume-experience[open] > .resume-experience__summary::after
  transform: rotate(90deg)

.resume-experience__content
  padding: 0 1.5rem 1.5rem
  border-top: 1px solid rgba($theme, 0.2)
  color: inherit

  > :first-child
    margin-top: 1rem

  > :last-child
    margin-bottom: 0

$tag-colors: ("default": $green, "ai": #a245ff, "books": #ff7230, "news": #28ace2, "prometheus": #e6522c, "git": #f1502f, "kubernetes": #326ce5, "3d-printing": #8cb034, "grafana": #f9b210, "loki": #f9b210, "claude-code": #e28053, "cursor": #8c8c8c, "github": #ffffff, "fosdem": #d115b1, "gcp": #4285f4, "vertex-ai": #4285f4, "slackbot": #f42b6b, "terraform": #5f4ef5, "aws": #ff8f00, "sre": #2268ff, "conference": #28ace2, "security": #00c41e, "monitoring": #ffc500, "observability": #ff3c36)
$tag-hover-bg-colors: map-merge($tag-colors, ("default": map-get($tag-colors, "default")))
$default-tag-color: map-get($tag-colors, "default")
$default-tag-hover-bg: map-get($tag-hover-bg-colors, "default")

.post_tag.button.button_translucent
  color: $default-tag-color

@each $tag, $color in $tag-colors
  @if $tag != "default"
    $tag-hover-bg: map-get($tag-hover-bg-colors, $tag)

    .sidebar .post_tag.button.button_translucent.tag-color--#{$tag}
      --tag-fill-color: #{if($tag-hover-bg != null, $tag-hover-bg, $default-tag-hover-bg)}
      --tag-active-border: #{$color}
      color: $color
      background: rgba($color, 0.08)
      border-color: $color
```
