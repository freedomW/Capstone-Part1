'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRefreshContext } from './refresh-context';
import { Skeleton } from '@/components/ui/skeleton';

interface Policy {
  id: number;
  insurancePolicyId: string;
  name: string;
  typeOfPolicy: string;
}

interface CustomerPolicy {
  id: number;
  policyHolderId: string;
  insurancePolicyId: string;
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    policyHolderId: string;
  };
  policy: Policy;
}

interface Agent {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function PolicyAgentAssignmentForm() {
  const { triggerPolicyAgentRefresh, triggerCustomerAgentRefresh } = useRefreshContext();
  const [customerPolicies, setCustomerPolicies] = useState<CustomerPolicy[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState<number | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true); // State for initial data loading
  const [customers, setCustomers] = useState<{[key: string]: string}>({});
  
  // Search and dropdown state
  const [policySearchQuery, setPolicySearchQuery] = useState('');
  const [agentSearchQuery, setAgentSearchQuery] = useState('');
  const [policyDropdownOpen, setPolicyDropdownOpen] = useState(false);
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsDataLoading(true); // Start loading
      try {
        // Fetch real customer policies from our new API endpoint
        const customerPoliciesResponse = await fetch('/api/administration/customer-policies', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies and authentication headers
        });
        
        if (!customerPoliciesResponse.ok) {
          console.error('Failed to fetch customer policies. Status:', customerPoliciesResponse.status);
          const errorText = await customerPoliciesResponse.text();
          console.error('Error response:', errorText);
          throw new Error('Failed to fetch customer policies');
        }
        
        const customerPoliciesData = await customerPoliciesResponse.json();
        console.log('Customer policies data:', customerPoliciesData);
        
        if (Array.isArray(customerPoliciesData) && customerPoliciesData.length > 0) {
          // Create a customer lookup for display purposes
          const customerLookup: {[key: string]: string} = {};
          customerPoliciesData.forEach((cp: CustomerPolicy) => {
            customerLookup[cp.policyHolderId] = `${cp.customer.firstName} ${cp.customer.lastName}`;
          });
          
          setCustomers(customerLookup);
          setCustomerPolicies(customerPoliciesData);
          console.log('Real customer policies loaded:', customerPoliciesData.length);
        } else {
          console.error('No customer policies found or unexpected data format:', customerPoliciesData);
          toast.error('No customer policies found');
        }
        const agentsResponse = await fetch('/api/administration/agents', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies and authentication headers
        });
        
        if (!agentsResponse.ok) {
          console.error('Failed to fetch agents. Status:', agentsResponse.status);
          const errorText = await agentsResponse.text();
          console.error('Error response:', errorText);
          throw new Error('Failed to fetch agents');
        }
        
        const agentsData = await agentsResponse.json();
        console.log('Agents data from API:', agentsData);
        
        // Check if agentsData is an array and has items
        if (Array.isArray(agentsData) && agentsData.length > 0) {
          console.log('Number of agents found:', agentsData.length);
          console.log('First agent from API:', agentsData[0]);
          setAgents(agentsData);
        } else {          console.error('Agents data is not in expected format:', agentsData);
          toast.error('Failed to load agents data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsDataLoading(false); // End loading regardless of success/failure
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!selectedPolicyId || !selectedAgentId) {
      toast.error('Please select both a policy and an agent');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/administration/policy-agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerPolicyId: selectedPolicyId,
          agentId: selectedAgentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign agent to policy');
      }      await response.json();
      
      toast.success('Agent assigned to policy successfully');
      
      // Trigger refresh of the policy-agent table
      triggerPolicyAgentRefresh();
      
      // Also trigger refresh of the customer-agent table
      triggerCustomerAgentRefresh();
      
      // Reset form
      setSelectedPolicyId(null);
      setSelectedAgentId(null);
    } catch (error: any) {
      console.error('Error assigning agent to policy:', error);
      toast.error(error.message || 'Failed to assign agent to policy');
    } finally {
      setIsLoading(false);
    }
  };
  // Filter policies based on search query
  const filteredPolicies = customerPolicies.filter(policy => {
    if (!policySearchQuery) return true;
    
    const searchLower = policySearchQuery.toLowerCase();
    const customerName = customers[policy.policyHolderId]?.toLowerCase() || '';
    const policyName = (policy.policy?.name || '').toLowerCase();
    const policyType = (policy.policy?.typeOfPolicy || '').toLowerCase();
    const policyId = (policy.insurancePolicyId || '').toLowerCase();
    const customerFirstName = (policy.customer?.firstName || '').toLowerCase();
    const customerLastName = (policy.customer?.lastName || '').toLowerCase();
    
    return customerName.includes(searchLower) || 
           policyName.includes(searchLower) || 
           policyType.includes(searchLower) ||
           policyId.includes(searchLower) ||
           customerFirstName.includes(searchLower) ||
           customerLastName.includes(searchLower);
  });
  // Filter agents based on search query
  const filteredAgents = agents.filter(agent => {
    if (!agentSearchQuery) return true;
    
    const searchLower = agentSearchQuery.toLowerCase();
    const name = (agent.user?.name || '').toLowerCase();
    const email = (agent.user?.email || '').toLowerCase();
    
    return name.includes(searchLower) || email.includes(searchLower);
  });

  const getPolicyLabel = (policy: CustomerPolicy) => {
    const customerName = customers[policy.policyHolderId] || 'Unknown Customer';
    return `${customerName} - ${policy.policy.name} (${policy.policy.typeOfPolicy})`;
  };

  // Get selected policy details for display
  const selectedPolicy = customerPolicies.find(p => p.id === selectedPolicyId);
  
  // Get selected agent details for display
  const selectedAgent = agents.find(a => a.id === selectedAgentId);
  // If data is still loading, show skeleton UI
  if (isDataLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-full mt-4" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="policy">Select Customer Policy</Label>
          <Popover open={policyDropdownOpen} onOpenChange={setPolicyDropdownOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={policyDropdownOpen}
                className="w-full justify-between"
                disabled={isLoading}
              >
                {selectedPolicy ? getPolicyLabel(selectedPolicy) : "Select a customer policy"}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[500px] p-0">
              <Command shouldFilter={false}>
                <CommandInput 
                  placeholder="Search policies by customer, type, or ID..." 
                  value={policySearchQuery}
                  onValueChange={setPolicySearchQuery}
                />
                <CommandEmpty>No policy found.</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {filteredPolicies.map((policy) => (
                    <CommandItem
                      key={policy.id}
                      value={policy.id.toString()}
                      onSelect={(value) => {
                        setSelectedPolicyId(Number(value));
                        setPolicyDropdownOpen(false);
                      }}
                    >
                      <div className="flex flex-col">
                        <div className="font-medium">
                          {customers[policy.policyHolderId] || 'Unknown Customer'}
                        </div>
                        <div className="text-sm text-muted-foreground flex justify-between w-full">
                          <span>{policy.policy.name} ({policy.policy.typeOfPolicy})</span>
                          <span className="text-xs opacity-70">ID: {policy.insurancePolicyId}</span>
                        </div>
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
            <PopoverContent className="w-[400px] p-0">
              <Command shouldFilter={false}>
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

      <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
        {isLoading ? 'Assigning...' : 'Assign Agent to Policy'}
      </Button>
    </div>
  );
}
