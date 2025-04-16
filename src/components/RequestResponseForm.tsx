
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { api, RequestResponse } from "@/api";
import { toast } from "@/hooks/use-toast";

interface RequestResponseFormProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: number;
  foodName: string;
  requesterName: string;
}

const RequestResponseForm: React.FC<RequestResponseFormProps> = ({ 
  isOpen, 
  onClose, 
  requestId,
  foodName,
  requesterName
}) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [response, setResponse] = useState<'accept' | 'decline' | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!response) {
      toast({
        title: "Error",
        description: "Please select whether to accept or decline the request.",
        variant: "destructive",
      });
      return;
    }
    
    if (response === 'accept' && !date) {
      toast({
        title: "Error",
        description: "Please select a pickup date.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const responseData: RequestResponse = {
        request_id: requestId,
        response: response,
        notes: notes || undefined,
      };
      
      if (response === 'accept' && date) {
        responseData.pickup_date = format(date, 'yyyy-MM-dd');
      }

      await api.requests.respondToRequest(requestId, responseData);
      
      toast({
        title: response === 'accept' ? "Request Accepted" : "Request Declined",
        description: `You have ${response === 'accept' ? 'accepted' : 'declined'} the request from ${requesterName}.`,
      });
      
      onClose();
    } catch (error) {
      console.error("Error responding to request:", error);
      toast({
        title: "Error",
        description: "Failed to respond to the request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Respond to Request</DialogTitle>
          <DialogDescription>
            {requesterName} has requested {foodName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {response === undefined && (
            <div className="flex gap-3 justify-center py-4">
              <Button 
                type="button" 
                onClick={() => setResponse('accept')}
                className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white" 
                variant="outline"
              >
                Accept Request
              </Button>
              <Button 
                type="button" 
                onClick={() => setResponse('decline')}
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white" 
                variant="outline"
              >
                Decline Request
              </Button>
            </div>
          )}

          {response !== undefined && (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  {response === 'accept' ? 'Accepting Request' : 'Declining Request'}
                </h3>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setResponse(undefined)}
                >
                  Change Response
                </Button>
              </div>

              {response === 'accept' && (
                <div className="space-y-2">
                  <Label htmlFor="pickup-date">Pickup Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="pickup-date"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select pickup date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes to Requester</Label>
                <Textarea
                  id="notes"
                  placeholder={response === 'accept' 
                    ? "Any special instructions for pickup..." 
                    : "Reason for declining (optional)..."}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  className={response === 'accept' 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-red-600 hover:bg-red-700"}
                  disabled={loading}
                >
                  {loading ? "Processing..." : (response === 'accept' ? "Confirm Acceptance" : "Confirm Decline")}
                </Button>
              </DialogFooter>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RequestResponseForm;
