import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { toast } from '@/hooks/use-toast';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
  CheckCircle,
  Mail,
  AlertTriangle,
  Info
} from 'lucide-react';

type EmailEvent = {
  _id: string;
  type: string;
  data: {
    to: string;
    subject?: string;
  };
  timestamp: string;
  processed: boolean;
};

type SuppressionEntry = {
  _id: string;
  email: string;
  reason: string;
  timestamp: string;
  active: boolean;
};

type PaginationInfo = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

const EmailManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsLimit, setEventsLimit] = useState(20);
  const [eventsType, setEventsType] = useState('');
  const [eventsEmail, setEventsEmail] = useState('');
  const [suppressionPage, setSuppressionPage] = useState(1);
  const [suppressionLimit, setSuppressionLimit] = useState(20);
  const [suppressionEmail, setSuppressionEmail] = useState('');
  const [suppressionReason, setSuppressionReason] = useState('');
  const [suppressionActive, setSuppressionActive] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newReason, setNewReason] = useState('');
  const [statsTimeframe, setStatsTimeframe] = useState('7days');
  
  const queryClient = useQueryClient();

  // Events query
  const { 
    data: eventsData, 
    isLoading: eventsLoading, 
    refetch: refetchEvents 
  } = useQuery({
    queryKey: [
      '/api/admin/email/events', 
      eventsPage, 
      eventsLimit, 
      eventsType, 
      eventsEmail
    ],
    queryFn: async () => {
      const url = `/api/admin/email/events?page=${eventsPage}&limit=${eventsLimit}${eventsType ? `&type=${eventsType}` : ''}${eventsEmail ? `&email=${eventsEmail}` : ''}`;
      const res = await apiRequest('GET', url);
      return res.json();
    }
  });

  // Suppression list query
  const { 
    data: suppressionData, 
    isLoading: suppressionLoading, 
    refetch: refetchSuppression 
  } = useQuery({
    queryKey: [
      '/api/admin/email/suppression-list', 
      suppressionPage, 
      suppressionLimit, 
      suppressionEmail,
      suppressionReason,
      suppressionActive
    ],
    queryFn: async () => {
      const url = `/api/admin/email/suppression-list?page=${suppressionPage}&limit=${suppressionLimit}${suppressionEmail ? `&email=${suppressionEmail}` : ''}${suppressionReason ? `&reason=${suppressionReason}` : ''}${suppressionActive !== undefined ? `&active=${suppressionActive}` : ''}`;
      const res = await apiRequest('GET', url);
      return res.json();
    }
  });

  // Email stats query
  const { 
    data: statsData, 
    isLoading: statsLoading,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['/api/admin/email/email-stats', statsTimeframe],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/admin/email/email-stats`);
      return res.json();
    }
  });

  // Add to suppression list mutation
  const addToSuppression = useMutation({
    mutationFn: async (data: { email: string; reason: string }) => {
      const res = await apiRequest('POST', '/api/admin/email/suppression-list', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Email added to suppression list',
        variant: 'default',
      });
      setShowAddDialog(false);
      setNewEmail('');
      setNewReason('');
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/suppression-list'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/email-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add email to suppression list',
        variant: 'destructive',
      });
    }
  });

  // Update suppression entry mutation
  const updateSuppression = useMutation({
    mutationFn: async (data: { email: string; active: boolean }) => {
      const res = await apiRequest('PUT', `/api/admin/email/suppression-list/${data.email}`, { active: data.active });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Suppression status updated',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/suppression-list'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/email-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update suppression status',
        variant: 'destructive',
      });
    }
  });

  // Remove from suppression list mutation
  const removeFromSuppression = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest('DELETE', `/api/admin/email/suppression-list/${email}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Email removed from suppression list',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/suppression-list'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/email-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove email from suppression list',
        variant: 'destructive',
      });
    }
  });

  const handleAddToSuppression = () => {
    if (!newEmail) {
      toast({
        title: 'Error',
        description: 'Email is required',
        variant: 'destructive',
      });
      return;
    }
    
    addToSuppression.mutate({ 
      email: newEmail,
      reason: newReason || 'manually added'
    });
  };

  const handleRemoveFromSuppression = (email: string) => {
    if (confirm(`Are you sure you want to remove ${email} from the suppression list?`)) {
      removeFromSuppression.mutate(email);
    }
  };

  const handleToggleSuppressionStatus = (email: string, currentActive: boolean) => {
    updateSuppression.mutate({ 
      email,
      active: !currentActive
    });
  };

  const handleRefresh = () => {
    if (activeTab === 'events') {
      refetchEvents();
    } else if (activeTab === 'suppression') {
      refetchSuppression();
    } else if (activeTab === 'stats') {
      refetchStats();
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'email.sent':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'email.delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'email.opened':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'email.clicked':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'email.complained':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'email.bounced':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };
  
  const getEventTypeBadge = (type: string) => {
    let color = '';
    switch (type) {
      case 'email.sent':
        color = 'bg-blue-100 text-blue-800';
        break;
      case 'email.delivered':
        color = 'bg-green-100 text-green-800';
        break;
      case 'email.opened':
        color = 'bg-indigo-100 text-indigo-800';
        break;
      case 'email.clicked':
        color = 'bg-purple-100 text-purple-800';
        break;
      case 'email.complained':
        color = 'bg-orange-100 text-orange-800';
        break;
      case 'email.bounced':
        color = 'bg-red-100 text-red-800';
        break;
      default:
        color = 'bg-gray-100 text-gray-800';
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {getEventTypeIcon(type)}
        <span className="ml-1">{type.replace('email.', '')}</span>
      </span>
    );
  };

  // Reset pagination when filters change
  useEffect(() => {
    setEventsPage(1);
  }, [eventsType, eventsEmail, eventsLimit]);

  useEffect(() => {
    setSuppressionPage(1);
  }, [suppressionEmail, suppressionReason, suppressionActive, suppressionLimit]);

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Email Management</CardTitle>
          <CardDescription>
            Monitor email events, manage suppression list, and view email statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="events" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="events">Email Events</TabsTrigger>
                <TabsTrigger value="suppression">Suppression List</TabsTrigger>
                <TabsTrigger value="stats">Email Stats</TabsTrigger>
              </TabsList>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="ml-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            {/* Email Events Tab */}
            <TabsContent value="events">
              <div className="mb-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="event-type-filter">Event Type</Label>
                  <select
                    id="event-type-filter"
                    className="w-full p-2 border rounded"
                    value={eventsType}
                    onChange={(e) => setEventsType(e.target.value)}
                  >
                    <option value="">All Events</option>
                    <option value="email.sent">Sent</option>
                    <option value="email.delivered">Delivered</option>
                    <option value="email.opened">Opened</option>
                    <option value="email.clicked">Clicked</option>
                    <option value="email.bounced">Bounced</option>
                    <option value="email.complained">Complained</option>
                  </select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="event-email-filter">Email Contains</Label>
                  <div className="flex">
                    <Input
                      id="event-email-filter"
                      placeholder="Filter by email"
                      value={eventsEmail}
                      onChange={(e) => setEventsEmail(e.target.value)}
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="ml-2"
                      onClick={() => setEventsEmail('')}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableCaption>List of email events</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventsLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <div className="flex justify-center items-center">
                            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                            <span className="ml-2">Loading...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : eventsData?.events?.length ? (
                      eventsData.events.map((event: EmailEvent) => (
                        <TableRow key={event._id}>
                          <TableCell>{getEventTypeBadge(event.type)}</TableCell>
                          <TableCell className="font-medium">{event.data.to}</TableCell>
                          <TableCell>{event.data.subject || 'N/A'}</TableCell>
                          <TableCell>
                            {new Date(event.timestamp).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          No email events found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination for events */}
              {eventsData?.pagination && eventsData.pagination.total > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((eventsData.pagination.page - 1) * eventsData.pagination.limit) + 1} to {Math.min(eventsData.pagination.page * eventsData.pagination.limit, eventsData.pagination.total)} of {eventsData.pagination.total} results
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEventsPage(Math.max(1, eventsPage - 1))}
                          disabled={eventsPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span>Previous</span>
                        </Button>
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, eventsData.pagination.pages) }, (_, i) => {
                        const pageNumber = eventsPage <= 3
                          ? i + 1
                          : eventsPage >= eventsData.pagination.pages - 2
                            ? eventsData.pagination.pages - 4 + i
                            : eventsPage - 2 + i;
                        
                        if (pageNumber <= 0 || pageNumber > eventsData.pagination.pages) return null;
                        
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              isActive={pageNumber === eventsPage}
                              onClick={() => setEventsPage(pageNumber)}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {eventsData.pagination.pages > 5 && eventsPage < eventsData.pagination.pages - 2 && (
                        <>
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => setEventsPage(eventsData.pagination.pages)}
                            >
                              {eventsData.pagination.pages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}
                      
                      <PaginationItem>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEventsPage(Math.min(eventsData.pagination.pages, eventsPage + 1))}
                          disabled={eventsPage === eventsData.pagination.pages}
                        >
                          <span>Next</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </TabsContent>
            
            {/* Suppression List Tab */}
            <TabsContent value="suppression">
              <div className="mb-4 flex justify-between items-end flex-wrap gap-4">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="flex-1">
                    <Label htmlFor="suppression-email-filter">Email Contains</Label>
                    <div className="flex">
                      <Input
                        id="suppression-email-filter"
                        placeholder="Filter by email"
                        value={suppressionEmail}
                        onChange={(e) => setSuppressionEmail(e.target.value)}
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="ml-2"
                        onClick={() => setSuppressionEmail('')}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="suppression-reason-filter">Reason Contains</Label>
                    <Input
                      id="suppression-reason-filter"
                      placeholder="Filter by reason"
                      value={suppressionReason}
                      onChange={(e) => setSuppressionReason(e.target.value)}
                    />
                  </div>
                  <div className="flex-initial">
                    <Label htmlFor="suppression-status-filter">Status</Label>
                    <select
                      id="suppression-status-filter"
                      className="w-full p-2 border rounded"
                      value={suppressionActive ? 'active' : 'inactive'}
                      onChange={(e) => setSuppressionActive(e.target.value === 'active')}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex-none">
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Suppression
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Email to Suppression List</DialogTitle>
                      <DialogDescription>
                        Add an email address to the suppression list to prevent sending emails to it.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="new-email">Email Address</Label>
                        <Input
                          id="new-email"
                          placeholder="example@domain.com"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-reason">Reason (optional)</Label>
                        <Input
                          id="new-reason"
                          placeholder="Why is this email being suppressed?"
                          value={newReason}
                          onChange={(e) => setNewReason(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button 
                        onClick={handleAddToSuppression}
                        disabled={addToSuppression.isPending}
                      >
                        {addToSuppression.isPending && (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Add to Suppression
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableCaption>Email suppression list</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppressionLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex justify-center items-center">
                            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                            <span className="ml-2">Loading...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : suppressionData?.suppressionList?.length ? (
                      suppressionData.suppressionList.map((entry: SuppressionEntry) => (
                        <TableRow key={entry._id}>
                          <TableCell className="font-medium">{entry.email}</TableCell>
                          <TableCell>{entry.reason}</TableCell>
                          <TableCell>
                            {new Date(entry.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={entry.active ? "default" : "outline"}
                              className={entry.active ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                            >
                              {entry.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleToggleSuppressionStatus(entry.email, entry.active)}
                                disabled={updateSuppression.isPending}
                              >
                                {entry.active ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleRemoveFromSuppression(entry.email)}
                                disabled={removeFromSuppression.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No suppression entries found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination for suppression list */}
              {suppressionData?.pagination && suppressionData.pagination.total > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((suppressionData.pagination.page - 1) * suppressionData.pagination.limit) + 1} to {Math.min(suppressionData.pagination.page * suppressionData.pagination.limit, suppressionData.pagination.total)} of {suppressionData.pagination.total} results
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setSuppressionPage(Math.max(1, suppressionPage - 1))}
                          disabled={suppressionPage === 1}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, suppressionData.pagination.pages) }, (_, i) => {
                        const pageNumber = suppressionPage <= 3
                          ? i + 1
                          : suppressionPage >= suppressionData.pagination.pages - 2
                            ? suppressionData.pagination.pages - 4 + i
                            : suppressionPage - 2 + i;
                        
                        if (pageNumber <= 0 || pageNumber > suppressionData.pagination.pages) return null;
                        
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              isActive={pageNumber === suppressionPage}
                              onClick={() => setSuppressionPage(pageNumber)}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {suppressionData.pagination.pages > 5 && suppressionPage < suppressionData.pagination.pages - 2 && (
                        <>
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => setSuppressionPage(suppressionData.pagination.pages)}
                            >
                              {suppressionData.pagination.pages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setSuppressionPage(Math.min(suppressionData.pagination.pages, suppressionPage + 1))}
                          disabled={suppressionPage === suppressionData.pagination.pages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </TabsContent>
            
            {/* Email Stats Tab */}
            <TabsContent value="stats">
              {statsLoading ? (
                <div className="py-20 text-center">
                  <RefreshCw className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                  <p>Loading email statistics...</p>
                </div>
              ) : statsData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Events by Type */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Events by Type</CardTitle>
                      <CardDescription>Distribution of email events by type</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {statsData.eventsByType?.map((stat: any) => (
                          <div key={stat._id} className="flex items-center">
                            <div className="w-36">
                              {getEventTypeBadge(stat._id)}
                            </div>
                            <div className="flex-1 ml-4">
                              <div className="bg-gray-200 rounded-full h-4">
                                <div 
                                  className={`h-4 rounded-full ${
                                    stat._id === 'email.delivered' ? 'bg-green-500' : 
                                    stat._id === 'email.opened' ? 'bg-blue-500' : 
                                    stat._id === 'email.clicked' ? 'bg-purple-500' : 
                                    stat._id === 'email.bounced' ? 'bg-red-500' : 
                                    stat._id === 'email.complained' ? 'bg-orange-500' : 
                                    'bg-blue-500'
                                  }`}
                                  style={{ 
                                    width: `${Math.min(100, (stat.count / (statsData.eventsByType[0]?.count || 1)) * 100)}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="ml-4 w-16 text-right font-semibold">
                              {stat.count}
                            </div>
                          </div>
                        ))}
                        
                        {(!statsData.eventsByType || statsData.eventsByType.length === 0) && (
                          <div className="text-center py-8 text-muted-foreground">
                            No email events data available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Suppression Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Suppression List</CardTitle>
                      <CardDescription>Email suppression list statistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-3xl font-bold text-blue-600">
                            {statsData.suppression?.total || 0}
                          </div>
                          <div className="text-sm text-blue-600">Total Entries</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-3xl font-bold text-green-600">
                            {statsData.suppression?.active || 0}
                          </div>
                          <div className="text-sm text-green-600">Active Entries</div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="text-sm font-semibold mb-2">Status Breakdown</h4>
                        <div className="bg-gray-200 rounded-full h-4">
                          {statsData.suppression?.total > 0 && (
                            <div 
                              className="h-4 rounded-full bg-green-500"
                              style={{ 
                                width: `${(statsData.suppression.active / statsData.suppression.total) * 100}%` 
                              }}
                            ></div>
                          )}
                        </div>
                        <div className="flex justify-between mt-2 text-xs">
                          <span>Active: {statsData.suppression?.active || 0}</span>
                          <span>Inactive: {(statsData.suppression?.total || 0) - (statsData.suppression?.active || 0)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  Failed to load email statistics
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetchStats()}
                    className="mt-2 mx-auto block"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailManagement;