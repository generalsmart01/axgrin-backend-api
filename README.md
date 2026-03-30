# Axgrin Backend

Welcome to the backend repository of **Axgrin** – a comprehensive personal finance application powering expense tracking, budget goal management, smart categorizations, and intelligent AI-driven financial assistance.

This project is built using **Node.js, NestJS, Prisma**, and uses **SQLite** (with future migration plans for PostgreSQL). It integrates seamlessly with **Stripe** for premium subscriptions and **Ollama** for local AI processing.

## 🚀 Key Features

### 1. Financial Management
- **Expense & Income Tracking**: Full CRUD management of users’ personal finance records.
- **Budget Goals & Categories**: Custom categories and smart budget goals to help users stay on track.
- **Activity Tracking**: Detailed logging of all significant actions, perfect for auditing.

### 2. Intelligent AI Assistant (Ollama Powered)
- **Proactive Notifications**: Budget limits and goal achievement alerts.
- **Auto-Categorize**: Automatically suggest and apply categories for new expenses.
- **Financial Health Analysis**: AI analyzes user spending patterns, identifies strengths/weaknesses, and gives a standardized score.
- **Local Privacy**: Runs locally using Ollama, keeping user financial queries strictly private.

### 3. Subscription & Roles
- **Stripe Integration**: Supports robust payment workflows, trials, cancellations, and renewals.
- **Four Core Roles**:
  - `USER`: Base level access to personal finance tracking.
  - `PREMIUM`: Paid tier unlocking comprehensive AI integrations (unlimited chat, advanced reporting).
  - `VIEWER`: Read-only access for accountants/advisors.
  - `ADMIN`: Complete system access, subscription oversight, and dashboard analytics.

## 🛠️ Tech Stack & Dependencies
- **Core**: Node.js, NestJS
- **Database**: Prisma ORM, SQLite
- **Caching & Rate Limiting**: Redis, Cache-Manager
- **Security**: JWT Authentication, Helmet, Express-Rate-Limit, bcrypt
- **Integrations**: Stripe, Ollama (Local AI Provider), NodeMailer

## 🏁 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Copy `.env.example` to `.env` and fill out your keys. Make sure you define your JWT secrets, Stripe Webhook secrets, and configure your local Ollama connection.

3. **Database Setup**
   Ensure Prisma generates your types and applies configurations, then push your schema and seed the database.
   ```bash
   npx prisma generate
   npm run seed
   ```

4. **Start the Application**
   ```bash
   # development
   npm run start:dev

   # production mode
   npm run build
   npm run start:prod
   ```

5. **Start Ollama** (Required for AI features)
   Ensure Ollama is running locally with the necessary model active. See the setup guide in the `docs/` folder for instructions.

## 📚 Deeper Documentation

For advanced details regarding specific modules, API payloads, or roadmap planning, please refer to the `docs/` directory:

- [API Payloads Examples](./docs/API_PAYLOADS.md) - Details request/response schemas.
- [AI & Ollama Setup Guide](./docs/OLLAMA_SETUP_GUIDE.md) - Instructions to run the local AI assistant.
- [Roles Documentation](./docs/ROLES_DOCUMENTATION.md) - Deep dive into permissions and tier accesses.
- [Roadmap to Success](./docs/ROADMAP_TO_SUCCESS.md) - Our current roadmap toward production launch.

## 📝 License
This project is [MIT licensed](LICENSE) and privately maintained.
