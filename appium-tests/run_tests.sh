#!/bin/zsh
# ============================================================
# PawPal Appium E2E Test Runner
# Usage:
#   ./run_tests.sh                      — run all tests
#   ./run_tests.sh --device "Pixel_7"   — specify device name
#   ./run_tests.sh --apk "/path/to.apk" — specify APK path
# ============================================================

set -u

# Export PATH so that brew, maven, and android platform-tools are found
export ANDROID_HOME="${ANDROID_HOME:-/Users/surya/Library/Android/sdk}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
export PATH="/opt/homebrew/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

# ─── Script directory (always relative to this script) ─────
SCRIPT_DIR="${0:A:h}"
cd "$SCRIPT_DIR"

# ─── Defaults ───────────────────────────────────────────────
APK_PATH="/Users/surya/Documents/pawpal/PawPal-Android-Install.apk"
DEVICE_NAME=""
PLATFORM_VERSION=""
APPIUM_SERVER="http://127.0.0.1:4723"
START_SERVER=true

# ─── Parse optional arguments ───────────────────────────────
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --apk)         APK_PATH="$2";         shift 2 ;;
    --device)      DEVICE_NAME="$2";      shift 2 ;;
    --platform)    PLATFORM_VERSION="$2"; shift 2 ;;
    --server)      APPIUM_SERVER="$2";    shift 2 ;;
    --no-start-server) START_SERVER=false; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

if [ ! -f "$APK_PATH" ]; then
  echo "APK not found: $APK_PATH"
  exit 2
fi

if ! command -v adb >/dev/null 2>&1; then
  echo "ADB was not found. Check ANDROID_HOME: $ANDROID_HOME"
  exit 2
fi

CONNECTED_DEVICE="$(adb devices | awk 'NR>1 && $2=="device" {print $1; exit}')"
if [ -z "$CONNECTED_DEVICE" ]; then
  echo "No ready Android device or emulator was found."
  echo "Start the Pixel_10 emulator in Android Studio, then run this file again."
  exit 2
fi

if [ -z "$DEVICE_NAME" ]; then DEVICE_NAME="$CONNECTED_DEVICE"; fi
if [ -z "$PLATFORM_VERSION" ]; then
  PLATFORM_VERSION="$(adb -s "$CONNECTED_DEVICE" shell getprop ro.build.version.release | tr -d '\r')"
fi

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║       PawPal E2E Appium Test Runner                  ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  APK     : $APK_PATH"
echo "║  Device  : $DEVICE_NAME"
echo "║  Platform: Android $PLATFORM_VERSION"
echo "║  Server  : $APPIUM_SERVER"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ─── Check prerequisites ─────────────────────────────────────
echo "🔍 Checking prerequisites..."

# Java
if ! command -v java &> /dev/null; then
  echo "❌ Java not found. Please install Java 11+."
  exit 1
fi
echo "  ✅ Java: $(java -version 2>&1 | head -1)"

# Maven
if ! command -v mvn &> /dev/null; then
  echo "❌ Maven not found. Install with: brew install maven"
  exit 1
fi
echo "  ✅ Maven: $(mvn -version 2>&1 | head -1)"

# Appium server check
echo "  🔄 Checking Appium server at $APPIUM_SERVER ..."
APPIUM_PID=""
if curl -s --max-time 5 "$APPIUM_SERVER/status" > /dev/null 2>&1; then
  echo "  ✅ Appium server is running"
else
  if [ "$START_SERVER" = true ] && command -v appium >/dev/null 2>&1; then
    echo "  🔄 Starting Appium server..."
    mkdir -p test-output
    APPIUM_PORT="${APPIUM_SERVER##*:}"
    APPIUM_PORT="${APPIUM_PORT%%/*}"
    appium --port "$APPIUM_PORT" \
      --allow-insecure uiautomator2:chromedriver_autodownload \
      --log test-output/appium-server.log >/dev/null 2>&1 &
    APPIUM_PID=$!
    for _ in {1..30}; do
      curl -s --max-time 2 "$APPIUM_SERVER/status" >/dev/null 2>&1 && break
      sleep 1
    done
  fi
  if ! curl -s --max-time 5 "$APPIUM_SERVER/status" >/dev/null 2>&1; then
    echo "Appium server could not be reached at $APPIUM_SERVER"
    exit 2
  fi
  echo "  ✅ Appium server started"
fi

cleanup() {
  if [ -n "$APPIUM_PID" ]; then kill "$APPIUM_PID" 2>/dev/null || true; fi
}
trap cleanup EXIT INT TERM

# ADB check
if command -v adb &> /dev/null; then
  echo "  ✅ ADB found: $(adb version | head -1)"
  echo ""
  echo "  📱 Connected Android devices:"
  adb devices
else
  echo "  ⚠️  ADB not found. Ensure Android SDK is installed."
fi

echo ""
echo "📦 Running Maven tests..."
echo "   Report will be generated at: test-output/reports/PawPal_E2E_Test_Report.xlsx"
echo ""

# ─── Run Maven with system properties ────────────────────────
mkdir -p test-output
mvn test \
  -Dapk.path="$APK_PATH" \
  -Ddevice.name="$DEVICE_NAME" \
  -Dplatform.version="$PLATFORM_VERSION" \
  -Dappium.server="$APPIUM_SERVER" \
  --no-transfer-progress \
  2>&1 | tee test-output/console.log

EXIT_CODE=${pipestatus[1]}

echo ""
echo "══════════════════════════════════════════════════════════"
FAILURE_TOTAL="$(rg -o 'Failures: [0-9]+' target/surefire-reports/TestSuite.txt 2>/dev/null | tail -1 | awk '{print $2}')"
FAILURE_TOTAL="${FAILURE_TOTAL:-0}"
SKIP_TOTAL="$(rg -o 'Skipped: [0-9]+' target/surefire-reports/TestSuite.txt 2>/dev/null | tail -1 | awk '{print $2}')"
SKIP_TOTAL="${SKIP_TOTAL:-0}"
if [ "$FAILURE_TOTAL" -gt 0 ] || [ "$SKIP_TOTAL" -gt 0 ]; then
  EXIT_CODE=1
fi

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Tests completed successfully!"
else
  echo "⚠️  Tests did not fully pass. Failures: $FAILURE_TOTAL, Skipped: $SKIP_TOTAL"
fi

REPORT_PATH="$SCRIPT_DIR/test-output/reports/PawPal_E2E_Test_Report.xlsx"
if [ -f "$REPORT_PATH" ]; then
  echo ""
  echo "📊 Excel Report: $REPORT_PATH"
fi

SCREENSHOTS_PATH="$SCRIPT_DIR/test-output/screenshots"
echo "📸 Screenshots: $SCREENSHOTS_PATH"
echo "📝 Console log: $SCRIPT_DIR/test-output/console.log"
echo "══════════════════════════════════════════════════════════"

exit $EXIT_CODE
