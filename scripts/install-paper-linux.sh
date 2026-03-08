#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${HOME}/Applications"
APP_PATH="${APP_DIR}/Paper.AppImage"
ICON_DIR="${HOME}/.local/share/icons/hicolor/512x512/apps"
ICON_PATH="${ICON_DIR}/paper-design.png"
DESKTOP_DIR="${HOME}/.local/share/applications"
DESKTOP_PATH="${DESKTOP_DIR}/paper-design.desktop"
TMP_DIR="$(mktemp -d)"
TMP_APPIMAGE="${TMP_DIR}/Paper.AppImage"

cleanup() {
  rm -rf "${TMP_DIR}"
}

trap cleanup EXIT

mkdir -p "${APP_DIR}" "${ICON_DIR}" "${DESKTOP_DIR}"

echo "Downloading Paper AppImage..."
curl -fL https://download.paper.design/linux/appImage -o "${TMP_APPIMAGE}"

echo "Installing Paper to ${APP_PATH}..."
install -m 755 "${TMP_APPIMAGE}" "${APP_PATH}"

echo "Extracting launcher icon..."
(
  cd "${TMP_DIR}"
  "${APP_PATH}" --appimage-extract >/dev/null
)
install -m 644 "${TMP_DIR}/squashfs-root/.DirIcon" "${ICON_PATH}"

cat > "${DESKTOP_PATH}" <<EOF
[Desktop Entry]
Name=Paper
Comment=Paper design desktop app
Exec=${APP_PATH} %U
Terminal=false
Type=Application
Icon=${ICON_PATH}
Categories=Graphics;Office;
StartupWMClass=Paper
MimeType=x-scheme-handler/paper;
EOF

update-desktop-database "${DESKTOP_DIR}" >/dev/null 2>&1 || true

echo
echo "Installed Paper."
echo "Launch ${APP_PATH} once and sign in."
echo "When the app is running, its MCP server should listen on http://127.0.0.1:29979/mcp."
