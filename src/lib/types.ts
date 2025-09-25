export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export type Order = {
  id: string;
  customer: {
    name: string;
    avatarId: string;
  };
  date: string;
  status: OrderStatus;
  amount: number;
};
