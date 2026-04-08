#!/usr/bin/env bash
set -euo pipefail

DAPP_NAME="dao-app"
MANIFEST_NAME="BeamX DAO"
MANIFEST_DESCRIPTION="BeamX DAO dapp"
MANIFEST_VERSION_PREFIX="1.1"
MANIFEST_ICON="localapp/app/assets/icon.svg"
MANIFEST_URL="localapp/app/index.html"
MANIFEST_API_VERSION="7.3"
MANIFEST_MIN_API_VERSION="7.3"
MANIFEST_GUID="c26538f5ce9e410b89c1fd0dff783f97" # uses BeamX DAO Voting dapp GUID, perhaps make new one?

COMMIT_COUNT="$(git rev-list --count HEAD)"
VERSION="${MANIFEST_VERSION_PREFIX}.${COMMIT_COUNT}"

yarn install
yarn build:prod

test -f html/index.html
test -f html/index.js
test -f html/styles.css
test -f html/assets/icon.svg

rm -rf "${DAPP_NAME}" "${DAPP_NAME}.dapp"
mkdir -p "${DAPP_NAME}/app"
cp -r html/* "${DAPP_NAME}/app/"
# Keep a deterministic app icon in the packaged dapp.
cp html/assets/icon.svg "${DAPP_NAME}/app/assets/icon.svg"

cat > "${DAPP_NAME}/manifest.json" <<EOF
{
  "name": "${MANIFEST_NAME}",
  "description": "${MANIFEST_DESCRIPTION}",
  "icon": "${MANIFEST_ICON}",
  "url": "${MANIFEST_URL}",
  "version": "${VERSION}",
  "api_version": "${MANIFEST_API_VERSION}",
  "min_api_version": "${MANIFEST_MIN_API_VERSION}",
  "guid": "${MANIFEST_GUID}"
}
EOF

(
  cd "${DAPP_NAME}"
  zip -r "../${DAPP_NAME}.dapp" ./*
)

echo "Created ${DAPP_NAME}.dapp with version ${VERSION}"
