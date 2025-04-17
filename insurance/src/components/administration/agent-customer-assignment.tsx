'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRefreshContext } from './refresh-context';
import { Skeleton } from '@/components/ui/skeleton';

interface Customer {
  id: number;
  policyHolderId: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface Agent {
  id: string;
  user: User;
}

export default function AgentCustomerAssignmentForm() {
  const { triggerCustomerAgentRefresh } = useRefreshContext();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isPrimary, setIsPrimary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true); // State for initial data loading
  const [searchQuery, setSearchQuery] = useState('');
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const [agentSearchQuery, setAgentSearchQuery] = useState('');

  // Fetch customers and agents on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsDataLoading(true);
      try {
        // Fetch customers
        const customersResponse = await fetch('/api/policyholders');
        if (!customersResponse.ok) throw new Error('Failed to fetch customers');
        const customersData = await customersResponse.json();
        setCustomers(customersData);

        // Fetch agents
        const agentsResponse = await fetch('/api/administration/agents');
        if (!agentsResponse.ok) throw new Error('Failed to fetch agents');
        const agentsData = await agentsResponse.json();
        setAgents(agentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!selectedCustomerId || !selectedAgentId) {
      toast.error('Please select both a customer and an agent');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/administration/customer-agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          agentId: selectedAgentId,
          isPrimary,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign agent');
      }      const result = await response.json();
      
      toast.success('Agent assigned to customer successfully');
      
      // Trigger refresh of the customer-agent table
      triggerCustomerAgentRefresh();
      
      // Reset form
      setSelectedCustomerId(null);
      setSelectedAgentId(null);
      setIsPrimary(false);
    } catch (error: any) {
      console.error('Error assigning agent:', error);
      toast.error(error.message || 'Failed to assign agent');
    } finally {
      setIsLoading(false);
    }
  };
  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const firstName = (customer.firstName || '').toLowerCase();
    const lastName = (customer.lastName || '').toLowerCase();
    const fullName = `${firstName} ${lastName}`;
    const email = (customer.email || '').toLowerCase();
    const policyId = (customer.policyHolderId || '').toLowerCase();
    
    return fullName.includes(searchLower) || 
           firstName.includes(searchLower) ||
           lastName.includes(searchLower) ||
           email.includes(searchLower) || 
           policyId.includes(searchLower);
  });
  // Filter agents based on search query
  const filteredAgents = agents.filter(agent => {
    if (!agentSearchQuery) return true;
    
    const searchLower = agentSearchQuery.toLowerCase();
    const name = (agent.user.name || '').toLowerCase();
    const email = agent.user.email.toLowerCase();
    
    return name.includes(searchLower) || email.includes(searchLower);
  });

  // Get selected customer details for display
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  
  // Get selected agent details for display
  const selectedAgent = agents.find(a => a.id === selectedAgentId);
  // If data is still loading, show skeleton UI
  if (isDataLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24 mb-2" /> {/* Label skeleton */}
            <Skeleton className="h-10 w-full" /> {/* Select button skeleton */}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24 mb-2" /> {/* Label skeleton */}
            <Skeleton className="h-10 w-full" /> {/* Select button skeleton */}
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-4">
          <Skeleton className="h-5 w-5" /> {/* Checkbox skeleton */}
          <Skeleton className="h-5 w-32" /> {/* Label skeleton */}
        </div>
        <Skeleton className="h-10 w-full" /> {/* Button skeleton */}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customer">Select Customer</Label>
          <Popover open={customerDropdownOpen} onOpenChange={setCustomerDropdownOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={customerDropdownOpen}
                className="w-full justify-between"
                disabled={isLoading}
              >
                {selectedCustomer ? 
                  `${selectedCustomer.firstName} ${selectedCustomer.lastName} - ${selectedCustomer.policyHolderId}` : 
                  "Select a customer"}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">              <Command shouldFilter={false}>
                <CommandInput 
                  placeholder="Search customers..." 
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandEmpty>No customer found.</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {filteredCustomers.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      value={customer.id.toString()}
                      onSelect={(value) => {
                        setSelectedCustomerId(Number(value));
                        setCustomerDropdownOpen(false);
                      }}
                      className="flex justify-between"
                    >
                      <div>
                        {customer.firstName} {customer.lastName}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {customer.policyHolderId} | {customer.email}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="agent">Select Agent</Label>
          <Popover open={agentDropdownOpen} onOpenChange={setAgentDropdownOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={agentDropdownOpen}
                className="w-full justify-between"
                disabled={isLoading}
              >
                {selectedAgent ? 
                  selectedAgent.user.name || selectedAgent.user.email : 
                  "Select an agent"}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">              <Command shouldFilter={false}>
                <CommandInput 
                  placeholder="Search agents..." 
                  value={agentSearchQuery}
                  onValueChange={setAgentSearchQuery}
                />
                <CommandEmpty>No agent found.</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {filteredAgents.map((agent) => (
                    <CommandItem
                      key={agent.id}
                      value={agent.id}
                      onSelect={(value) => {
                        setSelectedAgentId(value);
                        setAgentDropdownOpen(false);
                      }}
                      className="flex justify-between"
                    >
                      <div>
                        {agent.user.name || "Unnamed Agent"}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {agent.user.email}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="primary"
          checked={isPrimary}
          onCheckedChange={(checked) => setIsPrimary(checked === true)}
          disabled={isLoading}
        />
        <Label htmlFor="primary">Set as primary agent</Label>
      </div>

      <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
        {isLoading ? 'Assigning...' : 'Assign Agent to Customer'}
      </Button>
    </div>
  );
}
