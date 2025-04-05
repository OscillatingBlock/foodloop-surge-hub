import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Leaf } from "lucide-react";
import { api, SignupData } from "@/api/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const signupSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: SignupFormValues) => {
    try {
      // Remove confirmPassword as it's not needed in the API call
      const { confirmPassword, ...formData } = values;
      
      // Create a properly typed object for the API call
      const userData: SignupData = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      };
      
      const result = await api.auth.signup(userData);
      toast({
        title: "Signup successful",
        description: result.message || "Your account has been created successfully",
      });
      
      // Redirect to login page after successful signup
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
      
      // More detailed error message
      let errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      toast({
        title: "Signup failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="flex flex-col items-center justify-center text-center">
        <Leaf className="h-12 w-12 text-leaf mb-2" />
        <h1 className="text-2xl font-bold text-leaf-dark">Create a FoodLoop Account</h1>
        <p className="text-gray-600 mt-2">Join our sustainable food ecosystem</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="johndoe"
                    autoComplete="username"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="youremail@example.com"
                    type="email"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Create a strong password"
                    type="password"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Confirm your password"
                    type="password"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-leaf hover:bg-leaf-dark"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
      </Form>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
        <p className="text-sm mb-2 font-medium">Important:</p>
        <p className="text-sm">
          Make sure your Flask backend server is running at <code className="bg-amber-100 px-1 py-0.5 rounded">http://localhost:5000</code> or update the API_BASE_URL in the API client if your server is running elsewhere.
        </p>
      </div>

      <div className="text-center mt-4">
        <p className="text-gray-600">
          Already have an account?{" "}
          <Button
            variant="link"
            className="p-0 text-leaf"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
