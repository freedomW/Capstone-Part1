# Full Project Overview

This project includes the integration of GitHub OAuth and utilizes the latest versions of Prisma and Next.js.

---

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
