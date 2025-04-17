-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'AGENT', 'SUPERVISOR', 'ADMIN');

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "policyHolderId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "primaryAgentRelationId" INTEGER,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" SERIAL NOT NULL,
    "insurancePolicyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "basePriceSgd" DECIMAL(65,30) NOT NULL,
    "typeOfPolicy" TEXT NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPolicy" (
    "id" SERIAL NOT NULL,
    "policyHolderId" TEXT NOT NULL,
    "insurancePolicyId" TEXT NOT NULL,

    CONSTRAINT "CustomerPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "Authenticator" (
    "credentialID" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "credentialPublicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,
    "transports" TEXT,

    CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("userId","credentialID")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "supervisorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerAgent" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "agentId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPolicyAgent" (
    "id" SERIAL NOT NULL,
    "customerPolicyId" INTEGER NOT NULL,
    "agentId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerPolicyAgent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_policyHolderId_key" ON "Customer"("policyHolderId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_primaryAgentRelationId_key" ON "Customer"("primaryAgentRelationId");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_insurancePolicyId_key" ON "Policy"("insurancePolicyId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPolicy_policyHolderId_insurancePolicyId_key" ON "CustomerPolicy"("policyHolderId", "insurancePolicyId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Authenticator_credentialID_key" ON "Authenticator"("credentialID");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_userId_key" ON "Agent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerAgent_customerId_agentId_key" ON "CustomerAgent"("customerId", "agentId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPolicyAgent_customerPolicyId_agentId_key" ON "CustomerPolicyAgent"("customerPolicyId", "agentId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_primaryAgentRelationId_fkey" FOREIGN KEY ("primaryAgentRelationId") REFERENCES "CustomerAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPolicy" ADD CONSTRAINT "CustomerPolicy_insurancePolicyId_fkey" FOREIGN KEY ("insurancePolicyId") REFERENCES "Policy"("insurancePolicyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPolicy" ADD CONSTRAINT "CustomerPolicy_policyHolderId_fkey" FOREIGN KEY ("policyHolderId") REFERENCES "Customer"("policyHolderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authenticator" ADD CONSTRAINT "Authenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAgent" ADD CONSTRAINT "CustomerAgent_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAgent" ADD CONSTRAINT "CustomerAgent_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPolicyAgent" ADD CONSTRAINT "CustomerPolicyAgent_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPolicyAgent" ADD CONSTRAINT "CustomerPolicyAgent_customerPolicyId_fkey" FOREIGN KEY ("customerPolicyId") REFERENCES "CustomerPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert data into Customer table
INSERT INTO "Customer"  ("policyHolderId", email, "firstName", "lastName")
VALUES
('PH001', 'john.doe@example.com', 'John', 'Doe'),
('PH002', 'jane.smith@example.com', 'Jane', 'Smith'),
('PH003', 'mike.lee@example.com', 'Mike', 'Lee'),
('PH004', 'alice.wong@example.com', 'Alice', 'Wong'),
('PH005', 'emily.chan@example.com', 'Emily', 'Chan'),
('PH006', 'robert.oh@example.com', 'Robert', 'Oh'),
('PH007', 'lily.tan@example.com', 'Lily', 'Tan'),
('PH008', 'simon.koh@example.com', 'Simon', 'Koh');

-- Insert data into Policy table
INSERT INTO "Policy" ("insurancePolicyId", name, "basePriceSgd", "typeOfPolicy")
VALUES
('IP001', 'Basic Health Coverage', 500.00, 'Health Insurance'),
('IP002', 'Travel Insurance', 300.00, 'Travel Insurance'),
('IP003', 'Comprehensive Life Plan', 1200.00, 'Life Insurance'),
('IP004', 'Critical Illness Cover', 700.00, 'Critical Illness'),
('IP005', 'Car Insurance', 800.00, 'Car Insurance'),
('IP006', 'Home Insurance', 600.00, 'Home Insurance'),
('IP007', 'Family Health Package', 1500.00, 'Health Insurance'),
('IP008', 'Personal Accident Cover', 350.00, 'Personal Accident'),
('IP009', 'Overseas Medical Insurance', 400.00, 'Travel Insurance'),
('IP010', 'Business Insurance Package', 2000.00, 'Business Insurance');

INSERT INTO "CustomerPolicy" ("policyHolderId", "insurancePolicyId")
VALUES
('PH001', 'IP001'),
('PH001', 'IP002'),
('PH002', 'IP003'),
('PH002', 'IP004'),
('PH003', 'IP005'),
('PH004', 'IP006'),
('PH005', 'IP007'),
('PH005', 'IP002'),
('PH006', 'IP008'),
('PH006', 'IP002'),
('PH007', 'IP009'),
('PH008', 'IP010');
