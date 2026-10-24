import { MenuItem, ExtraOption, StoreSettings, Order } from '../types';

export const INITIAL_EXTRAS: ExtraOption[] = [
  { id: 'ext-catupiry', name: 'Catupiry Original', price: 4.5, category: 'recheio' },
  { id: 'ext-queijo', name: 'Mussarela Extra', price: 4.0, category: 'recheio' },
  { id: 'ext-bacon', name: 'Bacon Crocante', price: 3.5, category: 'recheio' },
  { id: 'ext-cheddar', name: 'Cheddar Cremoso', price: 3.5, category: 'recheio' },
  { id: 'ext-ovo', name: 'Ovo Picadinho', price: 2.0, category: 'recheio' },
  { id: 'ext-milho', name: 'Milho Verde', price: 2.0, category: 'recheio' },
  { id: 'ext-vinagrete', name: 'Vinagrete da Feira', price: 0.0, category: 'molho' },
  { id: 'ext-maioneseverde', name: 'Maionese Verde Artesanal', price: 2.5, category: 'molho' },
  { id: 'ext-pimenta', name: 'Molho de Pimenta da Casa', price: 1.5, category: 'molho' },
  { id: 'ext-massatradicional', name: 'Massa Tradicional Sequinha', price: 0.0, category: 'massa' },
  { id: 'ext-massapimenta', name: 'Massa Levemente Apimentada', price: 2.0, category: 'massa' },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // SALGADOS TRADICIONAIS
  {
    id: 'past-carne',
    name: 'Pastel de Carne Tradicional',
    description: 'Carne moída de primeira, ovo e azeitonas.',
    category: 'salgados',
    price: 14.0,
    available: true,
    isPopular: true,
    badge: 'Mais Pedido',
    ingredients: ['Carne moída de primeira', 'Ovo cozido', 'Azeitonas'],
    sizeOptions: [
      { name: 'Médio (20cm)', priceDelta: 0 },
      { name: 'Gigante (30cm)', priceDelta: 6 },
    ],
  },
  {
    id: 'past-queijo',
    name: 'Pastel de Queijo Especial',
    description: 'Mussarela selecionada e orégano.',
    category: 'salgados',
    price: 13.0,
    available: true,
    isPopular: true,
    ingredients: ['Mussarela selecionada', 'Orégano especial'],
    sizeOptions: [
      { name: 'Médio (20cm)', priceDelta: 0 },
      { name: 'Gigante (30cm)', priceDelta: 6 },
    ],
  },
  {
    id: 'past-pizza',
    name: 'Pastel de Pizza Paulista',
    description: 'Presunto, queijo, tomate e orégano.',
    category: 'salgados',
    price: 14.5,
    available: true,
    ingredients: ['Presunto', 'Mussarela', 'Tomate fresco', 'Orégano'],
    sizeOptions: [
      { name: 'Médio (20cm)', priceDelta: 0 },
      { name: 'Gigante (30cm)', priceDelta: 6 },
    ],
  },

  // ESPECIAIS GOURMET
  {
    id: 'past-camarao',
    name: 'Pastel de Camarão com Catupiry',
    description: 'Camarões frescos e Catupiry legítimo.',
    category: 'especiais',
    price: 22.0,
    available: true,
    badge: 'Gourmet',
    ingredients: ['Camarões frescos selecionados', 'Catupiry legítimo'],
    sizeOptions: [
      { name: 'Médio (20cm)', priceDelta: 0 },
      { name: 'Gigante (30cm)', priceDelta: 8 },
    ],
  },

  // DOCES
  {
    id: 'past-nutellamorango',
    name: 'Pastel de Nutella com Morango',
    description: 'Nutella pura e morangos frescos.',
    category: 'doces',
    price: 16.5,
    available: true,
    badge: 'Doce Especial',
    ingredients: ['Nutella pura de avelã', 'Morangos frescos fatiados'],
  },

  // BEBIDAS
  {
    id: 'beb-caldocana500',
    name: 'Caldo de Cana Gelado 500ml',
    description: 'Caldo de cana puro moído na hora e trincando de gelado.',
    category: 'bebidas',
    price: 8.0,
    available: true,
    badge: 'Geladinho',
    ingredients: ['Cana de açúcar fresca', 'Gelo filtrado'],
  },
  {
    id: 'beb-coca-lata',
    name: 'Coca-Cola Lata 350ml',
    description: 'Refrigerante Coca-Cola em lata 350ml super gelada.',
    category: 'bebidas',
    price: 6.0,
    available: true,
    ingredients: ['Refrigerante 350ml'],
  },

  // PORÇÕES
  {
    id: 'porc-minipasteis',
    name: 'Porção de Mini Pastéis (12 un)',
    description: '12 unidades crocantes sortidas (carne e queijo) acompanhadas de vinagrete e molho de pimenta da casa.',
    category: 'porcoes',
    price: 28.0,
    available: true,
    isPopular: true,
    badge: 'Para Compartilhar',
    ingredients: ['12 mini pastéis', 'Vinagrete da casa', 'Molho especial'],
  },
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Pastelaria Santo Grau',
  slogan: 'Massa artesanal sequinha, crocante e muito recheada!',
  whatsappNumber: '5511999998888',
  pixKey: '11999998888',
  pixKeyType: 'telefone',
  address: 'Rua do Comércio, 345 - Bairro Central',
  openingHours: 'Terça a Domingo: 17:00 às 23:30',
  defaultDeliveryFee: 5.0,
  isOpen: true,
  soundAlertsEnabled: true,
  minOrderValue: 15.0,
  instagram: '@pastelaria_santograu',
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 101,
    customerName: 'Mariana Silva',
    customerPhone: '11988887777',
    orderType: 'delivery',
    deliveryAddress: {
      street: 'Av. Brasil',
      number: '1420',
      neighborhood: 'Jardim das Flores',
      complement: 'Apto 42 Bloco B',
      reference: 'Próximo à pracinha',
    },
    paymentMethod: 'pix',
    items: [
      {
        id: 'cart-1',
        menuItem: INITIAL_MENU_ITEMS[0], // Pastel de Carne Tradicional
        selectedSize: { name: 'Médio (20cm)', priceDelta: 0 },
        extras: [
          { id: 'ext-catupiry', name: 'Catupiry Original', price: 4.5, category: 'recheio' },
          { id: 'ext-vinagrete', name: 'Vinagrete da Feira', price: 0.0, category: 'molho' },
        ],
        notes: 'Capricha no vinagrete por favor!',
        quantity: 2,
        unitPrice: 18.5,
        totalPrice: 37.0,
      },
      {
        id: 'cart-2',
        menuItem: INITIAL_MENU_ITEMS[5], // Caldo de Cana Gelado 500ml
        extras: [],
        notes: 'Com limão espremido',
        quantity: 2,
        unitPrice: 8.0,
        totalPrice: 16.0,
      },
    ],
    subtotal: 53.0,
    deliveryFee: 5.0,
    total: 58.0,
    status: 'novo',
    createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    notes: 'Campainha está com defeito, por favor buzinar.',
  },
  {
    id: 'ord-102',
    orderNumber: 102,
    customerName: 'Carlos Eduardo',
    customerPhone: '11977776666',
    orderType: 'mesa',
    tableNumber: 'Mesa 04',
    paymentMethod: 'cartao_credito',
    items: [
      {
        id: 'cart-3',
        menuItem: INITIAL_MENU_ITEMS[3], // Pastel de Camarão com Catupiry
        selectedSize: { name: 'Médio (20cm)', priceDelta: 0 },
        extras: [
          { id: 'ext-maioneseverde', name: 'Maionese Verde Artesanal', price: 2.5, category: 'molho' },
        ],
        quantity: 1,
        unitPrice: 24.5,
        totalPrice: 24.5,
      },
      {
        id: 'cart-4',
        menuItem: INITIAL_MENU_ITEMS[1], // Pastel de Queijo Especial
        selectedSize: { name: 'Gigante (30cm)', priceDelta: 6 },
        extras: [],
        quantity: 1,
        unitPrice: 19.0,
        totalPrice: 19.0,
      },
      {
        id: 'cart-5',
        menuItem: INITIAL_MENU_ITEMS[6], // Coca-Cola Lata 350ml
        extras: [],
        quantity: 2,
        unitPrice: 6.0,
        totalPrice: 12.0,
      },
    ],
    subtotal: 55.5,
    deliveryFee: 0,
    total: 55.5,
    status: 'em_preparo',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'ord-103',
    orderNumber: 103,
    customerName: 'Fernanda Lima',
    customerPhone: '11966665555',
    orderType: 'retirada',
    paymentMethod: 'dinheiro',
    needChangeFor: 50.0,
    items: [
      {
        id: 'cart-6',
        menuItem: INITIAL_MENU_ITEMS[4], // Pastel de Nutella com Morango
        extras: [],
        quantity: 2,
        unitPrice: 16.5,
        totalPrice: 33.0,
      },
    ],
    subtotal: 33.0,
    deliveryFee: 0,
    total: 33.0,
    status: 'pronto',
    createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    notes: 'Cliente ligou avisando que está a 5 minutos do balcão.',
  },
];
