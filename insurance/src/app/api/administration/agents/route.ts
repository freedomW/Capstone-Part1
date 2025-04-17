import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin or supervisor
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERVISOR') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;
    
    // Get agents based on the user's role
    let agents;
    
    if (userRole === 'ADMIN') {
      // Admins can see all agents
      agents = await prisma.agent.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } else if (userRole === 'SUPERVISOR') {
      // First, get the current supervisor's agent record
      const supervisorAgent = await prisma.agent.findUnique({
        where: { userId },
      });
      
      if (!supervisorAgent) {
        return NextResponse.json({ error: 'Supervisor record not found' }, { status: 404 });
      }
      
      // Get agents supervised by this supervisor AND include the supervisor's own record
      agents = await prisma.agent.findMany({
        where: {
          OR: [
            { supervisorId: supervisorAgent.id }, // Agents supervised by this supervisor
            { id: supervisorAgent.id }           // Include the supervisor's own record
          ]
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }

    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: 'Error fetching agents' }, { status: 500 });
  }
}
