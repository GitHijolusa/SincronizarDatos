import type { Order } from './types';

export const mockOrders: Order[] = [
  {
    id: 'ORD001',
    customer: { name: 'John Doe', avatarId: 'customer-avatar-1' },
    date: '2023-10-26T10:00:00Z',
    status: 'Delivered',
    amount: 150.50,
  },
  {
    id: 'ORD002',
    customer: { name: 'Jane Smith', avatarId: 'customer-avatar-2' },
    date: '2023-10-25T14:30:00Z',
    status: 'Shipped',
    amount: 200.00,
  },
  {
    id: 'ORD003',
    customer: { name: 'Michael Johnson', avatarId: 'customer-avatar-3' },
    date: '2023-10-25T09:15:00Z',
    status: 'Processing',
    amount: 75.20,
  },
  {
    id: 'ORD004',
    customer: { name: 'Emily Davis', avatarId: 'customer-avatar-4' },
    date: '2023-10-24T18:45:00Z',
    status: 'Pending',
    amount: 300.75,
  },
  {
    id: 'ORD005',
    customer: { name: 'Chris Brown', avatarId: 'customer-avatar-5' },
    date: '2023-10-23T11:00:00Z',
    status: 'Cancelled',
    amount: 50.00,
  },
    {
    id: 'ORD006',
    customer: { name: 'Olivia Wilson', avatarId: 'customer-avatar-6' },
    date: '2023-10-22T16:20:00Z',
    status: 'Delivered',
    amount: 120.00,
  },
  {
    id: 'ORD007',
    customer: { name: 'Daniel Martinez', avatarId: 'customer-avatar-7' },
    date: '2023-10-21T08:05:00Z',
    status: 'Shipped',
    amount: 85.90,
  },
  {
    id: 'ORD008',
    customer: { name: 'Sophia Anderson', avatarId: 'customer-avatar-8' },
    date: '2023-10-20T12:00:00Z',
    status: 'Processing',
    amount: 250.00,
  },
];
