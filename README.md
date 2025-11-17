# GitHub User & Repository Explorer

A modern web application for searching GitHub users and exploring their public repositories. Built with Next.js, React, and TypeScript, featuring a clean hexagonal architecture and comprehensive testing.

## ✨ Features

- 🔍 **User Search**: Search for GitHub users with real-time debounced input
- 📦 **Repository Display**: View user repositories with details (stars, forks, language, last update)
- 📄 **Pagination**: Load more repositories with seamless pagination support
- ♿ **Accessibility**: WCAG 2.1 Level AA compliant with full keyboard navigation and screen reader support
- 🎨 **Responsive Design**: Mobile-first design with Tailwind CSS
- 🧪 **Well Tested**: unit tests + comprehensive E2E tests with Playwright
- 🏗️ **Clean Architecture**: Hexagonal architecture (Ports & Adapters) for maintainability

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/pabloflego/gh-user-repo-explorer.git
cd gh-user-repo-explorer

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

### Development
```bash
pnpm dev          # Start development server (localhost:3000)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Testing
```bash
# Unit Tests (Vitest)
pnpm test         # Run tests in watch mode
pnpm test:run     # Run tests once
pnpm test:ui      # Open Vitest UI

# E2E Tests (Playwright)
pnpm test:e2e         # Run E2E tests (headless)
pnpm test:e2e:ui      # Run E2E tests with Playwright UI
pnpm test:e2e:headed  # Run E2E tests in headed mode
pnpm test:e2e:debug   # Debug E2E tests
```

## 🏗️ Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters pattern) for clean separation of concerns:

```
lib/
├── backend/
│   ├── application/
│   │   ├── adapters/       # External adapters (GithubApi, Logger)
│   │   └── ports/          # Interface definitions
│   └── routes/             # Next.js API route handlers
├── frontend/
│   ├── application/
│   │   └── adapters/       # Frontend API client
│   ├── components/         # React components
│   └── pages/              # Page components
└── domain/                 # Domain entities and types
```

### Key Architectural Decisions

- **Ports & Adapters**: Business logic is independent of external dependencies
- **Dependency Injection**: Routes instantiate adapters, making them easy to test and swap
- **Type Safety**: Full TypeScript coverage with strict mode enabled
- **Separation of Concerns**: Frontend, backend, and domain logic are clearly separated

## 🧪 Testing Strategy

### Unit Tests
- **Framework**: Vitest + React Testing Library
- **Coverage**: Components, API clients, adapters, route handlers
- **Philosophy**: Test behavior, not implementation details
- **Speed**: ~3 seconds total runtime

### E2E Tests
- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Scope**: User workflows, accessibility, error handling, pagination
- **API**: Tests run against real GitHub API

## 🎨 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Testing**: [Vitest 4](https://vitest.dev/) + [Playwright 1.56](https://playwright.dev/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## ♿ Accessibility

This application is built with accessibility as a core requirement:

- ✅ Semantic HTML elements
- ✅ ARIA labels, roles, and live regions
- ✅ Full keyboard navigation support
- ✅ Screen reader friendly
- ✅ Focus management
- ✅ Color contrast compliance (WCAG AA)

## 🔧 Configuration Files

- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `vitest.config.ts` - Vitest configuration
- `playwright.config.ts` - Playwright configuration
- `eslint.config.mjs` - ESLint configuration

## 📝 API Routes

### `GET /api/users?q={query}`
Search for GitHub users.

**Query Parameters:**
- `q` (required): Username search query

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "login": "octocat",
      "avatar_url": "https://...",
      "html_url": "https://github.com/octocat",
      "public_repos": 8
    }
  ],
  "total_count": 1
}
```

### `GET /api/users/{username}/repos?page={page}`
Fetch repositories for a specific user.

**Path Parameters:**
- `username` (required): GitHub username

**Query Parameters:**
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Hello-World",
      "full_name": "octocat/Hello-World",
      "html_url": "https://github.com/octocat/Hello-World",
      "description": "My first repository",
      "stargazers_count": 2000,
      "forks_count": 500,
      "language": "TypeScript",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "hasNextPage": true
}
```

## 🚦 CI/CD

GitHub Actions workflows are configured for:

- **Unit Tests**: Run on every push/PR (`.github/workflows/test.yml`)
- **E2E Tests**: Run on every push/PR (`.github/workflows/e2e.yml`)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Maintain TypeScript strict mode compliance
- Follow existing code structure and patterns
- Ensure accessibility standards are met
- Run `pnpm test:run` and `pnpm lint` before committing

## 🙏 Acknowledgments

- GitHub API for providing public data access
- Next.js team for an excellent framework
- Playwright and Vitest teams for robust testing tools
