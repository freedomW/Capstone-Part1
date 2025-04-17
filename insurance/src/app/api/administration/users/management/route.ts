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

    // Get all users with their agent information if available
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        Agent: {
          select: {
            id: true,
            supervisorId: true,
            supervisor: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            },
            supervisedAgents: {
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
            }
          }
        }
      },
      orderBy: {
        role: 'asc'
      }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, newRole } = body;

    if (!userId || !newRole) {
      return NextResponse.json({ error: "User ID and new role are required" }, { status: 400 });
    }

    const validRoles = ["USER", "AGENT", "SUPERVISOR", "ADMIN"];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Get current user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        Agent: {
          include: {
            supervisedAgents: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Special handling for role changes that affect the Agent relationship
    if (user.role === "SUPERVISOR" && newRole !== "SUPERVISOR") {
      // If demoting a supervisor, remove all their agent assignments
      if (user.Agent && user.Agent.supervisedAgents.length > 0) {
        // Get all supervised agents
        const supervisedAgentIds = user.Agent.supervisedAgents.map(agent => agent.id);
        
        // Remove supervisor relationship from all agents
        await prisma.agent.updateMany({
          where: {
            id: {
              in: supervisedAgentIds
            }
          },
          data: {
            supervisorId: null
          }
        });
      }
    }

    // If changing from non-agent role to agent role, create Agent record
    if ((newRole === "AGENT" || newRole === "SUPERVISOR") && 
        user.role !== "AGENT" && user.role !== "SUPERVISOR" && !user.Agent) {
      await prisma.agent.create({
        data: {
          userId: userId
        }
      });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: newRole,
      },
    });

    revalidatePath("/administration");
    return NextResponse.json({ 
      message: `User role updated to ${newRole}`, 
      user: updatedUser 
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
  }
}
