
import React, { useState, useEffect } from "react";
import { Menu, X, Leaf, LogIn, UserPlus, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/api/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication status on mount and when localStorage changes
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await api.auth.checkAuth();
      setIsAuthenticated(response.authenticated);
      if (response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to check authentication status:", error);
      // Assume not authenticated on error
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    
    // Add event listener for storage events (auth changes in other tabs)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'authToken') {
        checkAuthStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
      // Let the backend handle the session destruction
      setIsAuthenticated(false);
      setUser(null);
      navigate("/");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <a href="#" className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-leaf" />
            <span className="text-xl font-bold font-display text-leaf-dark">
              FoodLoop
            </span>
          </a>

          {/* Desktop Nav */}
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
                  {user?.name || 'User'}
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
        </div>

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
                      {user?.name || 'User'}
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
      </div>
    </nav>
  );
};

export default Navbar;
