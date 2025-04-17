import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { agentId, supervisorId } = body;

    if (!agentId) {
      return NextResponse.json({ error: "Agent ID is required" }, { status: 400 });
    }

    // Update the agent's supervisor
    const updatedAgent = await prisma.agent.update({
      where: {
        id: agentId,
      },
      data: {
        supervisorId: supervisorId || null, // If supervisorId is not provided, remove the assignment
      },
    });

    revalidatePath("/administration");
    return NextResponse.json({ 
      message: supervisorId 
        ? "Agent assigned to supervisor" 
        : "Agent removed from supervisor",
      agent: updatedAgent 
    });
  } catch (error) {
    console.error("Error assigning agent to supervisor:", error);
    return NextResponse.json({ error: "Failed to assign agent to supervisor" }, { status: 500 });
  }
}
