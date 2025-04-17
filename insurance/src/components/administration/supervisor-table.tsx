'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRefreshContext } from './refresh-context';
import { MultiSelect } from '@/components/ui/multi-select';

interface User {
  id: string;
  name: string | null;
  email: string;
  Agent: {
    id: string;
    supervisedAgents: {
      id: string;
      user: {
        name: string | null;
        email: string;
      }
    }[];
  } | null;
}

interface Agent {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  supervisorId: string | null;
}

export default function SupervisorTable() {
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingAgents, setUpdatingAgents] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<Record<string, string[]>>({});
  const { refreshTrigger, triggerRefresh } = useRefreshContext();
  // Fetch supervisors and their assigned agents, plus all agents
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch supervisors
        const supervisorsResponse = await fetch('/api/administration/supervisors');
        const supervisorsData = await supervisorsResponse.json();
          // Fetch all agents
        const agentsResponse = await fetch('/api/administration/agents');
        
        if (supervisorsResponse.ok) {
          setSupervisors(supervisorsData.supervisors);
        } else {
          toast.error(supervisorsData.error || 'Failed to fetch supervisors');
        }
        
        if (agentsResponse.ok) {
          const agentsData = await agentsResponse.json();
          console.log('Agents data:', agentsData); // Debug the response
          // The API returns agents directly, not wrapped in an agents property
          setAllAgents(agentsData);
        } else {
          toast.error('Failed to fetch agents');
        }
      } catch (error) {
        toast.error('An error occurred while fetching data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);  // Update agent assignments for all supervisors
  const handleUpdateAllAssignments = async () => {
    try {
      setUpdatingAgents(true);
        // Create an array of promises for all supervisor updates
      const updatePromises = Object.entries(selectedAgents).map(([supervisorId, agentIds]) => {
        return fetch('/api/administration/supervisor-batch-assignment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            supervisorId,
            agentIds,
          }),
        });
      });
      
      // Execute all update requests
      const responses = await Promise.all(updatePromises);
      
      // Check if all were successful
      const hasErrors = responses.some(response => !response.ok);
      
      if (!hasErrors) {
        toast.success('All agent assignments updated successfully');
        triggerRefresh();
      } else {
        toast.error('Some assignments failed to update');
      }
    } catch (error) {
      toast.error('An error occurred while updating agent assignments');
      console.error(error);
    } finally {
      setUpdatingAgents(false);
    }
  };
    // Helper function to get current assigned agent IDs for a supervisor
  const getAssignedAgentIds = (supervisor: User) => {
    if (!supervisor.Agent?.supervisedAgents) return [];
    return supervisor.Agent.supervisedAgents.map(agent => agent.id);
  };

  // Initialize selected agents when supervisors data loads
  useEffect(() => {
    if (supervisors.length > 0) {
      const initialSelections: Record<string, string[]> = {};
      supervisors.forEach(supervisor => {
        if (supervisor.Agent) {
          initialSelections[supervisor.Agent.id] = getAssignedAgentIds(supervisor);
        }
      });
      setSelectedAgents(initialSelections);
    }
  }, [supervisors]);

  // Handle selection change without immediate update
  const handleSelectionChange = (supervisorId: string, agentIds: string[]) => {
    setSelectedAgents(prev => ({
      ...prev,
      [supervisorId]: agentIds
    }));
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (supervisors.length === 0) {
    return <div className="text-center py-4">No supervisors found</div>;
  }
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Supervisor</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Assigned Agents</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {supervisors.map((supervisor) => (
            <TableRow key={supervisor.id}>
              <TableCell className="font-medium">{supervisor.name}</TableCell>
              <TableCell>{supervisor.email}</TableCell>              <TableCell>                <div className="space-y-2">
                  <MultiSelect
                    placeholder="Search and select agents..."
                    options={allAgents?.map(agent => ({
                      label: `${agent.user.name || 'Unnamed'} (${agent.user.email})`,
                      value: agent.id,
                    })) || []}
                    defaultValue={selectedAgents[supervisor.Agent?.id || ''] || getAssignedAgentIds(supervisor)}
                    onValueChange={(selectedAgentIds) => 
                      handleSelectionChange(supervisor.Agent?.id || '', selectedAgentIds)
                    }
                    disabled={updatingAgents}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          Note: To manage supervisor roles or agent assignments, please use the User Management tab.
        </div>
        <Button 
          onClick={handleUpdateAllAssignments}
          disabled={updatingAgents}
          className="ml-auto"
        >
          {updatingAgents ? 'Updating All Assignments...' : 'Update All Agent Assignments'}
        </Button>
      </div>
    </div>
  );
}
