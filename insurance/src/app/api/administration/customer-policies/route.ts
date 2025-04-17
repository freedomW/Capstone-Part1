import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin or supervisor
    const session = await auth();
    if (session?.user.role !== 'ADMIN' && session?.user.role !== 'SUPERVISOR') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    // Fetch all customer policies with their associated customer and policy info
    const customerPolicies = await prisma.customerPolicy.findMany({
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            policyHolderId: true,
          }
        },
        policy: {
          select: {
            id: true,
            insurancePolicyId: true,
            name: true,
            typeOfPolicy: true,
          }
        }
      },
    });

    return NextResponse.json(customerPolicies);
  } catch (error) {
    console.error('Error fetching customer policies:', error);
    return NextResponse.json({ error: 'Error fetching customer policies' }, { status: 500 });
  }
}
