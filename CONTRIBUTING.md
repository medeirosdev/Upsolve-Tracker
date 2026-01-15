# Contributing to UpSolve

Thank you for your interest in contributing to UpSolve! We welcome contributions from the community to help improve this tool for competitive programmers.

## Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/yourusername/upsolve.git
    cd upsolve
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Create a branch** for your feature or bug fix:
    ```bash
    git checkout -b feature/amazing-feature
    ```

## Development Workflow

*   Run the development server: `npm run electron:dev`
*   Ensure your code adheres to the existing style conventions.
*   Run linting before committing: `npm run lint`

## Submitting Changes

1.  **Commit your changes** with a clear and descriptive message.
2.  **Push to your fork**:
    ```bash
    git push origin feature/amazing-feature
    ```
3.  **Open a Pull Request** against the main repository. Use the provided PR template to describe your changes.

## Code Style

*   Use TypeScript for all new logic.
*   Use functional React components with Hooks.
*   Ensure components are typed strictly.
*   Follow the existing folder structure.

## Reporting Bugs

Please use the **Bug Report** issue template when observing unexpected behavior. Include:
*   Steps to reproduce.
*   Expected behavior vs. actual behavior.
*   Screenshots if applicable.
*   Operating System and version.
