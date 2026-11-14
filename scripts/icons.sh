#!/usr/bin/env bash
# Vendor the SVG icons used by the theme, so they are served from this site
# instead of a third party CDN. Only the icons actually used are committed.
#
# Icons are referenced as "<set>:<name>", or a bare Simple Icons slug:
# - Simple Icons (CC0-1.0, https://simpleicons.org): brand logos
# - mdi, Material Design Icons (Apache-2.0, https://pictogrammers.com/library/mdi/):
#   solid glyphs on the same 24px grid, for what has no brand logo
# - lucide (ISC, https://lucide.dev): outlined UI icons
#
# The refs are read from the `[params.icons]` table of content/resume.md,
# plus EXTRA_ICONS below for the ones used by the templates.
#
# Usage: scripts/icons.sh   (re-run after adding an icon or bumping a version)
set -euo pipefail

declare -A VERSIONS=(
  [simple-icons]="16.37.0"
  [mdi]="7.4.47"
  [lucide]="1.72.0"
)
declare -A LICENSES=(
  [simple-icons]="CC0-1.0 https://simpleicons.org"
  [mdi]="Apache-2.0 https://pictogrammers.com/library/mdi/"
  [lucide]="ISC https://lucide.dev"
)
EXTRA_ICONS=(lucide:printer)

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
dest="${root}/themes/0xDC/assets/icons"
cdn="https://cdn.jsdelivr.net/npm"

url() { # <set> <name>
  case "$1" in
    simple-icons) echo "${cdn}/simple-icons@${VERSIONS[$1]}/icons/$2.svg" ;;
    mdi) echo "${cdn}/@mdi/svg@${VERSIONS[$1]}/svg/$2.svg" ;;
    lucide) echo "${cdn}/lucide-static@${VERSIONS[$1]}/icons/$2.svg" ;;
    *) echo "unknown icon set: $1" >&2; exit 1 ;;
  esac
}

mapfile -t refs < <(
  {
    sed -n '/^\[params\.icons\]/,/^\(\[\|+++\)/p' "${root}/content/resume.md" \
      | sed -n 's/^[^#]*=[[:space:]]*"\([a-z0-9:-]*\)".*/\1/p'
    printf '%s\n' "${EXTRA_ICONS[@]}"
  } | sort -u
)

for set in "${!VERSIONS[@]}"; do
  rm -rf "${dest:?}/${set}"
done

for ref in "${refs[@]}"; do
  [[ "${ref}" == *:* ]] || ref="simple-icons:${ref}"
  set="${ref%%:*}" name="${ref#*:}"
  file="${dest}/${set}/${name}.svg"
  if [[ ! -d "${dest}/${set}" ]]; then
    mkdir -p "${dest}/${set}"
    printf '%s@%s (%s)\n' "${set}" "${VERSIONS[$set]}" "${LICENSES[$set]}" > "${dest}/${set}/SOURCE"
  fi
  curl --fail --silent --show-error --location --proto '=https' "$(url "${set}" "${name}")" -o "${file}"
  grep -q '<svg' "${file}" || { echo "not an svg: ${ref}" >&2; rm -f "${file}"; exit 1; }
  echo "${set}: ${name}"
done
