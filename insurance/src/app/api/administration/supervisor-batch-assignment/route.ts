import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all supervisors (for selection)
    const supervisors = await prisma.agent.findMany({
      where: {
        user: {
          role: "SUPERVISOR"
        }
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Get all agents (for assignment)
    const agents = await prisma.agent.findMany({
      where: {
        user: {
          role: "AGENT"
        }
      },
      select: {
        id: true,
        supervisorId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ supervisors, agents });
  } catch (error) {
    console.error("Error fetching supervisors and agents:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { supervisorId, agentIds } = body;

    if (!supervisorId) {
      return NextResponse.json({ error: "Supervisor ID is required" }, { status: 400 });
    }

    if (!Array.isArray(agentIds)) {
      return NextResponse.json({ error: "Agent IDs must be an array" }, { status: 400 });
    }

    // Verify supervisor exists and is a supervisor
    const supervisor = await prisma.agent.findFirst({
      where: {
        id: supervisorId,
        user: {
          role: "SUPERVISOR"
        }
      }
    });

    if (!supervisor) {
      return NextResponse.json({ error: "Supervisor not found or user is not a supervisor" }, { status: 404 });
    }

    // Find all agents currently assigned to this supervisor
    const currentlyAssignedAgents = await prisma.agent.findMany({
      where: {
        supervisorId: supervisorId
      },
      select: {
        id: true
      }
    });
    
    const currentlyAssignedAgentIds = currentlyAssignedAgents.map(agent => agent.id);
    
    // Agents to add (in agentIds but not in currentlyAssignedAgentIds)
    const agentsToAdd = agentIds.filter(id => !currentlyAssignedAgentIds.includes(id));
    
    // Agents to remove (in currentlyAssignedAgentIds but not in agentIds)
    const agentsToRemove = currentlyAssignedAgentIds.filter(id => !agentIds.includes(id));

    // Update agents with new supervisor
    if (agentsToAdd.length > 0) {
      await prisma.agent.updateMany({
        where: {
          id: {
            in: agentsToAdd
          },
          user: {
            role: "AGENT"
          }
        },
        data: {
          supervisorId: supervisorId
        }
      });
    }
    
    // Remove supervisor from agents no longer in the list
    if (agentsToRemove.length > 0) {
      await prisma.agent.updateMany({
        where: {
          id: {
            in: agentsToRemove
          }
        },
        data: {
          supervisorId: null
        }
      });
    }

    revalidatePath("/administration");
    return NextResponse.json({ 
      message: "Agent assignments updated successfully", 
      added: agentsToAdd.length,
      removed: agentsToRemove.length
    });
  } catch (error) {
    console.error("Error updating agent assignments:", error);
    return NextResponse.json({ error: "Failed to update agent assignments" }, { status: 500 });
  }
}
