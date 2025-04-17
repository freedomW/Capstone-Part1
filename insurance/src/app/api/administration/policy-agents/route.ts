import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

// GET: Retrieve all policy-agent assignments
export async function GET() {
    const session = await auth();
    
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Only allow admin and supervisor roles to view all assignments
    if (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPERVISOR') {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }
      try {
        const policyAgents = await prisma.customerPolicyAgent.findMany({
            include: {
                customerPolicy: {
                    include: {
                        policy: true,
                        customer: {
                            select: {
                                id: true,
                                policyHolderId: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            }
                        }
                    }
                },
                agent: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            }
                        },
                        supervisor: {
                            select: {
                                id: true,
                            }
                        }
                    }
                }
            }
        });
        
        // For supervisors, add a flag to determine if they can remove this assignment
        if (session.user?.role === 'SUPERVISOR') {
            // Find the supervisor's agent record
            const supervisorAgent = await prisma.agent.findUnique({
                where: { userId: session.user.id },
                select: { id: true }
            });
            
            if (!supervisorAgent) {
                return NextResponse.json({ error: "Supervisor agent record not found" }, { status: 404 });
            }
            
            // Add canRemove flag to each assignment
            const policyAgentsWithPermissions = policyAgents.map(assignment => {
                // Supervisor can remove if the agent is under their supervision
                // OR if the agent is the supervisor themselves
                const canRemove = 
                    assignment.agent.supervisorId === supervisorAgent.id || 
                    assignment.agentId === supervisorAgent.id;
                
                return {
                    ...assignment,
                    canRemove
                };
            });
            
            return NextResponse.json(policyAgentsWithPermissions);
        }
        
        return NextResponse.json(policyAgents);
    } catch (error) {
        console.error("Error fetching policy-agent assignments:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Create a new policy-agent assignment
export async function POST(request: Request) {
    const session = await auth();
    
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Only allow admin and supervisor roles to create assignments
    if (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPERVISOR') {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }
    
    try {
        const body = await request.json();
        const { customerPolicyId, agentId } = body;
        
        if (!customerPolicyId || !agentId) {
            return NextResponse.json({ error: "Customer Policy ID and Agent ID are required" }, { status: 400 });
        }
        
        // Check if the customer policy and agent exist
        const customerPolicyExists = await prisma.customerPolicy.findUnique({
            where: { id: customerPolicyId }
        });
        
        const agentExists = await prisma.agent.findUnique({
            where: { id: agentId }
        });
        
        if (!customerPolicyExists) {
            return NextResponse.json({ error: "Customer Policy not found" }, { status: 404 });
        }
        
        if (!agentExists) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }
        
        // Check if the assignment already exists
        const existingAssignment = await prisma.customerPolicyAgent.findFirst({
            where: {
                customerPolicyId,
                agentId
            }
        });
        
        if (existingAssignment) {
            return NextResponse.json({ error: "This agent is already assigned to this policy" }, { status: 409 });
        }
        
        // Create the new assignment
        const newAssignment = await prisma.customerPolicyAgent.create({
            data: {
                customerPolicyId,
                agentId
            },
            include: {
                agent: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                customerPolicy: {
                    include: {
                        policy: true,
                        customer: true
                    }
                }
            }
        });
          // Check if there's a customer-agent relationship, create one if it doesn't exist
        // Also handle primary/secondary logic based on requirements
        const customerPolicy = await prisma.customerPolicy.findUnique({
            where: { id: customerPolicyId },
            select: { 
                customer: true 
            }
        });
        
        if (customerPolicy) {
            const customerId = customerPolicy.customer.id;
            
            // Check if this agent is already assigned to this customer
            const customerAgentExists = await prisma.customerAgent.findFirst({
                where: {
                    customerId,
                    agentId
                }
            });
            
            // If not, create a new customer-agent relationship
            if (!customerAgentExists) {
                // Check if the customer already has any agents, particularly a primary one
                const existingAgents = await prisma.customerAgent.findMany({
                    where: {
                        customerId
                    }
                });
                
                // Determine if this should be the primary agent
                const hasPrimaryAgent = existingAgents.some(agent => agent.isPrimary);
                const isPrimary = !hasPrimaryAgent; // Make this the primary agent if no primary exists
                
                // Create the customer-agent relationship
                const newCustomerAgent = await prisma.customerAgent.create({
                    data: {
                        customerId,
                        agentId,
                        isPrimary
                    }
                });
                
                // If this is the primary agent, update the customer record
                if (isPrimary) {
                    await prisma.customer.update({
                        where: { id: customerId },
                        data: { primaryAgentRelationId: newCustomerAgent.id }
                    });
                }
            }
        }
        
        return NextResponse.json(newAssignment, { status: 201 });
    } catch (error) {
        console.error("Error creating policy-agent assignment:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE: Remove a policy-agent assignment
export async function DELETE(request: Request) {
    const session = await auth();
    
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Only allow admin and supervisor roles to delete assignments
    if (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPERVISOR') {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }
    
    try {
        // Get the ID from the URL
        const url = new URL(request.url);
        const id = Number(url.searchParams.get("id"));
        
        if (!id) {
            return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
        }
          // Check if the assignment exists and include agent details for permission checks
        const assignment = await prisma.customerPolicyAgent.findUnique({
            where: { id },
            include: {
                agent: true
            }
        });
        
        if (!assignment) {
            return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
        }
        
        // If supervisor, verify they can only delete assignments for agents under their supervision
        // OR their own assignments
        if (session.user?.role === 'SUPERVISOR') {
            // Get the supervisor's agent record
            const supervisorAgent = await prisma.agent.findUnique({
                where: { userId: session.user.id },
                select: { id: true }
            });
            
            if (!supervisorAgent) {
                return NextResponse.json({ error: "Supervisor agent record not found" }, { status: 404 });
            }
            
            // Check if the agent in this assignment is supervised by this supervisor
            // OR if the agent is the supervisor themselves
            if (assignment.agent.supervisorId !== supervisorAgent.id && 
                assignment.agentId !== supervisorAgent.id) {
                return NextResponse.json({ 
                    error: "You can only delete assignments for yourself or agents under your supervision" 
                }, { status: 403 });
            }
        }
        
        // Delete the assignment
        await prisma.customerPolicyAgent.delete({
            where: { id }
        });
        
        return NextResponse.json({ message: "Policy agent assignment deleted successfully" });
    } catch (error) {
        console.error("Error deleting policy-agent assignment:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
