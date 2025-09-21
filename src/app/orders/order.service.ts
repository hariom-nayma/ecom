import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../shared/models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/orders';
  private adminApiUrl = 'http://localhost:8080/api/admin/orders';

  constructor(private http: HttpClient) { }


  private orderStatuses: string[] = [
    'PLACED',
    'CONFIRMED',
    'SHIPPED',
    'DELIVERED',
    'RETURNED',
    'CANCELLED'
  ];

  getOrderStatusIndex(status: string): number {
    return this.orderStatuses.indexOf(status);
  }

  createOrder(order: any): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  getOrderById(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`);
  }

  getOrdersForUser(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.adminApiUrl);
  }

  updateOrderStatus(orderId: number, statusUpdate: any): Observable<Order> {
    return this.http.put<Order>(`${this.adminApiUrl}/${orderId}/status`, {"status":statusUpdate});
  }

  cancelOrder(orderId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${orderId}`);
  }

  cancelOrderForAdmin(orderId: number): Observable<void> {
    return this.http.delete<void>(`${this.adminApiUrl}/${orderId}`);
  }

  getInvoice(orderId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${orderId}/invoice`, {
      responseType: 'blob'
    });
  }

  returnOrder(orderId: number): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/return`, {});
  }
}
