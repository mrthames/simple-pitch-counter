#!/bin/bash
#
# deploy-ios.sh — Build and upload Simple Pitch Counter to App Store Connect
#
# Usage: ./scripts/deploy-ios.sh
# Run from the repo root on your Mac.
#
# Prerequisites:
#   - Xcode installed with a valid signing identity
#   - App Store Connect API key or Apple ID configured in Xcode
#

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT="$REPO_ROOT/app/Little League Pitch Counter.xcodeproj"
SCHEME="Simple Pitch Counter"
ARCHIVE_PATH="$REPO_ROOT/build/SimplePitchCounter.xcarchive"
EXPORT_PATH="$REPO_ROOT/build/export"

echo "=== Simple Pitch Counter — iOS Deploy ==="
echo ""

# Step 1: Pull latest
echo "→ Pulling latest from GitHub..."
cd "$REPO_ROOT"
git pull origin main
echo ""

# Step 2: Clean
echo "→ Cleaning previous build..."
rm -rf "$REPO_ROOT/build"
xcodebuild -project "$PROJECT" -scheme "$SCHEME" clean -quiet
echo ""

# Step 3: Build & Archive
echo "→ Building and archiving..."
xcodebuild -project "$PROJECT" \
  -scheme "$SCHEME" \
  -sdk iphoneos \
  -configuration Release \
  -archivePath "$ARCHIVE_PATH" \
  archive -quiet

if [ ! -d "$ARCHIVE_PATH" ]; then
  echo "✗ Archive failed. Check Xcode signing and build settings."
  exit 1
fi
echo "✓ Archive created at $ARCHIVE_PATH"
echo ""

# Step 4: Export IPA
echo "→ Exporting IPA..."
if [ ! -f "$REPO_ROOT/scripts/ExportOptions.plist" ]; then
  echo "✗ Missing scripts/ExportOptions.plist"
  echo "  Generate one from Xcode: Product → Archive → Distribute App → Export"
  echo "  Or create manually (see docs/process/deployment.md)"
  exit 1
fi

xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$REPO_ROOT/scripts/ExportOptions.plist" \
  -quiet

echo "✓ IPA exported to $EXPORT_PATH"
echo ""

# Step 5: Upload to App Store Connect
echo "→ Uploading to App Store Connect..."
xcrun altool --upload-app \
  -f "$EXPORT_PATH/Simple Pitch Counter.ipa" \
  -t ios \
  --apiKey "${APP_STORE_API_KEY:-}" \
  --apiIssuer "${APP_STORE_API_ISSUER:-}" \
  2>/dev/null || {
    echo ""
    echo "⚠ Automatic upload failed or API key not configured."
    echo "  You can upload manually:"
    echo "  1. Open Xcode → Window → Organizer"
    echo "  2. Select the archive → Distribute App"
    echo "  3. Follow the App Store Connect prompts"
    echo ""
    echo "  Or use Transporter.app to upload the IPA from:"
    echo "  $EXPORT_PATH"
    exit 0
  }

echo ""
echo "✓ Upload complete. Check App Store Connect for processing status."
echo "  https://appstoreconnect.apple.com"
