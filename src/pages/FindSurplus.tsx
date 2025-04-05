
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/api/client";
import { toast } from "@/hooks/use-toast";
import { ChevronDown, ChevronUp, Filter, Search } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface SurplusItem {
  id: number;
  name: string;
  quantity: string;
  location: string;
  expiry: string;
  provider: string;
}

const FindSurplus: React.FC = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [foodType, setFoodType] = useState("");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState<SurplusItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Demo data for the example
  const demoResults: SurplusItem[] = [
    { id: 1, name: "Rice", quantity: "100 kg", location: "Farmland District", expiry: "2025-07-15", provider: "Green Farms" },
    { id: 2, name: "Apples", quantity: "50 kg", location: "Central Market", expiry: "2025-05-01", provider: "Fresh Produce Inc." },
    { id: 3, name: "Milk", quantity: "30 liters", location: "Dairy Cooperative", expiry: "2025-04-15", provider: "Happy Cows Dairy" },
    { id: 4, name: "Vegetables", quantity: "75 kg", location: "Farmland District", expiry: "2025-04-10", provider: "Green Farms" },
    { id: 5, name: "Bread", quantity: "25 kg", location: "Downtown Bakery", expiry: "2025-04-07", provider: "Golden Grain" },
  ];

  const handleSearch = async () => {
    setLoading(true);
    try {
      // In a real application, you would make an API call with the filters
      console.log("Searching with filters:", { searchTerm, foodType, location });
      
      // Simulate API call with setTimeout
      setTimeout(() => {
        // For the demo, we'll just return the demo data
        setResults(demoResults);
        setLoading(false);
      }, 1000);
      
      // In a real app, you'd do something like:
      // const data = await api.getSurplusFood({ term: searchTerm, type: foodType, location });
      // setResults(data);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: "Failed to retrieve surplus food listings",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleRequest = (itemId: number) => {
    // In a real app, you'd make an API call to request this item
    console.log("Requesting item:", itemId);
    toast({
      title: "Request Sent",
      description: "Your request for this item has been sent to the provider.",
    });
    
    // In a real app:
    // api.requestSurplusFood(itemId.toString())
    //   .then(() => {
    //     toast({
    //       title: "Request Sent",
    //       description: "Your request has been sent successfully",
    //     });
    //   })
    //   .catch((error) => {
    //     toast({
    //       title: "Error",
    //       description: "Failed to send your request",
    //       variant: "destructive",
    //     });
    //   });
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
                disabled={loading}
              >
                {loading ? "Searching..." : "Search"}
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

            {results.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-lg mb-4">Available Surplus Food ({results.length})</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Food Name</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.expiry}</TableCell>
                        <TableCell>{item.provider}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm"
                            className="bg-leaf hover:bg-leaf-dark"
                            onClick={() => handleRequest(item.id)}
                          >
                            Request
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {searchTerm && results.length === 0 && !loading && (
              <div className="mt-6 text-center py-8">
                <p className="text-gray-500">No results found. Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FindSurplus;
