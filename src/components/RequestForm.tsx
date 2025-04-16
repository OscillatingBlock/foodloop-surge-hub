
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { api, RequestData } from "@/api";
import { format } from "date-fns";

interface RequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  surplusItem: {
    id: number;
    name: string;
    quantity: string;
  };
}

const RequestForm: React.FC<RequestFormProps> = ({ isOpen, onClose, surplusItem }) => {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [ngoName, setNgoName] = useState("");
  const [user, setUser] = useState<any>(null);

  // Fetch the current user to get the NGO ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.auth.checkAuth();
        if (response.authenticated && response.user) {
          setUser(response.user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ngoName.trim()) {
      toast({
        title: "Error",
        description: "Please provide your organization name",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const requestData: RequestData = {
        quantity: quantity || surplusItem.quantity, // Default to full quantity if not specified
        notes: notes || undefined,
        pickup_date: undefined, // This will be set by the farmer when accepting
        request_date: format(new Date(), 'yyyy-MM-dd'), // Today's date
        ngo_name: ngoName,
        ngo_id: user?.id // Include the NGO ID from the logged-in user
      };

      await api.surplus.requestSurplusFood(surplusItem.id.toString(), requestData);
      
      toast({
        title: "Request Sent",
        description: `Your request for ${surplusItem.name} has been sent to the provider.`,
      });
      
      onClose();
    } catch (error) {
      console.error("Error sending request:", error);
      toast({
        title: "Error",
        description: "Failed to send your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Surplus Food</DialogTitle>
          <DialogDescription>
            Create a request for {surplusItem.name} (Available: {surplusItem.quantity})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ngo-name">Organization Name</Label>
            <Input
              id="ngo-name"
              placeholder="Enter your organization name"
              value={ngoName}
              onChange={(e) => setNgoName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              placeholder={`Up to ${surplusItem.quantity}`}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Leave blank to request the full amount.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes to Provider</Label>
            <Textarea
              id="notes"
              placeholder="Any special requirements or information..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-leaf hover:bg-leaf-dark" disabled={loading}>
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RequestForm;
