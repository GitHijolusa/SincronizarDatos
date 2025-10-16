

export type OrderStatus = 'Pendiente' | 'Procesando' | 'Completado' | 'Compra';
export type SelectedTab = 'ayer' | 'hoy' | 'mañana' | 'pasado mañana' | 'hace2dias' | 'hace3dias';


export interface Product {
  numPedido: any;
  productos: never[];
  linea: number;
  name: string;
  quantity: number;
  Kg: number;
  Palets: number;
  Cajas: number;
  ModeloPalets: string;
  ModeloCajas: string;
  description: string;
  checkState?: 'unchecked' | 'checked' | 'confirmed';
  note?: string;
  subProductos?: Product[];
  plataforma?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerId?: string;
  numPedidoCliente?: string;
  timePlaced: Date;
  status: OrderStatus;
  products: Product[];
  shippingAddress: string;
  purchaseOrder: string;
  isManual?: boolean;
  horasCarga?: string[];
}

export interface ManualOrderProduct {
    name: string;
    palets: number;
    cajas: number;
}

export interface ManualOrder {
    customerName: string;
    chargeDate: Date;
    products: ManualOrderProduct[];
}

export interface LeftoverProduct {
    id: string;
    customer: string;
    week: string;
    products: ManualOrderProduct[];
    createdAt: string;
}

export interface ProductsByClient {
    [clientId: string]: string[];
}

export interface OrderBoardProps {
    orderType: 'venta' | 'compra';
    selectedDate: string;
    onCountsChange: (counts: { Pendiente: number; Procesando: number; Completado: number }) => void;
    customerType?: 'mercadona';
}

export interface Expedicion {
  Numero: string;
  FechaEnvio: string;
  HoraCarga: string;
  Plataforma: string;
  No: string;
  NumPaletsCompleto: number;
  NumCajasPico: number;
}

export interface ProductoExpedicion {
  No: string;
  NumPaletsCompleto: number;
  NumCajasPico: number;
}

export interface ExpedicionPorPlataforma {
  plataforma: string;
  productos: ProductoExpedicion[];
}

export interface ExpedicionAgrupada {
  horaCarga: string;
  plataformas: ExpedicionPorPlataforma[];
}

export interface FlatExpedicion {
    hora: string;
    plataforma: string;
    productos: ProductoExpedicion[];
    isFirstInGroup: boolean;
}
    