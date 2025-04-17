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

    // Get all supervisors (users with SUPERVISOR role)
    const supervisors = await prisma.user.findMany({
      where: {
        role: "SUPERVISOR",
      },
      select: {
        id: true,
        name: true,
        email: true,
        Agent: {
          select: {
            id: true,
            supervisedAgents: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true,
                    email: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    // Get all agents (for assignment purposes)
    const agents = await prisma.user.findMany({
      where: {
        role: "AGENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        Agent: {
          select: {
            id: true,
            supervisorId: true,
          }
        }
      }
    });

    return NextResponse.json({ supervisors, agents });
  } catch (error) {
    console.error("Error fetching supervisors:", error);
    return NextResponse.json({ error: "Failed to fetch supervisors" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action } = body;

    if (action === "promote") {
      // Promote a user to supervisor
      const updatedUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          role: "SUPERVISOR",
        },
      });

      revalidatePath("/administration");
      return NextResponse.json({ message: "User promoted to supervisor", user: updatedUser });
    } 
    else if (action === "demote") {
      // Check if supervisor has any agents assigned
      const supervisor = await prisma.agent.findUnique({
        where: {
          userId: userId,
        },
        include: {
          supervisedAgents: true,
        }
      });

      if (supervisor && supervisor.supervisedAgents.length > 0) {
        return NextResponse.json(
          { error: "Cannot demote supervisor with assigned agents. Please reassign agents first." }, 
          { status: 400 }
        );
      }

      // Demote a supervisor to agent
      const updatedUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          role: "AGENT",
        },
      });

      revalidatePath("/administration");
      return NextResponse.json({ message: "Supervisor demoted to agent", user: updatedUser });
    } 
    else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating supervisor:", error);
    return NextResponse.json({ error: "Failed to update supervisor" }, { status: 500 });
  }
}
