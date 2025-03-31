
import React from "react";
import SignupForm from "@/components/auth/SignupForm";

const Signup: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <SignupForm />
    </div>
  );
};

export default Signup;
