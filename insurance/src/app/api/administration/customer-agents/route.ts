import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

// GET: Retrieve customer-agent assignments
export async function GET() {
    const session = await auth();
    
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Only allow admin and supervisor roles to view assignments
    if (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPERVISOR') {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }
      try {
        let customerAgents;
        
        if (session.user?.role === 'ADMIN' || session.user?.role === 'SUPERVISOR') {
            // Both admins and supervisors can see all customer-agent assignments
            // for view-only purposes
            customerAgents = await prisma.customerAgent.findMany({
                include: {
                    customer: {
                        select: {
                            id: true,
                            policyHolderId: true,
                            firstName: true,
                            lastName: true,
                            email: true,
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
                customerAgents = customerAgents.map(assignment => {
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
            }
        }
        return NextResponse.json(customerAgents);
    } catch (error) {
        console.error("Error fetching customer-agent assignments:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Create a new customer-agent assignment
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
        const { customerId, agentId, isPrimary = false } = body;
        
        // If supervisor, verify they can only assign agents under their supervision
        if (session.user?.role === 'SUPERVISOR') {
            // Get the supervisor's agent record
            const supervisorAgent = await prisma.agent.findUnique({
                where: { userId: session.user.id },
                select: { id: true }
            });
            
            if (!supervisorAgent) {
                return NextResponse.json({ error: "Supervisor agent record not found" }, { status: 404 });
            }
            
            // Check if the agent is supervised by this supervisor
            const agent = await prisma.agent.findUnique({
                where: { id: agentId },
                select: { supervisorId: true }
            });
            
            if (!agent || agent.supervisorId !== supervisorAgent.id) {
                return NextResponse.json({ 
                    error: "You can only assign agents that are under your supervision" 
                }, { status: 403 });
            }
        }
        
        if (!customerId || !agentId) {
            return NextResponse.json({ error: "Customer ID and Agent ID are required" }, { status: 400 });
        }
        
        // Check if the customer and agent exist
        const customerExists = await prisma.customer.findUnique({
            where: { id: customerId }
        });
        
        const agentExists = await prisma.agent.findUnique({
            where: { id: agentId }
        });
        
        if (!customerExists) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }
        
        if (!agentExists) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }
        
        // Check if the assignment already exists
        const existingAssignment = await prisma.customerAgent.findFirst({
            where: {
                customerId,
                agentId
            }
        });
        
        if (existingAssignment) {
            return NextResponse.json({ error: "This agent is already assigned to this customer" }, { status: 409 });
        }
        
        // Handle primary agent logic - if this is set to primary, un-set any existing primary agents
        if (isPrimary) {
            await prisma.customerAgent.updateMany({
                where: {
                    customerId,
                    isPrimary: true
                },
                data: {
                    isPrimary: false
                }
            });
        }
        
        // Create the new assignment
        const newAssignment = await prisma.customerAgent.create({
            data: {
                customerId,
                agentId,
                isPrimary
            }
        });
        
        // If this is a primary agent, update the customer record
        if (isPrimary) {
            await prisma.customer.update({
                where: { id: customerId },
                data: { primaryAgentRelationId: newAssignment.id }
            });
        }
        
        return NextResponse.json(newAssignment, { status: 201 });
    } catch (error) {
        console.error("Error creating customer-agent assignment:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PUT: Update an existing customer-agent assignment
export async function PUT(request: Request) {
    const session = await auth();
    
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Only allow admin and supervisor roles to update assignments
    if (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPERVISOR') {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }
    
    try {
        const body = await request.json();
        const { id, isPrimary } = body;
        
        if (!id) {
            return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
        }
        
        // Get the assignment to update
        const existingAssignment = await prisma.customerAgent.findUnique({
            where: { id },
            include: {
                agent: true
            }
        });
        
        if (!existingAssignment) {
            return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
        }
        
        // If supervisor, verify they can only update assignments for agents under their supervision
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
            if (existingAssignment.agent.supervisorId !== supervisorAgent.id) {
                return NextResponse.json({ 
                    error: "You can only update assignments for agents under your supervision" 
                }, { status: 403 });
            }
        }
        
        if (!existingAssignment) {
            return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
        }
        
        // Handle primary agent logic - if this is set to primary, un-set any existing primary agents
        if (isPrimary) {
            await prisma.customerAgent.updateMany({
                where: {
                    customerId: existingAssignment.customerId,
                    isPrimary: true,
                    id: { not: id }
                },
                data: {
                    isPrimary: false
                }
            });
            
            // Update the customer record to point to this assignment as primary
            await prisma.customer.update({
                where: { id: existingAssignment.customerId },
                data: { primaryAgentRelationId: existingAssignment.id }
            });
        }
        
        // Update the assignment
        const updatedAssignment = await prisma.customerAgent.update({
            where: { id },
            data: { isPrimary }
        });
        
        return NextResponse.json(updatedAssignment);
    } catch (error) {
        console.error("Error updating customer-agent assignment:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE: Remove a customer-agent assignment
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
        
        // Check if the assignment exists and get the customer ID
        const assignment = await prisma.customerAgent.findUnique({
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
        
        // If this is a primary agent, make sure to update the customer's primaryAgentRelationId
        if (assignment.isPrimary) {
            await prisma.customer.update({
                where: { id: assignment.customerId },
                data: { primaryAgentRelationId: null }
            });
        }
        
        // Delete the assignment
        await prisma.customerAgent.delete({
            where: { id }
        });
        
        return NextResponse.json({ message: "Assignment deleted successfully" });
    } catch (error) {
        console.error("Error deleting customer-agent assignment:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
