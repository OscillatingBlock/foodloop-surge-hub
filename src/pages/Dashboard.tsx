
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/api/client";
import { Plus, Search, ChartBar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { UserRole } from "@/api/client";

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const response = await api.auth.checkAuth();
        
        if (response.authenticated && response.user) {
          setUser(response.user);
          
          // Load appropriate data based on user role
          if (response.user.role === "NGO") {
            // For NGOs, load AI predictions and requests
            loadRequests();
          } else {
            // For Farmers/Retailers, load their food items
            loadFoodItems();
          }
        } else {
          // Not authenticated, redirect to login
          toast({
            title: "Authentication required",
            description: "Please log in to access the dashboard",
            variant: "destructive",
          });
          navigate("/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        toast({
          title: "Error",
          description: "Failed to verify your authentication status",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const loadFoodItems = async () => {
    try {
      // In a real app, you would have a proper endpoint to get user's food items
      const data = await api.getSurplusFood();
      setFoodItems(data || []);
    } catch (error) {
      console.error("Error loading food items:", error);
      toast({
        title: "Error",
        description: "Failed to load your food items",
        variant: "destructive",
      });
    }
  };

  const loadRequests = async () => {
    try {
      // In a real app, you would have a proper endpoint to get NGO's requests
      const data = await api.getData(); // Placeholder
      setRequests(data || []);
    } catch (error) {
      console.error("Error loading requests:", error);
      toast({
        title: "Error",
        description: "Failed to load your requests",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-leaf"></div>
      </div>
    );
  }

  // Placeholder data for the demo
  const demoFoodItems = [
    { id: 1, name: "Apples", quantity: "50 kg", expiry: "2025-05-01", status: "Available" },
    { id: 2, name: "Rice", quantity: "100 kg", expiry: "2025-07-15", status: "Requested" },
    { id: 3, name: "Milk", quantity: "30 liters", expiry: "2025-04-15", status: "Claimed" },
  ];

  const demoRequests = [
    { id: 1, foodName: "Rice", quantity: "25 kg", status: "Pending", date: "2025-04-03" },
    { id: 2, foodName: "Vegetables", quantity: "15 kg", status: "Accepted", date: "2025-04-01" },
    { id: 3, foodName: "Fruits", quantity: "10 kg", status: "Completed", date: "2025-03-28" },
  ];

  // If we don't have any data yet, use demo data
  const displayFoodItems = foodItems.length > 0 ? foodItems : demoFoodItems;
  const displayRequests = requests.length > 0 ? requests : demoRequests;

  // Render dashboard based on role
  const userRole = user?.role as UserRole || "Farmer";
  
  if (userRole === "NGO") {
    return <NGODashboard requests={displayRequests} />;
  } else {
    return <FarmerRetailerDashboard foodItems={displayFoodItems} role={userRole} />;
  }
};

// Farmer/Retailer Dashboard Component
const FarmerRetailerDashboard: React.FC<{ foodItems: any[], role: UserRole }> = ({ foodItems, role }) => {
  const navigate = useNavigate();

  const handleRequestAction = (requestId: number, action: "accept" | "decline") => {
    // In a real app, you would call an API to update the request status
    toast({
      title: `Request ${action === "accept" ? "accepted" : "declined"}`,
      description: `You have ${action === "accept" ? "accepted" : "declined"} the request #${requestId}`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-leaf-dark">{role} Dashboard</h1>
        <Button 
          className="bg-leaf hover:bg-leaf-dark flex items-center gap-2"
          onClick={() => navigate("/add_surplus")}
        >
          <Plus className="h-4 w-4" />
          Add Surplus Food
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{foodItems.length}</p>
            <p className="text-sm text-gray-500">food items listed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">2</p>
            <p className="text-sm text-gray-500">waiting for action</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Food Shared</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">150 kg</p>
            <p className="text-sm text-gray-500">total food shared</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span>Surplus Food List</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Food Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Expiration Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {foodItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.expiry}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${item.status === 'Available' ? 'bg-green-100 text-green-800' :
                            item.status === 'Requested' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'}`
                        }>
                          {item.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChartBar className="h-4 w-4 mr-2" />
                <span>AI Predictions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-md bg-blue-50 border-blue-100 text-blue-700">
                <p className="font-medium mb-2">Market Insight</p>
                <p className="text-sm">High demand for grains in your area this week. Consider listing any surplus rice or wheat.</p>
              </div>
              <div className="p-4 border rounded-md bg-green-50 border-green-100 text-green-700 mt-3">
                <p className="font-medium mb-2">Distribution Suggestion</p>
                <p className="text-sm">5 NGOs in your area need vegetables. Your recent listings match their needs.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requests (2)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-md">
                <div className="flex justify-between mb-2">
                  <p className="font-medium">Food Relief NGO</p>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Pending</span>
                </div>
                <p className="text-sm mb-2">Requested: <span className="font-medium">25kg Rice</span></p>
                <p className="text-xs text-gray-500 mb-3">April 3, 2025</p>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                    onClick={() => handleRequestAction(1, "accept")}
                  >
                    Accept
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    onClick={() => handleRequestAction(1, "decline")}
                  >
                    Decline
                  </Button>
                </div>
              </div>

              <div className="p-4 border rounded-md">
                <div className="flex justify-between mb-2">
                  <p className="font-medium">Community Kitchen</p>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Pending</span>
                </div>
                <p className="text-sm mb-2">Requested: <span className="font-medium">10kg Vegetables</span></p>
                <p className="text-xs text-gray-500 mb-3">April 2, 2025</p>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                    onClick={() => handleRequestAction(2, "accept")}
                  >
                    Accept
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    onClick={() => handleRequestAction(2, "decline")}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// NGO Dashboard Component
const NGODashboard: React.FC<{ requests: any[] }> = ({ requests }) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-leaf-dark">NGO Dashboard</h1>
        <Button 
          className="bg-leaf hover:bg-leaf-dark flex items-center gap-2"
          onClick={() => navigate("/find_surplus")}
        >
          <Search className="h-4 w-4" />
          Find Surplus Food
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">3</p>
            <p className="text-sm text-gray-500">pending requests</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Food Claimed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">120 kg</p>
            <p className="text-sm text-gray-500">this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">People Served</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">350+</p>
            <p className="text-sm text-gray-500">estimated impact</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>My Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Food Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.foodName}</TableCell>
                      <TableCell>{request.quantity}</TableCell>
                      <TableCell>{request.date}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${request.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                            request.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'}`
                        }>
                          {request.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChartBar className="h-4 w-4 mr-2" />
                <span>AI Predictions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-md bg-blue-50 border-blue-100 text-blue-700">
                <p className="font-medium mb-2">Weekly Forecast</p>
                <p className="text-sm">Next week: 100 kg of vegetables needed based on your distribution patterns.</p>
              </div>
              <div className="p-4 border rounded-md bg-green-50 border-green-100 text-green-700">
                <p className="font-medium mb-2">Opportunity Alert</p>
                <p className="text-sm">5 new farmers in your area have listed surplus grains in the past 24 hours.</p>
              </div>
              <div className="p-4 border rounded-md bg-amber-50 border-amber-100 text-amber-700">
                <p className="font-medium mb-2">Supply Gap</p>
                <p className="text-sm">There's a shortage of dairy products in your area. Consider broadening your request categories.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
