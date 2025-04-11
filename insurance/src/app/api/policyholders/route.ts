import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const policyholders = await prisma.policyHolder.findMany({
      include: {
        policies: {
          include: {
            insurancePolicy: true,
          },
        },
      },
    });

    const formattedPolicyholders = policyholders.map((policyholder) => ({
      id: policyholder.id,
      policyholderId: policyholder.policyHolderId,
      firstName: policyholder.firstName,
      lastName: policyholder.lastName,
      email: policyholder.email,
      policiesHeld: policyholder.policies.map((assignment) => assignment.insurancePolicy.name),
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

    if (!policyHolderId || !firstName || !lastName || !email || !Array.isArray(policies)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const existingPolicyHolder = await prisma.policyHolder.findUnique({
      where: { policyHolderId },
    });

    if (existingPolicyHolder) {
      return NextResponse.json({ error: "Policy Holder ID already exists." }, { status: 400 });
    }

    const newPolicyHolder = await prisma.policyHolder.create({
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

    return NextResponse.json(newPolicyHolder);
  } catch (error) {
    console.error("Error adding policyholder:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}