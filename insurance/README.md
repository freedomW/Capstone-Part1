# Full Project
Including the use of Github OAuth
Using the Latest prisma, next.js
# Database seed
I did not use database seed as it was too clunky so just did it in SQL script
# Things to improve on.
Naming convention
As I was working on the project, I keep learning new things and different conventions of naming.
Was trying API and server actions so got into too many trials and error
Component should be place into better naming folders
Break down more reused code into components like signin for Github.
Redoing the routes.ts for better naming conventions
Redoing the tables to remove unnessary stuff. (Copy pasted and modified from Authjs)
Rename the tables for better conventions used like Insurance Policies to Policies
PolicyHolder to Customer
PolicyAssignment to CustomerPolicies
doing so I would have started adding empolyee
to simulate agents
Assign roles to agent and tie agent to User + Account
Re-do the middleware.ts to route better
Better naming for route.ts
# New things to take note
prisma 6.6.0 and above will require you to use Output
I was too lazy to figure out if it can be done on lower level so I kept it in src
output = "../src/generated/prisma/client"
auth and auth.config are tied together by ...authConfig not ..authConfig or .authConfig (took me a long while trying to solve this)
PrismaClient and PrismaAdapter are not using the same thing.
Due to 6.6.0, I need to use adapter: PrismaAdapter(prisma.$extends({}))






