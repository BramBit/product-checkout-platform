import { httpClient } from './httpClient';
import type { Product } from '../features/product/productSlice';

export interface Transaction {
  id: string;
  productId: string;
  customerId: string;
  deliveryId: string;
  quantity: number;
  productAmountInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  totalAmountInCents: number;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
  wompiTransactionId: string | null;
  wompiStatusDetail: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDTO {
  fullName: string;
  email: string;
  phone: string;
  documentId: string;
}

export interface CreateDeliveryDTO {
  customerId: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
}

export interface CreateTransactionDTO {
  productId: string;
  quantity: number;
  customerId: string;
  deliveryId: string;
  cardToken: string;
  installments: number;
  customerEmail: string;
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await httpClient.get<Product[]>('/products');
  return response.data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const response = await httpClient.get<Product>(`/products/${id}`);
  return response.data;
};

export const createCustomer = async (
  data: CreateCustomerDTO
): Promise<{ id: string }> => {
  const response = await httpClient.post<{ id: string }>('/customers', data);
  return response.data;
};

export const createDelivery = async (
  data: CreateDeliveryDTO
): Promise<{ id: string }> => {
  const response = await httpClient.post<{ id: string }>('/deliveries', data);
  return response.data;
};

export const createTransaction = async (
  data: CreateTransactionDTO
): Promise<Transaction> => {
  const response = await httpClient.post<Transaction>('/transactions', data);
  return response.data;
};

export const getTransactionStatus = async (id: string): Promise<Transaction> => {
  const response = await httpClient.get<Transaction>(`/transactions/${id}`);
  return response.data;
};
