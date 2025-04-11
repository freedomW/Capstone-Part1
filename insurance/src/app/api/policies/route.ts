import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const policies = await prisma.insurancePolicy.findMany();

    return NextResponse.json(policies);
  } catch (error) {
    console.error("Error fetching policies:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { insurancePolicyId, name, basePriceSgd, typeOfPolicy } = await request.json();

  const exisitingPolicy = await prisma.insurancePolicy.findUnique({
    where: { insurancePolicyId },
  });
  if (exisitingPolicy) {
    return NextResponse.json({ error: "Insurance Policy ID already exists." }, { status: 400 });
  }

  try {
    const newPolicy = await prisma.insurancePolicy.create({
      data: {
        insurancePolicyId,
        name,
        basePriceSgd,
        typeOfPolicy,
      },
    });

    return NextResponse.json(newPolicy, { status: 201 });
  } catch (error: any) {
    console.error("Error creating policy:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
