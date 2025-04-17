'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRefreshContext } from './refresh-context';

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "AGENT" | "SUPERVISOR" | "ADMIN";
  Agent: {
    id: string;
    supervisorId: string | null;
    supervisor: {
      id: string;
      user: {
        name: string | null;
        email: string;
      }
    } | null;
    supervisedAgents: {
      id: string;
      user: {
        id: string;
        name: string | null;
        email: string;
      }
    }[];
  } | null;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const { refreshTrigger, triggerRefresh } = useRefreshContext();

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/administration/users/management');
        const data = await response.json();
        
        if (response.ok) {
          setUsers(data.users);
        } else {
          toast.error(data.error || 'Failed to fetch users');
        }
      } catch (error) {
        toast.error('An error occurred while fetching users');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [refreshTrigger]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/administration/users/management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          newRole
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(`User role updated to ${newRole}`);
        triggerRefresh();
      } else {
        toast.error(data.error || 'Failed to update user role');
      }
    } catch (error) {
      toast.error('An error occurred while updating user role');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'SUPERVISOR':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'AGENT':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  if (loading && users.length === 0) {
    return <div className="text-center py-4">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Supervisor/Agents</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className={loading ? 'opacity-50' : ''}>
              <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge className={getRoleBadgeStyle(user.role)}>
                  {user.role}
                </Badge>
              </TableCell>              <TableCell>
                {user.role === 'AGENT' && user.Agent?.supervisor && (
                  <div className="text-xs">
                    {user.Agent.supervisor.user.name}
                  </div>
                )}
                
                {user.role === 'SUPERVISOR' && user.Agent?.supervisedAgents && (
                  <div className="text-xs">
                    <span className="font-semibold">Agents:</span> {user.Agent.supervisedAgents.length}
                    {user.Agent.supervisedAgents.length > 0 && (
                      <ul className="list-disc pl-4 mt-1">
                        {user.Agent.supervisedAgents.slice(0, 3).map(agent => (
                          <li key={agent.id}>{agent.user.name || 'Unnamed'}</li>
                        ))}
                        {user.Agent.supervisedAgents.length > 3 && (
                          <li>+{user.Agent.supervisedAgents.length - 3} more</li>
                        )}
                      </ul>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Select
                  disabled={loading || user.role === 'ADMIN'}
                  value={user.role}
                  onValueChange={(value) => handleRoleChange(user.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">USER</SelectItem>
                    <SelectItem value="AGENT">AGENT</SelectItem>
                    <SelectItem value="SUPERVISOR">SUPERVISOR</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
                {user.role === 'SUPERVISOR' && user.Agent?.supervisedAgents && user.Agent.supervisedAgents.length > 0 && (
                  <div className="text-xs text-amber-600 mt-2">
                    Warning: Demoting will unassign {user.Agent.supervisedAgents.length} agents
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
