'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRefreshContext } from './refresh-context';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomerAgent {
  id: number;
  customerId: number;
  agentId: string;
  isPrimary: boolean;
  assignedAt: string;
  canRemove?: boolean; // Optional flag for supervisor role permissions
  customer: {
    id: number;
    policyHolderId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  agent: {
    id: string;
    supervisorId?: string; // Added supervisorId field
    user: {
      name: string | null;
      email: string;
    };
  };
}

export default function AgentCustomerTable() {
  const { customerAgentRefreshTrigger } = useRefreshContext();
  const [assignments, setAssignments] = useState<CustomerAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/administration/customer-agents');
      if (!response.ok) throw new Error('Failed to fetch agent-customer assignments');
      
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load agent-customer assignments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [customerAgentRefreshTrigger]); // Re-fetch when the refresh trigger changes

  const setPrimaryAgent = async (assignmentId: number) => {
    try {
      const response = await fetch('/api/administration/customer-agents', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: assignmentId,
          isPrimary: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to update primary agent');
      
      toast.success('Primary agent updated successfully');
      fetchAssignments(); // Refresh the data
    } catch (error) {
      console.error('Error updating primary agent:', error);
      toast.error('Failed to update primary agent');
    }
  };

  const removeAssignment = async (assignmentId: number) => {
    try {
      const response = await fetch(`/api/administration/customer-agents?id=${assignmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove agent assignment');
      
      toast.success('Agent assignment removed successfully');
      fetchAssignments(); // Refresh the data
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast.error('Failed to remove agent assignment');
    }
  };
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-6 w-[180px] mb-1" />
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[150px] mb-1" />
                    <Skeleton className="h-4 w-[180px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[70px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[90px]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Skeleton className="h-8 w-[100px]" />
                      <Skeleton className="h-8 w-[80px]" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No agent-customer assignments found.
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    {assignment.customer.firstName} {assignment.customer.lastName}
                    <div className="text-xs text-muted-foreground">
                      {assignment.customer.policyHolderId}
                    </div>
                  </TableCell>
                  <TableCell>
                    {assignment.agent.user.name || "Unnamed Agent"}
                    <div className="text-xs text-muted-foreground">
                      {assignment.agent.user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    {assignment.isPrimary ? (
                      <Badge variant="default">Primary</Badge>
                    ) : (
                      <Badge variant="outline">Secondary</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(assignment.assignedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {!assignment.isPrimary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrimaryAgent(assignment.id)}
                      >
                        Make Primary
                      </Button>
                    )}
                    {/* Show Remove button only if admin or the supervisor has permission to remove */}
                    {(assignment.canRemove === undefined || assignment.canRemove) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeAssignment(assignment.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
