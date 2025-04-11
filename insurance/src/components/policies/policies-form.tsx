import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const policySchema = z.object({
  insurancePolicyId: z.string().nonempty("Insurance Policy ID is required."),
  name: z.string().nonempty("Policy Name is required."),
  basePriceSgd: z
    .string()
    .nonempty("Base Price (SGD) is required.")
    .regex(/^\d+(\.\d{1,2})?$/, "Base Price must be a valid number."),
  typeOfPolicy: z.string().nonempty("Type of Policy is required."),
});

type PolicyFormValues = z.infer<typeof policySchema>;

export default function PoliciesForm({ onSubmit }: { onSubmit: (formData: PolicyFormValues) => Promise<void> }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      insurancePolicyId: "",
      name: "",
      basePriceSgd: "",
      typeOfPolicy: "",
    },
  });

  const onSubmitHandler = async (formData: PolicyFormValues) => {
    try {
      const response = await fetch("/api/policies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.error === "Insurance Policy ID already exists.") {
          setError("insurancePolicyId", { type: "server", message: "Insurance Policy ID already exists." });
          return;
        } else {
          alert("An unexpected error occurred. Please try again.");
        }
        return;
      }
      alert("Policy added successfully!");
    }
    catch (error) {
      console.error("Error submitting form:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };
  
  
  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="w-full max-w-md mx-auto mt-10 space-y-4">
      <div>
        <Input placeholder="Insurance Policy ID" {...register("insurancePolicyId")} />
        {errors.insurancePolicyId && <p className="text-destructive">{errors.insurancePolicyId.message}</p>}
      </div>
      <div>
        <Input placeholder="Policy Name" {...register("name")} />
        {errors.name && <p className="text-destructive">{errors.name.message}</p>}
      </div>
      <div>
        <Input placeholder="Base Price (SGD)" {...register("basePriceSgd")} />
        {errors.basePriceSgd && <p className="text-destructive">{errors.basePriceSgd.message}</p>}
      </div>
      <div>
        <Input placeholder="Type of Policy" {...register("typeOfPolicy")} />
        {errors.typeOfPolicy && <p className="text-destructive">{errors.typeOfPolicy.message}</p>}
      </div>
      <Button type="submit" className="w-full">
        Add Policy
      </Button>
    </form>
  );
}