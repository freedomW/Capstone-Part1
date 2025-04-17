import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const url = new URL(request.url);
    const role = url.searchParams.get('role');

    if (!role) {
      return NextResponse.json({ error: "Role parameter is required" }, { status: 400 });
    }

    // Get all users with the specified role
    const users = await prisma.user.findMany({
      where: {
        role: role as any,
      },
      select: {
        id: true,
        name: true,
        email: true,
        Agent: {
          select: {
            id: true,
          }
        }
      }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
