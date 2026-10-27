#!/bin/sh
# Serves the web app under BASE_PATH (e.g. "/quiz" for https://host/quiz/).
#
# The frontend is built with the placeholder /__RAZZIA_BASE__/ and copied
# from /app/web-dist with the real base filled in, so changing BASE_PATH only
# needs a new container, not a new image. The reverse proxy in front must strip the
# prefix: the container itself always serves from "/".
set -eu

base="${BASE_PATH:-/}"

case "$base" in
  /*) ;;
  *) base="/$base" ;;
esac

case "$base" in
  */) ;;
  *) base="$base/" ;;
esac

if ! printf '%s' "$base" | grep -Eq '^/([A-Za-z0-9._~-]+/)*$'; then
  echo "Invalid BASE_PATH: $BASE_PATH" >&2
  exit 1
fi

# A restart keeps the prepared copy (and any later changes made to it inside
# the container); it is only rebuilt for a new container or another base.
if [ "$(cat /app/web/.base-path 2>/dev/null)" != "$base" ]; then
  rm -rf /app/web
  cp -r /app/web-dist /app/web

  find /app/web -type f \( -name '*.html' -o -name '*.js' -o -name '*.css' \) \
    -exec sed -i "s#/__RAZZIA_BASE__/#${base}#g" {} +

  printf '%s' "$base" > /app/web/.base-path
fi

exec "$@"
