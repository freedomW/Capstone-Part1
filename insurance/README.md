# Full Project Overview

This project includes the integration of GitHub OAuth and utilizes the latest versions of Prisma and Next.js.

---

## Installation Guide

This guide will help you set up the insurance project on your local machine. The application uses PostgreSQL as the database, but it's compatible with other database systems supported by Prisma.

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL
- Git

### Database and Application Setup

1. **Clone the repository**
  ```bash
  git clone [repository-url]
  cd [project-folder]
  ```

2. **Install dependencies**
  ```bash
  npm install
  ```

3. **Configure environment**
  Create a `.env` file with the following (adjust for your PostgreSQL setup):
  ```
  DATABASE_URL="postgresql://postgres:password@localhost:5432/insurance"
  GITHUB_ID="your-github-oauth-app-id"
  GITHUB_SECRET="your-github-oauth-app-secret"
  NEXTAUTH_SECRET="your-nextauth-secret"
  ```

4. **Initialize database with Prisma**
  ```bash
  npx prisma db push
  ```

5. **Run the seed SQL script**
  - Locate the `Script.sql` file in the project root
  - Execute it in your PostgreSQL database AFTER Prisma has created the tables:
  ```bash
  psql -U postgres -d insurance -f script.sql
  ```
  - Note: This script populates the database with initial data needed for the application as requested by the assignment

6. **Generate Prisma client**
  ```bash
  npx prisma generate
  ```

7. **Start the development server**
  ```bash
  npm run dev
  ```

8. **Access the application**
  Open your browser and navigate to: `http://localhost:3000`

## Database Seed

- **Note**: Database seeding was avoided due to its complexity. Instead, SQL scripts were used directly.
Plan to use view in the future for dashboard to avoid writing full sql script
Materialize view when prisma fully supports it.

---

## Areas for Improvement

While working on this project, I identified several aspects to refine:

### Naming Conventions
- Improve consistency in naming conventions, as I learned new standards during development.
- Refactor `routes.ts` for better naming conventions.
- Rename database tables for clarity and consistency:
  - `Insurance Policies` → `Policies`
  - `PolicyHolder` → `Customer`
  - `PolicyAssignment` → `CustomerPolicies`

### Folder Structure
- Organize components into better-structured folders.
- Break down reusable code into smaller components, such as the GitHub sign-in flow.

### Database Design
- Reorganize database tables:
  - Remove unnecessary fields (e.g., those modified from Auth.js).
  - Add `Employee` table to simulate agents.
  - Assign roles to agents and link them to `User` and `Account` tables.

### Middleware and Routing
- Refactor `middleware.ts` for improved routing.
- Enhance route naming for better readability and maintainability.

---

## Important Notes

### Prisma (Version 6.6.0+)
- Starting with Prisma 6.6.0, the `output` option must be used. 
  - Example: `output = "../src/generated/prisma/client"`
- The generated client file is located in the `src` directory for simplicity.

### Configuration Issues
- **Auth and Auth Config**:
  - Ensure `...authConfig` is correctly used, as alternatives like `..authConfig` or `.authConfig` can cause issues.
- **PrismaClient and PrismaAdapter**:
  - Note that `PrismaClient` and `PrismaAdapter` are not interchangeable.
  - Due to Prisma 6.6.0, the adapter requires `PrismaAdapter(prisma.$extends({}))`.

---

## Future Enhancements

Here are some additional ideas to enhance the project further:
- Assign agents to customers and implement agent roles.
- Improve the overall structure and maintainability of the codebase:
  - Revisit `routes.ts` and `middleware.ts` for better routing and naming conventions.
  - Optimize folder structure and component organization.
