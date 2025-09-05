import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefundRequest } from "./RefundRequest";
import { SupportTicket } from "./SupportTicket";
import { 
  DollarSign, 
  HelpCircle, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Package
} from "lucide-react";
import { OrderWithItems } from "@shared/schema";
import { format } from "date-fns";

interface CustomerServiceProps {
  orders: OrderWithItems[];
}

export function CustomerService({ orders }: CustomerServiceProps) {
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | undefined>();

  const { data: refunds = [] } = useQuery<any[]>({
    queryKey: ["/api/refunds"],
  });

  const { data: supportTickets = [] } = useQuery<any[]>({
    queryKey: ["/api/support-tickets"],
  });

  const { data: disputes = [] } = useQuery<any[]>({
    queryKey: ["/api/disputes"],
  });

  const completedOrders = orders.filter(order => order.status === 'completed');

  const openRefundRequest = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setRefundModalOpen(true);
  };

  const openSupportTicket = (order?: OrderWithItems) => {
    setSelectedOrder(order);
    setSupportModalOpen(true);
  };

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

  return (
    <div className="space-y-6" data-testid="customer-service">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Customer Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => openSupportTicket()}
              className="flex items-center gap-2 h-auto p-4 flex-col"
              variant="outline"
              data-testid="button-new-support-ticket"
            >
              <MessageSquare className="w-6 h-6" />
              <span className="font-medium">Create Support Ticket</span>
              <span className="text-xs text-muted-foreground">Get help with any issues</span>
            </Button>
            
            <Button
              onClick={() => openRefundRequest(completedOrders[0])}
              className="flex items-center gap-2 h-auto p-4 flex-col"
              variant="outline"
              disabled={completedOrders.length === 0}
              data-testid="button-request-refund"
            >
              <DollarSign className="w-6 h-6" />
              <span className="font-medium">Request Refund</span>
              <span className="text-xs text-muted-foreground">
                {completedOrders.length > 0 ? 'For eligible orders' : 'No eligible orders'}
              </span>
            </Button>
            
            <div className="flex items-center justify-center p-4 border border-dashed border-border rounded-lg">
              <div className="text-center">
                <Package className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Order Issues</p>
                <p className="text-xs text-muted-foreground">Report delivery problems</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tickets" data-testid="tab-tickets">
            Support Tickets ({supportTickets.length})
          </TabsTrigger>
          <TabsTrigger value="refunds" data-testid="tab-refunds">
            Refunds ({refunds.length})
          </TabsTrigger>
          <TabsTrigger value="disputes" data-testid="tab-disputes">
            Disputes ({disputes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          {supportTickets.length > 0 ? (
            supportTickets.map((ticket: any) => (
              <Card key={ticket.id} data-testid={`ticket-${ticket.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground" data-testid={`ticket-subject-${ticket.id}`}>
                        {ticket.subject}
                      </h4>
                      <p className="text-sm text-muted-foreground" data-testid={`ticket-date-${ticket.id}`}>
                        Created {ticket.createdAt ? format(new Date(ticket.createdAt), "PPP") : 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        Category: {ticket.category?.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(ticket.status)} flex items-center gap-1`} data-testid={`ticket-status-${ticket.id}`}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status}
                      </Badge>
                      <Badge variant="outline" className="mt-1" data-testid={`ticket-priority-${ticket.id}`}>
                        {ticket.priority}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`ticket-description-${ticket.id}`}>
                    {ticket.description}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No support tickets found</p>
                <Button onClick={() => openSupportTicket()} data-testid="button-create-first-ticket">
                  Create Your First Ticket
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="refunds" className="space-y-4">
          {refunds.length > 0 ? (
            refunds.map((refund: any) => (
              <Card key={refund.id} data-testid={`refund-${refund.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground" data-testid={`refund-order-${refund.id}`}>
                        Order #{refund.order?.id?.slice(-8)}
                      </h4>
                      <p className="text-sm text-muted-foreground" data-testid={`refund-date-${refund.id}`}>
                        Requested {refund.createdAt ? format(new Date(refund.createdAt), "PPP") : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(refund.status)} flex items-center gap-1`} data-testid={`refund-status-${refund.id}`}>
                        {getStatusIcon(refund.status)}
                        {refund.status}
                      </Badge>
                      <p className="text-lg font-bold text-foreground mt-1" data-testid={`refund-amount-${refund.id}`}>
                        ${refund.amount}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`refund-reason-${refund.id}`}>
                    {refund.reason}
                  </p>
                  {refund.adminNotes && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Admin Notes:</p>
                      <p className="text-sm text-muted-foreground" data-testid={`refund-admin-notes-${refund.id}`}>
                        {refund.adminNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No refund requests found</p>
                {completedOrders.length > 0 && (
                  <Button onClick={() => openRefundRequest(completedOrders[0])} data-testid="button-request-first-refund">
                    Request Your First Refund
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="disputes" className="space-y-4">
          {disputes.length > 0 ? (
            disputes.map((dispute: any) => (
              <Card key={dispute.id} data-testid={`dispute-${dispute.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground" data-testid={`dispute-order-${dispute.id}`}>
                        Order #{dispute.order?.id?.slice(-8)}
                      </h4>
                      <p className="text-sm text-muted-foreground" data-testid={`dispute-date-${dispute.id}`}>
                        Opened {dispute.createdAt ? format(new Date(dispute.createdAt), "PPP") : 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        Type: {dispute.type?.replace('_', ' ')}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(dispute.status)} flex items-center gap-1`} data-testid={`dispute-status-${dispute.id}`}>
                      {getStatusIcon(dispute.status)}
                      {dispute.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`dispute-description-${dispute.id}`}>
                    {dispute.description}
                  </p>
                  {dispute.resolution && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Resolution:</p>
                      <p className="text-sm text-green-700 dark:text-green-300" data-testid={`dispute-resolution-${dispute.id}`}>
                        {dispute.resolution}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No disputes found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Disputes are automatically created for payment issues
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Eligible Orders Modal for Refunds */}
      {refundModalOpen && completedOrders.length > 1 && !selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Select Order for Refund</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {completedOrders.map(order => (
                <Button
                  key={order.id}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => openRefundRequest(order)}
                  data-testid={`button-select-order-${order.id}`}
                >
                  <span>Order #{order.id.slice(-8)}</span>
                  <span>${order.total}</span>
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setRefundModalOpen(false)}
                data-testid="button-cancel-order-selection"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modals */}
      {selectedOrder && (
        <RefundRequest
          isOpen={refundModalOpen}
          onClose={() => {
            setRefundModalOpen(false);
            setSelectedOrder(undefined);
          }}
          order={selectedOrder}
        />
      )}

      <SupportTicket
        isOpen={supportModalOpen}
        onClose={() => {
          setSupportModalOpen(false);
          setSelectedOrder(undefined);
        }}
        order={selectedOrder}
      />
    </div>
  );
}