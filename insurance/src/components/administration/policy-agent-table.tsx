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
import { toast } from 'sonner';
import { useRefreshContext } from './refresh-context';
import { Skeleton } from '@/components/ui/skeleton';

interface PolicyAgent {
  id: number;
  customerPolicyId: number;
  agentId: string;
  assignedAt: string;
  canRemove?: boolean; // Optional flag for supervisor role permissions
  customerPolicy: {
    id: number;
    policyHolderId: string;
    insurancePolicyId: string;
    policy: {
      id: number;
      insurancePolicyId: string;
      name: string;
      typeOfPolicy: string;
    };
    customer: {
      id: number;
      policyHolderId: string;
      firstName: string;
      lastName: string;
      email: string;
    };
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

export default function PolicyAgentTable() {
  const { policyAgentRefreshTrigger } = useRefreshContext();
  const [assignments, setAssignments] = useState<PolicyAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/administration/policy-agents');
      if (!response.ok) throw new Error('Failed to fetch policy-agent assignments');
      
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load policy-agent assignments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [policyAgentRefreshTrigger]); // Re-fetch when the refresh trigger changes

  const removeAssignment = async (assignmentId: number) => {
    try {
      const response = await fetch(`/api/administration/policy-agents?id=${assignmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove policy-agent assignment');
      
      toast.success('Policy-agent assignment removed successfully');
      fetchAssignments(); // Refresh the data
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast.error('Failed to remove policy-agent assignment');
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
                <TableHead>Policy</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-6 w-[160px] mb-1" />
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[140px] mb-1" />
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[150px] mb-1" />
                    <Skeleton className="h-4 w-[180px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[90px]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
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
              <TableHead>Policy</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Assigned Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No policy-agent assignments found.
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    {assignment.customerPolicy.customer.firstName} {assignment.customerPolicy.customer.lastName}
                    <div className="text-xs text-muted-foreground">
                      {assignment.customerPolicy.customer.policyHolderId}
                    </div>
                  </TableCell>
                  <TableCell>
                    {assignment.customerPolicy.policy.name}
                    <div className="text-xs text-muted-foreground">
                      {assignment.customerPolicy.policy.typeOfPolicy}
                    </div>
                  </TableCell>
                  <TableCell>
                    {assignment.agent.user.name || "Unnamed Agent"}
                    <div className="text-xs text-muted-foreground">
                      {assignment.agent.user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(assignment.assignedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
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
