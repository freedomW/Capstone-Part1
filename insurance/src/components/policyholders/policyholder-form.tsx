"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { useState, useEffect } from "react";
import { redirect } from "next/dist/server/api-utils";

interface PolicyHolderFormProps {
  onSubmit: (formData: {
    policyHolderId: string;
    firstName: string;
    lastName: string;
    email: string;
    policies: string[];
  }) => void;
}

const policyHolderSchema = z.object({
  policyHolderId: z.string().nonempty("Policy Holder ID is required."),
  firstName: z.string().nonempty("First Name is required."),
  lastName: z.string().nonempty("Last Name is required."),
  email: z.string().email("Please enter a valid email address."),
  policies: z.array(z.string()).optional(),
});

export default function PolicyHolderForm({ onSubmit }: PolicyHolderFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    setValue,
  } = useForm({
    resolver: zodResolver(policyHolderSchema),
    defaultValues: {
      policyHolderId: "",
      firstName: "",
      lastName: "",
      email: "",
      policies: [],
    },
  });

  const [policies, setPolicies] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function fetchPolicies() {
      try {
        const response = await fetch("/api/policies");
        const data = await response.json();
        setPolicies(data.map((policy: any) => ({ id: policy.insurancePolicyId, name: policy.name })));
      } catch (error) {
        console.error("Error fetching policies:", error);
      }
    }

    fetchPolicies();
  }, []);

  const onSubmitHandler = async (formData: z.infer<typeof policyHolderSchema>) => {
    try {
      const response = await fetch("/api/policyholders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.error === "Policy Holder ID already exists.") {
          setError("policyHolderId", { type: "server", message: "Policy Holder ID already exists." });
          return;
        } else {
          alert("An unexpected error occurred. Please try again.");
        }
        return;
      }
      alert("Policy holder added successfully!");
    reset();
    window.location.href = "/policyholders/new";
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="w-full max-w-md mx-auto mt-10 space-y-4">
      <div>
        <Input placeholder="Policy Holder ID" {...register("policyHolderId")} />
        {errors.policyHolderId && <p className="text-destructive">{errors.policyHolderId.message}</p>}
      </div>
      <div>
        <Input placeholder="First Name" {...register("firstName")} />
        {errors.firstName && <p className="text-destructive">{errors.firstName.message}</p>}
      </div>
      <div>
        <Input placeholder="Last Name" {...register("lastName")} />
        {errors.lastName && <p className="text-destructive">{errors.lastName.message}</p>}
      </div>
      <div>
        <Input type="email" placeholder="Email" {...register("email")} />
        {errors.email && <p className="text-destructive">{errors.email.message}</p>}
      </div>
      <div>
        <MultiSelect
          options={policies.map((policy) => ({ value: policy.id, label: policy.name }))}
          defaultValue={[]}
          onValueChange={(value) => {
            setValue("policies", value); // Update the form value for policies
          }}
          placeholder="Select Policies"
        />
      </div>
      <Button type="submit" className="w-full">
        Add Policy Holder
      </Button>
    </form>
  );
}