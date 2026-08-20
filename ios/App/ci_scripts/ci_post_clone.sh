#!/usr/bin/env bash
# Xcode Cloud: runs after git clone, before Swift Package Manager resolves CapApp-SPM.
# CapApp-SPM Package.swift depends on local path packages under node_modules/@capacitor/*
# and related plugins — those paths do not exist until npm ci runs.
set -euo pipefail

export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
export HOMEBREW_NO_AUTO_UPDATE=1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${CI_PRIMARY_REPOSITORY_PATH:-$(cd "$SCRIPT_DIR/../../.." && pwd)}"
cd "$REPO_ROOT"

echo "==> Repo root: $REPO_ROOT"

ensure_node() {
  if command -v node >/dev/null 2>&1; then
    local major
    major="$(node -p "process.versions.node.split('.')[0]")"
    if [ "$major" -ge 20 ]; then
      return 0
    fi
  fi

  echo "==> Installing Node.js 22 via Homebrew"
  brew install node@22
  if [ -d /opt/homebrew/opt/node@22/bin ]; then
    export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
  elif [ -d /usr/local/opt/node@22/bin ]; then
    export PATH="/usr/local/opt/node@22/bin:$PATH"
  else
    brew link --force --overwrite node@22 || true
  fi
}

ensure_node
echo "node $(node -v)"
echo "npm $(npm -v)"

# Xcode Cloud has had npm concurrency flakes; keep installs conservative.
npm config set maxsockets 3

echo "==> npm ci (required so CapApp-SPM local SPM paths resolve)"
npm ci

echo "==> Build web bundle + cap sync ios (ios/App/App/public is gitignored)"
CAPACITOR_BUILD=1 npm run build
npx cap sync ios

echo "==> Verifying CapApp-SPM path packages"
for pkg in \
  @capacitor/app \
  @capacitor/haptics \
  @capacitor/keyboard \
  @capacitor/splash-screen \
  @capacitor/status-bar \
  @capacitor-community/in-app-review \
  @capgo/capacitor-passkey
do
  if [ ! -d "node_modules/$pkg" ]; then
    echo "missing node_modules/$pkg" >&2
    exit 1
  fi
  if [ ! -f "node_modules/$pkg/Package.swift" ]; then
    echo "missing Package.swift in node_modules/$pkg" >&2
    exit 1
  fi
done

echo "==> ci_post_clone.sh complete"
