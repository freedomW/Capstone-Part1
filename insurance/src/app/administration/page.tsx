'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { RefreshProvider } from '@/components/administration/refresh-context';

// Dynamically import components with SSR disabled
const AgentCustomerAssignmentForm = dynamic(
  () => import('@/components/administration/agent-customer-assignment'),
  { ssr: false }
);

const PolicyAgentAssignmentForm = dynamic(
  () => import('@/components/administration/policy-agent-assignment'),
  { ssr: false }
);

const AgentCustomerTable = dynamic(
  () => import('@/components/administration/agent-customer-table'),
  { ssr: false }
);

const PolicyAgentTable = dynamic(
  () => import('@/components/administration/policy-agent-table'),
  { ssr: false }
);

const SupervisorTable = dynamic(
  () => import('@/components/administration/supervisor-table'),
  { ssr: false }
);

const UserManagement = dynamic(
  () => import('@/components/administration/user-management'),
  { ssr: false }
);

export default function AdministrationPage() {
  const [activeTab, setActiveTab] = useState('agent-assignments');
  // Add useSession to get the user's role
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  // If user tries to access a restricted tab but is not an admin, reset to agent-assignments
  useEffect(() => {
    if (!isAdmin && (activeTab === 'supervisors' || activeTab === 'user-management')) {
      setActiveTab('agent-assignments');
    }
  }, [activeTab, isAdmin]);

  return (
    <DashboardShell>
      <div className="flex items-center justify-between space-y-2 pb-2">
        <h2 className="text-3xl font-bold tracking-tight">Administration</h2>
      </div>
      <RefreshProvider>
        <Tabs defaultValue="agent-assignments" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>        <TabsList>
          <TabsTrigger value="agent-assignments">Agent Assignments</TabsTrigger>
          {/* Only show supervisors and user management tabs for admins */}
          {isAdmin && <TabsTrigger value="supervisors">Supervisors</TabsTrigger>}
          {isAdmin && <TabsTrigger value="user-management">User Management</TabsTrigger>}
        </TabsList>
          <TabsContent value="agent-assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assign Agents to Customers</CardTitle>
              <CardDescription>
                Manage which agents are assigned to customers and their policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Customer-Agent Assignment</h3>
                  <p className="text-sm text-muted-foreground">
                    Assign agents to customers and set primary agents for overall customer management
                  </p>                  <div className="pt-2">
                    <AgentCustomerAssignmentForm />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Policy-Specific Agent Assignment</h3>
                  <p className="text-sm text-muted-foreground">
                    Assign agents to handle specific insurance policies for customers
                  </p>
                  <div className="pt-2">
                    <PolicyAgentAssignmentForm />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Agent-Customer Assignments</CardTitle>
              <CardDescription>
                View and manage existing agent-customer relationships
              </CardDescription>
            </CardHeader>            <CardContent>
              <AgentCustomerTable />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Current Policy-Agent Assignments</CardTitle>
              <CardDescription>
                View and manage existing policy-agent assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PolicyAgentTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="supervisors" className="space-y-4">        
          <Card>
            <CardHeader>
              <CardTitle>Supervisors Overview</CardTitle>
              <CardDescription>
                View and manage supervisors and their assigned agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SupervisorTable />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="user-management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user roles and permissions across the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pt-2">
                <UserManagement />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </RefreshProvider>
    </DashboardShell>
  );
}
