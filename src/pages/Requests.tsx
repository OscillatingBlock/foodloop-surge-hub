
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { api } from "@/api/client";
import { toast } from "@/hooks/use-toast";
import RequestResponseForm from "@/components/RequestResponseForm";

interface Request {
  id: number;
  food_name: string;
  quantity: string;
  requester_name: string; // For Farmer/Retailer view (NGO name)
  requester_id?: number;  // NGO ID
  provider_name?: string;  // For NGO view
  provider_id?: number;    // Provider ID
  request_date: string;
  status: string;
  notes?: string;
  pickup_date?: string;
}

const Requests: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showResponseForm, setShowResponseForm] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.auth.checkAuth();
        if (response.authenticated && response.user) {
          setUser(response.user);
          loadRequests();
        } else {
          toast({
            title: "Authentication required",
            description: "Please log in to access requests",
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
      }
    };

    checkAuth();
  }, [navigate]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getRequests();
      setRequests(data || []);
    } catch (error) {
      console.error("Error loading requests:", error);
      toast({
        title: "Error",
        description: "Failed to load requests",
        variant: "destructive",
      });
      
      // Demo data for testing
      setRequests([
        {
          id: 1,
          food_name: "Rice",
          quantity: "25 kg",
          requester_name: "Food Relief NGO",
          request_date: "2025-04-03",
          status: "Pending",
          notes: "Needed for our community kitchen program"
        },
        {
          id: 2,
          food_name: "Vegetables",
          quantity: "15 kg",
          requester_name: "Community Kitchen",
          request_date: "2025-04-01",
          status: "Accepted",
          pickup_date: "2025-04-08",
          notes: "Will be used in our weekly meal program"
        },
        {
          id: 3,
          food_name: "Apples",
          quantity: "10 kg",
          provider_name: "Green Farms",
          requester_name: "School Lunch Program",
          request_date: "2025-03-28",
          status: "Completed",
          notes: "For school lunch program"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = (request: Request) => {
    setSelectedRequest(request);
    setShowResponseForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-leaf"></div>
      </div>
    );
  }

  const pendingRequests = requests.filter(req => req.status === "Pending");
  const acceptedRequests = requests.filter(req => req.status === "Accepted");
  const pastRequests = requests.filter(req => ["Completed", "Declined"].includes(req.status));

  // Determine if user is NGO or Farmer/Retailer to show appropriate view
  const isNGO = user?.role === "NGO";

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
          <CardTitle className="text-2xl font-bold text-leaf-dark">
            {isNGO ? "My Food Requests" : "Received Requests"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Pending ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({acceptedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              {pendingRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Food Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>{isNGO ? "Provider" : "Requester"}</TableHead>
                      <TableHead>Request Date</TableHead>
                      {!isNGO && <TableHead className="text-right">Action</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.food_name}</TableCell>
                        <TableCell>{request.quantity}</TableCell>
                        <TableCell>{isNGO ? request.provider_name : request.requester_name}</TableCell>
                        <TableCell>{request.request_date}</TableCell>
                        {!isNGO && (
                          <TableCell className="text-right">
                            <Button
                              onClick={() => handleResponse(request)}
                              size="sm"
                              className="bg-leaf hover:bg-leaf-dark"
                            >
                              Respond
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No pending requests.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="active" className="mt-6">
              {acceptedRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Food Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>{isNGO ? "Provider" : "Requester"}</TableHead>
                      <TableHead>Pickup Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {acceptedRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.food_name}</TableCell>
                        <TableCell>{request.quantity}</TableCell>
                        <TableCell>{isNGO ? request.provider_name : request.requester_name}</TableCell>
                        <TableCell>{request.pickup_date}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            {request.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No active requests.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-6">
              {pastRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Food Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>{isNGO ? "Provider" : "Requester"}</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.food_name}</TableCell>
                        <TableCell>{request.quantity}</TableCell>
                        <TableCell>{isNGO ? request.provider_name : request.requester_name}</TableCell>
                        <TableCell>{request.request_date}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold
                            ${request.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`
                          }>
                            {request.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No past requests.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedRequest && !isNGO && (
        <RequestResponseForm
          isOpen={showResponseForm}
          onClose={() => setShowResponseForm(false)}
          requestId={selectedRequest.id}
          foodName={selectedRequest.food_name}
          requesterName={selectedRequest.requester_name || "NGO"}
        />
      )}
    </div>
  );
};

export default Requests;
