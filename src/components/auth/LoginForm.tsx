
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Leaf } from "lucide-react";
import { api, LoginCredentials } from "@/api/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  remember: z.boolean().optional().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: LoginFormValues) => {
    try {
      // Convert form values to the required type for the API
      const credentials: LoginCredentials = {
        email: values.email,
        password: values.password,
        remember: values.remember,
      };
      
      const result = await api.auth.login(credentials);
      
      // Handle the JWT token if returned
      if (result.token) {
        // Store token in localStorage for future API requests
        localStorage.setItem('authToken', result.token);
      }
      
      toast({
        title: "Login successful",
        description: result.message || "You have been logged in successfully",
      });
      
      // Get user data to determine their role
      const authStatus = await api.auth.checkAuth();
      
      if (authStatus.authenticated && authStatus.user) {
        // Redirect based on user role
        navigate("/dashboard");
      } else {
        // If for some reason we can't get the user data, just go to the dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // More detailed error message
      let errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="flex flex-col items-center justify-center text-center">
        <Leaf className="h-12 w-12 text-leaf mb-2" />
        <h1 className="text-2xl font-bold text-leaf-dark">Login to FoodLoop</h1>
        <p className="text-gray-600 mt-2">Enter your credentials to access your account</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    placeholder="Your password"
                    type="password"
                    autoComplete="current-password"
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
            {isSubmitting ? "Logging in..." : "Login"}
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
          Don't have an account?{" "}
          <Button
            variant="link"
            className="p-0 text-leaf"
            onClick={() => navigate("/signup")}
          >
            Sign up
          </Button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
