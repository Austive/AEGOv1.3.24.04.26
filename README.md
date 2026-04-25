# Aego Platform
fir

Aego is an innovative e-hailing platform designed for low-cost, short-term security solutions in Durban, South Africa. It connects clients who need temporary security (close protection, event security, asset protection) with vetted security companies and personnel.

## Features

* **Role-Based Workflows**: Separate, tailored dashboards and capabilities for Clients, Companies, Security Personnel, and Admins.
* **Real-Time Booking**: On-demand e-hailing style matching for security services.
* **Secure Authentication & Database**: Powered by Firebase Auth and Firestore with robust, hardened security rules.
* **Notifications & Chat**: Real-time updates and secure messaging between stakeholders.
* **End-to-End Testing**: Protected by Playwright E2E tests validating critical user flows.

## Quick Start: Launch for Testing

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* NPM or Yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory and copy the contents from `.env.example`. Make sure to fill in your appropriate variables:
```bash
cp .env.example .env
```
Ensure your Firebase configuration is properly set up in `firebase-applet-config.json` and `firebase.ts`.

### 3. Launch Development Server for Testing
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

**The development server automatically:**
- Hot-reloads on file changes
- Provides debugging tools
- Connects to your Firebase test configuration

### 4. Run E2E Tests (Recommended for QA)
To verify the application flows using Playwright:
```bash
npx playwright install # First time only
npm run test:e2e
```

## Local Installation & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* NPM or Yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory and copy the contents from `.env.example`. Make sure to fill in your appropriate variables:
```bash
cp .env.example .env
```
Ensure your Firebase configuration is properly set up in `firebase-applet-config.json` and `firebase.ts`.

### 3. Start Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

### 4. Run E2E Tests
To verify the application flows using Playwright:
```bash
npx playwright install # First time only
npm run test:e2e
```

## Converting to a Mobile App (Android & iOS)

To convert this React web application into a native mobile application for Android and iOS, the most effective tool is **Capacitor**. Capacitor wraps your responsive web app in a native WebView and provides access to native APIs, allowing you to build once and deploy across platforms.

### Step 1: Install Capacitor

First, install the Capacitor CLI and core packages:
```bash
npm install @capacitor/core
npm install -D @capacitor/cli
```

### Step 2: Initialize Capacitor

Initialize the Capacitor configuration. This creates a `capacitor.config.ts` file in your project.
```bash
npx cap init Aego com.aego.app --web-dir dist
```
*Note: Make sure the `webDir` is set to `dist` (Vite's default build output folder).*

### Step 3: Build the Web App

Before adding mobile platforms, compile your production web assets:
```bash
npm run build
```

### Step 4: Add Mobile Platforms

Install the Android and iOS packages, then add the platforms to your project. 
*(Note: iOS compilation requires a Mac with Xcode, Android requires Android Studio).*

```bash
npm npxinstall @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

### Step 5: Sync Assets

Whenever you make changes to your React app and rebuild (`npm run build`), you need to sync the updated web assets into your native Android/iOS projects:
```bash
npx cap sync
```

### Step 6: Deploy & Run

Open the projects in their respective native IDEs to build, run on simulators/physical devices, and publish to the App Store or Google Play:
```bash
# Open Android Studio
npx cap open android

# Open Xcode
npx cap open ios
```
