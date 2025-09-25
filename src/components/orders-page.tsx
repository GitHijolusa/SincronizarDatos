"use client";

import { useState, useEffect, useMemo, type ChangeEvent } from 'react';
import Image from 'next/image';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { mockOrders } from '@/lib/mock-data';
import type { Order, OrderStatus } from '@/lib/types';
import { StatusBadge } from '@/components/status-badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ALL_STATUSES = 'All';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>(ALL_STATUSES);
  const { toast } = useToast();
  
  const fetchOrders = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setOrders(mockOrders);
      setIsLoading(false);
      toast({
        title: 'Orders Synced',
        description: `${mockOrders.length} orders have been successfully synced.`,
      });
    }, 1500);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    toast({
        title: 'Order Status Updated',
        description: `Order ${orderId} status changed to ${newStatus}.`,
    });
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === ALL_STATUSES || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const orderStatuses: (OrderStatus | 'All')[] = [ALL_STATUSES, 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const getAvatar = (avatarId: string) => {
    const image = PlaceHolderImages.find(img => img.id === avatarId);
    return image || { imageUrl: 'https://picsum.photos/seed/placeholder/40/40', imageHint: 'placeholder' };
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h1 className="text-3xl font-bold text-foreground">Realtime Orders Sync</h1>
            <Button onClick={fetchOrders} disabled={isLoading}>
              <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
              {isLoading ? 'Syncing...' : 'Sync Orders'}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Orders</CardTitle>
              <CardDescription>View, manage, and update your orders in real-time.</CardDescription>
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-auto flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Order ID or Customer..."
                    className="pl-9 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value: OrderStatus | 'All') => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <Skeleton className="h-5 w-32" />
                            </div>
                          </TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-10 w-32 ml-auto rounded-md" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => {
                        const avatar = getAvatar(order.customer.avatarId);
                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Image
                                  src={avatar.imageUrl}
                                  alt={order.customer.name}
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover"
                                  data-ai-hint={avatar.imageHint}
                                />
                                <span className="font-medium">{order.customer.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{format(new Date(order.date), 'PP')}</TableCell>
                            <TableCell>${order.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <StatusBadge status={order.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              <Select
                                value={order.status}
                                onValueChange={(newStatus: OrderStatus) =>
                                  handleStatusChange(order.id, newStatus)
                                }
                              >
                                <SelectTrigger className="w-36 ml-auto">
                                  <SelectValue placeholder="Update status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {orderStatuses.slice(1).map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                          No orders found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
