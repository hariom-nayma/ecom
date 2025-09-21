import { Product } from "./product.model";
import { User } from "./user.model";

export interface OrderItemResponseDTO {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    imageUrl?: string;
}

export interface OrderStatusHistoryDTO {
    status: string;
    timestamp: string;
}

export enum OrderStatus {
    PENDING = 'PLACED',
    PROCESSING = 'PACKED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    RETURN_REQUESTED = 'RETURN_REQUESTED',
    RETURNED = 'RETURNED'
}

export interface Order {
    id: number;
    user: User; // Added User object
    userEmail: string;
    createdAt: string;
    savings: number;
    shippingAddress: string;
    totalAmount: number;
    withoutDiscountAmount: number;
    status: OrderStatus;
    items: OrderItemResponseDTO[];
    statusHistory: OrderStatusHistoryDTO[];
    deliveryDate?: string;
}
