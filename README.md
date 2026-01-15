# UpSolve

UpSolve is a desktop application designed to assist competitive programmers in tracking their progress, managing problem-solving statistics, and maintaining a personal library of code snippets. Built with Electron, React, and TypeScript.

## Technology Stack

*   **Electron**: Desktop runtime
*   **React**: UI library
*   **TypeScript**: Static typing
*   **Vite**: Build tool and bundler
*   **Tailwind CSS**: Utility-first styling
*   **Zustand**: State management
*   **Monaco Editor**: Code editing capability

## Prerequisites

*   Node.js (v18 or higher recommended)
*   npm (v9 or higher)

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/upsolve.git
    cd upsolve
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Development

To start the application in development mode with Hot Module Replacement (HMR):

```bash
npm run electron:dev
```

This command runs Vite and Electron concurrently. Changes to renderer files (React) or main process files will trigger updates.

## Building

To create production-ready executables for your operating system.

### Windows
Generates an NSIS installer (.exe) in the `release` directory.
```bash
npm run electron:build:win
```

### macOS
Generates a disk image (.dmg).
```bash
npm run electron:build:mac
```

### Linux
Generates an AppImage.
```bash
npm run electron:build:linux
```

## Linting

To check for code style and strict type errors:

```bash
npm run lint
```

## Project Structure

*   `electron/`: Main process and preload scripts.
*   `src/`: React renderer source code.
    *   `components/`: Reusable UI components.
    *   `pages/`: Application views.
    *   `stores/`: Zustand state definitions.
    *   `contexts/`: React contexts (Theme, etc.).
*   `dist/`: Vite build output (renderer).
*   `release/`: Electron build output (executables).

## License

Distributed under the MIT License. See `LICENSE` for more information.
