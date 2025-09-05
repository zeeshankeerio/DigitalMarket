import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  DollarSign, 
  HelpCircle, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  Package,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";

export function AdminCustomerService() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRefund, setSelectedRefund] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);

  // Data fetching
  const { data: refunds = [], isLoading: refundsLoading } = useQuery<any[]>({
    queryKey: ["/api/refunds"],
  });

  const { data: tickets = [], isLoading: ticketsLoading } = useQuery<any[]>({
    queryKey: ["/api/support-tickets"],
  });

  const { data: disputes = [], isLoading: disputesLoading } = useQuery<any[]>({
    queryKey: ["/api/disputes"],
  });

  const { data: inventoryAlerts = [] } = useQuery<any[]>({
    queryKey: ["/api/inventory-alerts"],
  });

  // Mutations
  const updateRefundMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: any) => {
      const response = await apiRequest("PATCH", `/api/refunds/${id}/status`, {
        status,
        adminNotes,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/refunds"] });
      setRefundModalOpen(false);
      toast({ title: "Refund updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update refund",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, status }: any) => {
      const response = await apiRequest("PATCH", `/api/support-tickets/${id}/status`, {
        status,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      setTicketModalOpen(false);
      toast({ title: "Ticket updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const assignTicketMutation = useMutation({
    mutationFn: async ({ id, assignedTo }: any) => {
      const response = await apiRequest("PATCH", `/api/support-tickets/${id}/assign`, {
        assignedTo,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      toast({ title: "Ticket assigned successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to assign ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateDisputeMutation = useMutation({
    mutationFn: async ({ id, status, resolution }: any) => {
      const response = await apiRequest("PATCH", `/api/disputes/${id}/status`, {
        status,
        resolution,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/disputes"] });
      setDisputeModalOpen(false);
      toast({ title: "Dispute updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update dispute",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resolveInventoryAlertMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PATCH", `/api/inventory-alerts/${id}/resolve`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-alerts"] });
      toast({ title: "Inventory alert resolved" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to resolve alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'approved':
      case 'processed':
      case 'completed':
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'open':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'open':
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'approved':
      case 'processed':
      case 'completed':
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-customer-service">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Refunds</p>
                <p className="text-2xl font-bold" data-testid="stat-pending-refunds">
                  {refunds.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
                <p className="text-2xl font-bold" data-testid="stat-open-tickets">
                  {tickets.filter(t => t.status === 'open').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Disputes</p>
                <p className="text-2xl font-bold" data-testid="stat-active-disputes">
                  {disputes.filter(d => d.status === 'open').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Inventory Alerts</p>
                <p className="text-2xl font-bold" data-testid="stat-inventory-alerts">
                  {inventoryAlerts.filter(a => !a.resolved).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="refunds" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="refunds" data-testid="tab-admin-refunds">
            Refunds ({refunds.length})
          </TabsTrigger>
          <TabsTrigger value="tickets" data-testid="tab-admin-tickets">
            Tickets ({tickets.length})
          </TabsTrigger>
          <TabsTrigger value="disputes" data-testid="tab-admin-disputes">
            Disputes ({disputes.length})
          </TabsTrigger>
          <TabsTrigger value="inventory" data-testid="tab-admin-inventory">
            Inventory ({inventoryAlerts.length})
          </TabsTrigger>
        </TabsList>

        {/* Refunds Tab */}
        <TabsContent value="refunds" className="space-y-4">
          {refundsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : refunds.length > 0 ? (
            refunds.map((refund: any) => (
              <Card key={refund.id} data-testid={`admin-refund-${refund.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">
                          Refund #{refund.id.slice(-8)}
                        </h4>
                        <Badge className={getStatusColor(refund.status)}>
                          {getStatusIcon(refund.status)}
                          {refund.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Order: #{refund.order?.id?.slice(-8)} • 
                        Customer: {refund.user?.email} •
                        Amount: <span className="font-semibold">${refund.amount}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Requested: {format(new Date(refund.createdAt), "PPP")}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        Reason: {refund.reason}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRefund(refund);
                        setRefundModalOpen(true);
                      }}
                      data-testid={`button-manage-refund-${refund.id}`}
                    >
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No refund requests found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Support Tickets Tab */}
        <TabsContent value="tickets" className="space-y-4">
          {ticketsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : tickets.length > 0 ? (
            tickets.map((ticket: any) => (
              <Card key={ticket.id} data-testid={`admin-ticket-${ticket.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">
                          {ticket.subject}
                        </h4>
                        <Badge className={getStatusColor(ticket.status)}>
                          {getStatusIcon(ticket.status)}
                          {ticket.status}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Ticket #{ticket.id.slice(-8)} •
                        Customer: {ticket.user?.email} •
                        Category: {ticket.category?.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Created: {format(new Date(ticket.createdAt), "PPP")}
                        {ticket.assignedTo && (
                          <> • Assigned to: {ticket.assignedTo}</>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {ticket.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => assignTicketMutation.mutate({
                          id: ticket.id,
                          assignedTo: "admin"
                        })}
                        disabled={ticket.assignedTo}
                        data-testid={`button-assign-ticket-${ticket.id}`}
                      >
                        {ticket.assignedTo ? "Assigned" : "Assign"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setTicketModalOpen(true);
                        }}
                        data-testid={`button-manage-ticket-${ticket.id}`}
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No support tickets found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Disputes Tab */}
        <TabsContent value="disputes" className="space-y-4">
          {disputesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : disputes.length > 0 ? (
            disputes.map((dispute: any) => (
              <Card key={dispute.id} data-testid={`admin-dispute-${dispute.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">
                          Dispute #{dispute.id.slice(-8)}
                        </h4>
                        <Badge className={getStatusColor(dispute.status)}>
                          {getStatusIcon(dispute.status)}
                          {dispute.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Order: #{dispute.order?.id?.slice(-8)} •
                        Customer: {dispute.user?.email} •
                        Type: {dispute.type?.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Opened: {format(new Date(dispute.createdAt), "PPP")}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {dispute.description}
                      </p>
                      {dispute.resolution && (
                        <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded">
                          <p className="text-xs font-medium text-green-800 dark:text-green-200">Resolution:</p>
                          <p className="text-xs text-green-700 dark:text-green-300">{dispute.resolution}</p>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDispute(dispute);
                        setDisputeModalOpen(true);
                      }}
                      data-testid={`button-manage-dispute-${dispute.id}`}
                    >
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No disputes found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Inventory Alerts Tab */}
        <TabsContent value="inventory" className="space-y-4">
          {inventoryAlerts.length > 0 ? (
            inventoryAlerts.map((alert: any) => (
              <Card key={alert.id} data-testid={`admin-inventory-alert-${alert.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">
                          Low Stock Alert
                        </h4>
                        <Badge className={alert.resolved ? 
                          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }>
                          {alert.resolved ? "Resolved" : "Active"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Product: {alert.product?.name} •
                        Current Stock: <span className="font-semibold text-red-600">{alert.currentStock}</span> •
                        Threshold: {alert.threshold}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Alert Created: {format(new Date(alert.createdAt), "PPP")}
                      </p>
                    </div>
                    {!alert.resolved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveInventoryAlertMutation.mutate(alert.id)}
                        disabled={resolveInventoryAlertMutation.isPending}
                        data-testid={`button-resolve-alert-${alert.id}`}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No inventory alerts</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Refund Management Modal */}
      {selectedRefund && (
        <RefundManagementModal
          refund={selectedRefund}
          isOpen={refundModalOpen}
          onClose={() => {
            setRefundModalOpen(false);
            setSelectedRefund(null);
          }}
          onUpdate={updateRefundMutation.mutate}
        />
      )}

      {/* Ticket Management Modal */}
      {selectedTicket && (
        <TicketManagementModal
          ticket={selectedTicket}
          isOpen={ticketModalOpen}
          onClose={() => {
            setTicketModalOpen(false);
            setSelectedTicket(null);
          }}
          onUpdate={updateTicketMutation.mutate}
        />
      )}

      {/* Dispute Management Modal */}
      {selectedDispute && (
        <DisputeManagementModal
          dispute={selectedDispute}
          isOpen={disputeModalOpen}
          onClose={() => {
            setDisputeModalOpen(false);
            setSelectedDispute(null);
          }}
          onUpdate={updateDisputeMutation.mutate}
        />
      )}
    </div>
  );
}

// Refund Management Modal Component
function RefundManagementModal({ refund, isOpen, onClose, onUpdate }: any) {
  const [status, setStatus] = useState(refund.status);
  const [adminNotes, setAdminNotes] = useState(refund.adminNotes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      id: refund.id,
      status,
      adminNotes,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="modal-refund-management">
        <DialogHeader>
          <DialogTitle>Manage Refund #{refund.id.slice(-8)}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger data-testid="select-refund-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminNotes">Admin Notes</Label>
            <Textarea
              id="adminNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about the refund decision..."
              rows={4}
              data-testid="textarea-admin-notes"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" data-testid="button-update-refund">
              Update Refund
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Ticket Management Modal Component
function TicketManagementModal({ ticket, isOpen, onClose, onUpdate }: any) {
  const [status, setStatus] = useState(ticket.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      id: ticket.id,
      status,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="modal-ticket-management">
        <DialogHeader>
          <DialogTitle>Manage Ticket: {ticket.subject}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger data-testid="select-ticket-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Ticket Details</h4>
            <p className="text-sm text-muted-foreground mb-1">
              Category: {ticket.category?.replace('_', ' ')}
            </p>
            <p className="text-sm text-muted-foreground mb-1">
              Priority: {ticket.priority}
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              Customer: {ticket.user?.email}
            </p>
            <p className="text-sm">{ticket.description}</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" data-testid="button-update-ticket">
              Update Ticket
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Dispute Management Modal Component
function DisputeManagementModal({ dispute, isOpen, onClose, onUpdate }: any) {
  const [status, setStatus] = useState(dispute.status);
  const [resolution, setResolution] = useState(dispute.resolution || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      id: dispute.id,
      status,
      resolution,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="modal-dispute-management">
        <DialogHeader>
          <DialogTitle>Manage Dispute #{dispute.id.slice(-8)}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger data-testid="select-dispute-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution">Resolution</Label>
            <Textarea
              id="resolution"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Enter resolution details..."
              rows={4}
              data-testid="textarea-dispute-resolution"
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Dispute Details</h4>
            <p className="text-sm text-muted-foreground mb-1">
              Type: {dispute.type?.replace('_', ' ')}
            </p>
            <p className="text-sm text-muted-foreground mb-1">
              Customer: {dispute.user?.email}
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              Order: #{dispute.order?.id?.slice(-8)}
            </p>
            <p className="text-sm">{dispute.description}</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" data-testid="button-update-dispute">
              Update Dispute
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}