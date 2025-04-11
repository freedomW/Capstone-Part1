import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import Image from "next/image";


export default function Home() {
  return (
    <DashboardShell>
    <main className="flex flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Insurance App</h1>
      <p className="mt-4 text-lg">Welcome to the Insurance App!</p>
      <Image
        src="/cat insurance.jpg"
        alt="Insurance Logo"
        width={200}
        height={200}
        className="rounded-md mt-8"
      />
    </main>
    </DashboardShell>
  );
}
