# GEMINI.md - Project Context

## Project Overview
**xpnss** is a modern web application built using [Next.js](https://nextjs.org/) (version 16) and [React 19](https://react.dev/). It utilizes the **App Router** architecture and is styled with **Tailwind CSS 4**. The project is configured with **TypeScript** for enhanced type safety and developer experience.

### Key Technologies
- **Framework:** Next.js 16.2.4 (App Router)
- **Library:** React 19.2.4
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 (with PostCSS)
- **Linting:** ESLint 9

---

## Building and Running
The following scripts are defined in `package.json` to manage the project's lifecycle:

- **Development Server:**
  ```bash
  npm run dev
  ```
  Starts the Next.js development server with hot-reloading.

- **Production Build:**
  ```bash
  npm run build
  ```
  Compiles the application for production deployment.

- **Start Production Server:**
  ```bash
  npm run start
  ```
  Runs the built application in production mode.

- **Linting:**
  ```bash
  npm run lint
  ```
  Runs ESLint to check for code quality and style issues.

---

## Development Conventions
- **App Router Architecture:** All routes and layouts are located within the `app/` directory.
- **Component Styling:** Tailwind CSS is the primary tool for styling. Use utility classes directly in components.
- **Type Safety:** TypeScript is used throughout the project. Ensure proper typing for components and data structures.
- **Code Quality:** ESLint is configured to maintain consistent coding standards. Adhere to the rules defined in `eslint.config.mjs`.
- **Assets:** Static assets (images, fonts, etc.) are stored in the `public/` directory and accessed via the base path (`/`).

---

## Project Structure (Highlights)
- `app/`: Contains the application routes, layouts, and global styles.
- `public/`: Static assets such as logos and icons.
- `next.config.ts`: Next.js configuration file.
- `tsconfig.json`: TypeScript configuration.
- `package.json`: Project dependencies and scripts.
