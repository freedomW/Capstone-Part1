# Full Project Overview

This project includes the integration of GitHub OAuth and utilizes the latest versions of Prisma and Next.js.

As of when code was written
"next": "15.2.4",
"tailwindcss": "^4",
"prisma": "^6.6.0",
"next-auth": "^5.0.0-beta.25"

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

  # Generate your NEXTAUTH_SECRET using one of these methods:
  ```bash
  # Method 1: Using Node.js
  node -e "console.log(crypto.randomBytes(32).toString('hex'))"
  
  # Method 2: Using Auth.js CLI
  npx auth secret
  
  # Method 3: Using OpenSSL
  openssl rand -base64 32
  ```

  ```

4. **Initialize database with Prisma**
  ```bash
  npx prisma migrate dev
  ```

5. **Create an admin account**
  ```bash
  npm run setup-admin
  ```
  Follow the interactive prompts in the terminal to create your admin account. You'll be asked to provide:
  - Name
  - Email address
  - Password (minimum 8 characters)

  The script will:
  - Check if an admin account already exists
  - Create a new admin account or optionally upgrade an existing user to admin role

6. **Start the development server**
  ```bash
  npm run dev
  ```

7. **Access the application**
  Open your browser and navigate to: `http://localhost:3000`

---

## User Role Hierarchy

The application implements a role-based access control system with the following user levels:

### 👤 Users
- Newly registered accounts with no system access
- Require approval to gain agent status

### 👨‍💼 Agents
- Verified users with basic system access
- **Permissions:**
  - View assigned customers
  - Create new customers (automatically assigned as Primary Agent)
  - Create new policies for customers

### 👨‍💻 Supervisors
- Users with elevated access and management capabilities
- **Permissions:**
  - Assign customers to agents under their supervision
  - Assign customer policies to agents under their supervision
  - Designate primary and secondary agents for customers
  - Manage agent-customer relationships

### 🔑 Administrators
- Users with complete system access
- **Permissions:**
  - Add or remove supervisors
  - Approve user role promotions (agent/supervisor/admin)
  - Assign agents to supervisors
  - Full access to all system functions

## Areas for Improvement

While working on this project, I identified several aspects to refine:

### User Management
I did not add any features to user manager due to overdoing.
But features I would have added
- Full User management for all field
- Add new Users
- Password reset via email
- Enable, disable user.

### Middleware and Routing
- Refactor `middleware.ts` for improved routing.
- Enhance route naming for better readability and maintainability.

---

## Learning Notes

### Prisma (Version 6.6.0+)
- Starting with Prisma 6.6.0, the `output` option must be used. 
  - Example: `output = "../src/generated/prisma/client"`
- The generated client file is located in the `src` directory for simplicity.

### Configuration Issues
- **Auth and Auth Config**:
  - Ensure `...authConfig` is correctly added to auth.ts
  - Roles need to be define in /types/next-auth.d.ts and instead of using auth.ts for callbacks, it should be done in auth.config.ts to be used in middleware.
- **PrismaClient and PrismaAdapter**:
  - Note that `PrismaClient` and `PrismaAdapter` are not interchangeable.
  - Due to Prisma 6.6.0, the adapter requires `PrismaAdapter(prisma.$extends({}))`.

---

## Future Enhancements
  - Removing credentials verification due to security risk
  - Replacing with email verification

## Note to instructors
  - I did use co-pilot chat to generate codes out of laziness but I gone through every code that was generated to understand them.
  - Had to use it when the code was too new that I could not find instruction on implementing the latest version of authjs. Took me 1 full day even with co-pilot chat to find the issue of requiring ...authconfig in auth.ts for it to work.
  - I Started using Co-pilot heavily once I started implementing RBAC which was not required but I wanted to challenge myself to understand more. At this point I was using it to do fillers and instructed it to do front end with partial logic. And asking it to document the changes made.
  - Also ask it to beautify the instructions above.