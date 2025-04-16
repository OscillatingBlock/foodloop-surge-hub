
import React from "react";
import { Menu, X, LogIn, UserPlus, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthContext";

interface MobileNavProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  handleLogin: () => void;
  handleSignup: () => void;
  handleLogout: () => Promise<void>;
}

const MobileNav: React.FC<MobileNavProps> = ({
  isMenuOpen,
  setIsMenuOpen,
  handleLogin,
  handleSignup,
  handleLogout,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden focus:outline-none"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white absolute top-16 left-0 right-0 shadow-md animate-fade-in">
          <div className="flex flex-col p-4 space-y-3">
            <a
              href="#about"
              className="text-gray-700 hover:text-leaf py-2 px-4"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            <a
              href="#features"
              className="text-gray-700 hover:text-leaf py-2 px-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#stakeholders"
              className="text-gray-700 hover:text-leaf py-2 px-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Partners
            </a>
            <a
              href="#contact"
              className="text-gray-700 hover:text-leaf py-2 px-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </a>
            <div className="flex flex-col space-y-2 pt-2">
              {isLoading ? (
                <div className="animate-pulse h-10 w-full bg-gray-200 rounded-md"></div>
              ) : isAuthenticated ? (
                <>
                  <div className="flex items-center text-sm text-gray-700 py-2 px-4">
                    <User className="h-4 w-4 mr-2" />
                    {user?.username || user?.email || 'User'}
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white w-full flex items-center justify-center gap-2"
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
                    className="border-leaf text-leaf hover:bg-leaf hover:text-white w-full flex items-center justify-center gap-2"
                    onClick={handleLogin}
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                  <Button 
                    className="bg-leaf hover:bg-leaf-dark text-white w-full flex items-center justify-center gap-2"
                    onClick={handleSignup}
                  >
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
