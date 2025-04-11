import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    let totalPolicyHolders = 0;
    let totalInsurancePolicies = 0;
    let totalAmount: any[] = [];
    let chartData: any[] = [];
    
    try {
        totalPolicyHolders = await prisma.policyHolder.count();
        totalInsurancePolicies = await prisma.insurancePolicy.count();
        totalAmount = await prisma.$queryRaw`
        select sum(ip."basePriceSgd")
        from "PolicyAssignment" pa
        join "Capstone1"."InsurancePolicy" ip
        on pa."insurancePolicyId" = ip."insurancePolicyId"
        `;
        chartData = await prisma.$queryRaw`
        select 
        ip."insurancePolicyId",
        ip."name",
        sum(ip."basePriceSgd")
        from "PolicyAssignment" pa
        join "Capstone1"."InsurancePolicy" ip
        on pa."insurancePolicyId" = ip."insurancePolicyId"
        group by
        ip."insurancePolicyId",ip."name"
        order by
        ip."insurancePolicyId" asc
        `;
    }
    catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    return NextResponse.json({
        totalPolicyHolders,
        totalInsurancePolicies,
        totalAmount: totalAmount[0].sum || 0,
        chartData: chartData.map((item) => ({
            insurancePolicyId: item.insurancePolicyId,
            name: item.name,
            sum: item.sum,
        })),
    });
}