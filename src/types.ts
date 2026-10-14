export type ProductCategory = 
  | 'salgados'
  | 'especiais'
  | 'doces'
  | 'combos'
  | 'bebidas'
  | 'porcoes';

export interface ExtraOption {
  id: string;
  name: string;
  price: number;
  category: 'recheio' | 'molho' | 'borda' | 'massa';
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  available: boolean;
  isPopular?: boolean;
  badge?: string;
  imageUrl?: string;
  ingredients?: string[];
  sizeOptions?: {
    name: string;
    priceDelta: number;
  }[];
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  selectedSize?: {
    name: string;
    priceDelta: number;
  };
  extras: ExtraOption[];
  notes?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderType = 'delivery' | 'retirada' | 'mesa';
export type PaymentMethod = 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'vale_refeicao';
export type OrderStatus = 'novo' | 'em_preparo' | 'pronto' | 'entregue' | 'cancelado';

export interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  tableNumber?: string;
  deliveryAddress?: {
    street: string;
    number: string;
    neighborhood: string;
    complement?: string;
    reference?: string;
  };
  paymentMethod: PaymentMethod;
  needChangeFor?: number;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  slogan: string;
  whatsappNumber: string;
  pixKey: string;
  pixKeyType: 'telefone' | 'cpf' | 'cnpj' | 'email' | 'aleatoria';
  address: string;
  openingHours: string;
  defaultDeliveryFee: number;
  isOpen: boolean;
  soundAlertsEnabled: boolean;
  minOrderValue: number;
  instagram?: string;
}

export type UserRole = 'ADMIN' | 'GERENTE' | 'ATENDENTE';

export interface AppUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  createdAt: string;
}
