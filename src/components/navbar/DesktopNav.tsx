
import React from "react";
import { LogIn, UserPlus, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuthContext";

interface DesktopNavProps {
  handleLogin: () => void;
  handleSignup: () => void;
  handleLogout: () => Promise<void>;
}

const DesktopNav: React.FC<DesktopNavProps> = ({
  handleLogin,
  handleSignup,
  handleLogout,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  return (
    <>
      {/* Desktop Nav Links */}
      <div className="hidden md:flex items-center space-x-8">
        <a
          href="#about"
          className="text-sm font-medium text-gray-700 hover:text-leaf transition-colors"
        >
          About
        </a>
        <a
          href="#features"
          className="text-sm font-medium text-gray-700 hover:text-leaf transition-colors"
        >
          Features
        </a>
        <a
          href="#stakeholders"
          className="text-sm font-medium text-gray-700 hover:text-leaf transition-colors"
        >
          Partners
        </a>
        <a
          href="#contact"
          className="text-sm font-medium text-gray-700 hover:text-leaf transition-colors"
        >
          Contact
        </a>
      </div>

      {/* CTA Buttons */}
      <div className="hidden md:flex items-center space-x-4">
        {isLoading ? (
          <div className="animate-pulse h-10 w-32 bg-gray-200 rounded-md"></div>
        ) : isAuthenticated ? (
          <>
            <div className="flex items-center text-sm text-gray-700">
              <User className="h-4 w-4 mr-2" />
              {user?.username || user?.email || 'User'}
            </div>
            <Button 
              variant="outline" 
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="outline" 
              className="border-leaf text-leaf hover:bg-leaf hover:text-white flex items-center gap-2"
              onClick={handleLogin}
            >
              <LogIn className="h-4 w-4" />
              Login
            </Button>
            <Button 
              className="bg-leaf hover:bg-leaf-dark text-white flex items-center gap-2"
              onClick={handleSignup}
            >
              <UserPlus className="h-4 w-4" />
              Sign Up
            </Button>
          </>
        )}
      </div>
    </>
  );
};

export default DesktopNav;
