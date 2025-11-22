# Pigeon

Pigeon is a premium chat experience built on React and Firebase. It offers real-time one-to-one and group messaging, rich onboarding, and guardrails that keep every conversation personal and tidy.

## Live Demo

- Production: https://pigeon-161212.web.app

## Features

- **Dual-mode authentication**: Email/password accounts with password-visibility toggle plus one-click Google sign-in (`AuthForm.js`).
- **Guided onboarding**: First-time users complete a profile with display name and mini bio before accessing chats (`ProfileSetup.js`).
- **Personal and group chats**: Start direct chats via email lookup, create named groups, and jump back into any conversation instantly (`ChatList.js`).
- **In-chat productivity**: Edit or delete the messages you send, lazy-load older history, and keep context with group member rosters (`ChatPage.js`).
- **People-first context**: Tap “About Me” in direct chats or any member name in group views to open profile cards powered by Firestore (`ProfilePopup.js`).
- **AI entry point**: A branded SASH AI surface sets the stage for future assistant-powered conversations (`ChatList.js`).

## Tech Stack

- React 19 + Create React App tooling
- Firebase Authentication & Firestore (client SDK v12)
- Firebase Hosting for production deployments

## Prerequisites

- Node.js 18+ and npm 9+ (developed with npm 11.6.3)
- Firebase project with Authentication and Firestore enabled
- Optional: Firebase CLI (`npm install -g firebase-tools`) for hosting deployments

## Local Setup

1. Clone the repository and switch into it.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
   Visit http://localhost:3000 and sign in or create an account.
4. Run the production build or tests when needed:
   ```bash
   npm run build
   npm test
   ```

## Environment Configuration

All Firebase configuration currently lives in `src/firebase/firebase-config.js`. If you spin up a new Firebase project, update the following values:

```js
const firebaseConfig = {
  apiKey: "<API_KEY>",
  authDomain: "<PROJECT_ID>.firebaseapp.com",
  projectId: "<PROJECT_ID>",
  storageBucket: "<PROJECT_ID>.appspot.com",
  messagingSenderId: "<SENDER_ID>",
  appId: "<APP_ID>",
  measurementId: "<MEASUREMENT_ID>"
};
```

Create Firestore collections used by the app:

- `users`: profile docs keyed by Firebase UID (`displayName`, `bio`, `email`, `uid`).
- `chats`: each doc stores `members`, `isGroupChat`, optional `name`, and metadata.
- `chats/{chatId}/messages`: nested collection containing `text`, `uid`, `email`, `type`, timestamps, etc.

## Available Scripts

| Command         | Description                                                                                |
| --------------- | ------------------------------------------------------------------------------------------ |
| `npm start`     | Runs the Create React App dev server with hot reload.                                      |
| `npm test`      | Launches the Jest/React Testing Library runner in watch mode.                              |
| `npm run build` | Produces an optimized production bundle in `build/` (used for Firebase Hosting deploys).   |
| `npm run eject` | Copies CRA configs locally if you need to customize the build. Irreversible once invoked. |

## Deployment

1. Authenticate with Firebase CLI and select the `pigeon-161212` project (or another project you own):
   ```bash
   firebase login
   firebase use <project-id>
   ```
2. Build the app locally: `npm run build`.
3. Deploy to Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```
4. Confirm the production app is live at https://pigeon-161212.web.app after each deployment.

## Troubleshooting

- **`npm run build` warnings**: ESLint currently flags unused Google auth helpers in `ChatList.js`. Remove the imports or use them to clear warnings.
- **Auth errors**: Make sure Email/Password and Google providers are enabled inside Firebase Authentication.
- **Firestore permission issues**: Update your security rules so authenticated users can read/write their own profile docs and member chats.
- **Local cache**: If the intro modal shows repeatedly, clear `localStorage` entry `introDismissed` in your browser devtools.

## License

Distributed under the [MIT License](MIT License). © 2025 JAIKARTHICK.

Enjoy building on Pigeon! Contributions and issue reports are welcome.

# END OF README.MD
