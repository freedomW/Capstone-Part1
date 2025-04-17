import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    let policyholders;
    const userRole = session.user?.role;
    const userId = session.user?.id;
    
    // Filter customers based on user role
    if (userRole === 'ADMIN' || userRole === 'SUPERVISOR') {
      // Admins and supervisors can see all customers
      policyholders = await prisma.customer.findMany({
        include: {
          policies: {
            include: {
              policy: true,
            },
          },
        },
      });
    } else if (userRole === 'AGENT' && userId) {
      // Agents can only see their assigned customers
      // First, get the agent record for this user
      const agent = await prisma.agent.findUnique({
        where: { userId },
        select: { id: true }
      });
      
      if (!agent) {
        return NextResponse.json({ error: "Agent record not found" }, { status: 404 });
      }
      
      // Get all customers assigned to this agent
      policyholders = await prisma.customer.findMany({
        where: {
          customerAgentRelations: {
            some: {
              agentId: agent.id
            }
          }
        },
        include: {
          policies: {
            include: {
              policy: true,
            },
          },
        },
      });
    } else {
      // Regular users shouldn't access customers
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }
    const formattedPolicyholders = policyholders.map((policyholder) => ({
      id: policyholder.id,
      policyHolderId: policyholder.policyHolderId,
      firstName: policyholder.firstName,
      lastName: policyholder.lastName,
      email: policyholder.email,
      policiesHeld: policyholder.policies.map((assignment) => assignment.policy.name),
    }));

    return NextResponse.json(formattedPolicyholders);
  } catch (error) {
    console.error("Error fetching policyholders:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { policyHolderId, firstName, lastName, email, policies } = await request.json();
    const userRole = session.user?.role;
    const userId = session.user?.id;

    if (!policyHolderId || !firstName || !lastName || !email || !Array.isArray(policies)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }    const existingPolicyHolder = await prisma.customer.findUnique({
      where: { policyHolderId },
    });

    if (existingPolicyHolder) {
      return NextResponse.json({ error: "Policy Holder ID already exists." }, { status: 400 });
    }

    // Create the new policy holder first
    const newPolicyHolder = await prisma.customer.create({
      data: {
        policyHolderId,
        firstName,
        lastName,
        email,
        policies: {
          create: policies.map((policyId: string) => ({
            insurancePolicyId: policyId,
          })),
        },
      },
    });

    // If the creator is an agent, automatically assign them as the primary agent
    if (userRole === 'AGENT' && userId) {
      // Find the agent record for the current user
      const agent = await prisma.agent.findUnique({
        where: { userId },
      });
      
      if (agent) {
        // Create a new customer-agent relationship with isPrimary set to true
        const customerAgentRelation = await prisma.customerAgent.create({
          data: {
            customerId: newPolicyHolder.id,
            agentId: agent.id,
            isPrimary: true,
          },
        });
        
        // Update the customer to set this relation as the primary agent relation
        await prisma.customer.update({
          where: { id: newPolicyHolder.id },
          data: { primaryAgentRelationId: customerAgentRelation.id },
        });
      }
    }

    return NextResponse.json(newPolicyHolder);
  } catch (error) {
    console.error("Error adding policyholder:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}