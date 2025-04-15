
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/api/client";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronUp, Filter, Search, MapPin, Clock, Package, User, AlertTriangle } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import RequestForm from "@/components/RequestForm";
import { useQuery } from "@tanstack/react-query";

interface SurplusItem {
  id: number;
  name: string;
  quantity: string;
  location: string;
  expiry: string;
  status: string;
  provider?: string;
}

const FindSurplus: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [foodType, setFoodType] = useState("");
  const [location, setLocation] = useState("");
  const [selectedItem, setSelectedItem] = useState<SurplusItem | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const itemsPerPage = 6;

  // Check user authentication and role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authResponse = await api.auth.checkAuth();
        setIsAuthenticated(authResponse.authenticated);
        if (authResponse.authenticated && authResponse.user) {
          setUserRole(authResponse.user.role);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };
    
    checkAuth();
  }, []);

  // Use React Query to fetch all surplus food items from all farmers
  const { data: allSurplusItems, isLoading, error, refetch } = useQuery({
    queryKey: ['allSurplusFood', searchTerm, foodType, location, userRole],
    queryFn: async () => {
      const filters: Record<string, string> = {};
      if (searchTerm) filters.term = searchTerm;
      if (foodType) filters.type = foodType;
      if (location) filters.location = location;
      
      try {
        // Use the appropriate API endpoint based on user role
        if (userRole === 'NGO') {
          return await api.getAllSurplusFood(filters);
        } else {
          // Fallback to regular surplus food endpoint if not an NGO
          return await api.getSurplusFood(filters);
        }
      } catch (error) {
        console.error("Error fetching surplus food:", error);
        // If 403 error, display a toast
        if (error instanceof Error && error.message.includes('403')) {
          toast({
            title: "Access Denied",
            description: "You need to be logged in as an NGO to view all surplus food",
            variant: "destructive",
          });
        }
        throw error;
      }
    },
    enabled: false, // Don't auto-fetch on component mount
  });

  // Filter the results based on search criteria
  const filteredResults = React.useMemo(() => {
    if (!allSurplusItems) return [];
    
    let results = [...allSurplusItems];
    
    // Apply any additional client-side filtering if needed
    return results;
  }, [allSurplusItems]);

  // Pagination logic
  const totalPages = Math.ceil((filteredResults?.length || 0) / itemsPerPage);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = () => {
    refetch();
  };

  const handleRequest = (item: SurplusItem) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to request surplus food",
        variant: "destructive",
      });
      return;
    }
    
    if (userRole !== 'NGO') {
      toast({
        title: "Access Denied",
        description: "Only NGOs can request surplus food",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedItem(item);
    setShowRequestForm(true);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => navigate("/dashboard")}
      >
        ← Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-leaf-dark flex items-center justify-between">
            <span>Find Surplus Food</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleFilters}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              Filters
              {showFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isAuthenticated && (
            <div className="mb-4 p-4 border border-amber-300 bg-amber-50 rounded-md flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>You are not logged in. Some features may be restricted.</span>
            </div>
          )}
          
          {isAuthenticated && userRole !== 'NGO' && (
            <div className="mb-4 p-4 border border-amber-300 bg-amber-50 rounded-md flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Only NGOs can view all surplus food and make requests. Your access is limited.</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search for surplus food..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                className="bg-leaf hover:bg-leaf-dark"
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md mt-2">
                <div>
                  <Label htmlFor="foodType">Food Type</Label>
                  <Select value={foodType} onValueChange={setFoodType}>
                    <SelectTrigger id="foodType">
                      <SelectValue placeholder="Select food type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grains">Grains (Rice, Wheat, etc.)</SelectItem>
                      <SelectItem value="vegetables">Vegetables</SelectItem>
                      <SelectItem value="fruits">Fruits</SelectItem>
                      <SelectItem value="dairy">Dairy Products</SelectItem>
                      <SelectItem value="bakery">Bakery Items</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="farmland">Farmland District</SelectItem>
                      <SelectItem value="central">Central Market</SelectItem>
                      <SelectItem value="dairy">Dairy Cooperative</SelectItem>
                      <SelectItem value="downtown">Downtown Area</SelectItem>
                      <SelectItem value="suburb">Suburban Markets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-600">
                {error instanceof Error && error.message.includes('403')
                  ? "You don't have permission to view all surplus food. Please log in as an NGO."
                  : "Error loading surplus items. Please try again."}
              </div>
            )}

            {isLoading && (
              <div className="flex justify-center p-8">
                <div className="w-12 h-12 border-4 border-leaf border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {!isLoading && paginatedResults.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-lg mb-4">Available Surplus Food ({filteredResults.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedResults.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="bg-leaf/10 p-4">
                          <h3 className="text-lg font-semibold">{item.name}</h3>
                          <div className="flex items-center mt-2 text-sm text-gray-600">
                            <User className="w-4 h-4 mr-1" />
                            <span>{item.provider || "Anonymous Provider"}</span>
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex items-center text-sm">
                            <Package className="w-4 h-4 mr-2 text-gray-500" />
                            <span>Quantity: {item.quantity}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                            <span>Location: {item.location}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="w-4 h-4 mr-2 text-gray-500" />
                            <span>Expires: {item.expiry}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="bg-gray-50 p-3">
                        <Button 
                          className="w-full bg-leaf hover:bg-leaf-dark"
                          onClick={() => handleRequest(item)}
                          disabled={!isAuthenticated || userRole !== 'NGO'}
                        >
                          Request This Item
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination className="mt-6">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <PaginationItem key={index}>
                          <PaginationLink 
                            onClick={() => setCurrentPage(index + 1)}
                            isActive={currentPage === index + 1}
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            )}

            {!isLoading && paginatedResults.length === 0 && (
              <div className="mt-6 text-center py-8">
                <p className="text-gray-500">
                  {searchTerm || foodType || location 
                    ? "No results found. Try adjusting your search criteria."
                    : "Click 'Search' to find available surplus food."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedItem && (
        <RequestForm
          isOpen={showRequestForm}
          onClose={() => setShowRequestForm(false)}
          surplusItem={selectedItem}
        />
      )}
    </div>
  );
};

export default FindSurplus;
