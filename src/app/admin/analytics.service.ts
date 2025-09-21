import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../shared/models/user.model';
import { OrderStatus } from '../shared/models/order.model';
import { DailyRevenueDTO } from '../shared/models/daily-revenue.model';

export interface ProductSalesDTO {
  productName: string;        // matches backend
  totalQuantitySold: number;  // matches backend
}

import { BrandSalesDTO } from '../shared/models/brand-sales.model';

export interface OrderStatusDistributionDTO {
  status: string;
  count: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private base = 'http://localhost:8080/api/admin/analytics'; // fixed URL
  private apiUrl = 'http://localhost:8080/api/admin/analytics'; // fixed URL


  constructor(private http: HttpClient) {}

  // Total number of orders (sales)
  getTotalSales(): Observable<number> {
    return this.http.get<number>(`${this.base}/total-sales`);
  }
  getTotalProducts(): Observable<number> {
    return this.http.get<number>(`${this.base}/total-products`);
  }

  // Total revenue
  getTotalRevenue(): Observable<number> {
    return this.http.get<number>(`${this.base}/total-revenue`);
  }

  // getTotalUsers():Observable<number>{
  //     return this.http.get<number>(`${this.base}/total-users`);
  // }

  // Orders by status (pass status as param)
  getOrdersByStatus(status: string): Observable<number> {
    return this.http.get<number>(`${this.base}/orders-by-status`, {
      params: new HttpParams().set('status', status)
    });
  }

  // Top selling products
  getTopSellingProducts(): Observable<ProductSalesDTO[]> {
    return this.http.get<ProductSalesDTO[]>(`${this.base}/top-selling-products`);
  }

  // Least selling products
  getLeastSellingProducts(): Observable<ProductSalesDTO[]> {
    return this.http.get<ProductSalesDTO[]>(`${this.base}/least-selling-products`);
  }

  getOrderStatusDistribution(): Observable<OrderStatusDistributionDTO[]> {
    return this.http.get<OrderStatusDistributionDTO[]>(`${this.apiUrl}/order-status-distribution`);
  }

  getNewCustomersLast7Days(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/new-customers`);
  }

  getTotalUsers(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/total-users`);
  }

  getOrdersByStatusAndDate(status: OrderStatus, startDate?: string, endDate?: string): Observable<number> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    params = params.set('status', status);
    return this.http.get<number>(`${this.apiUrl}/orders-by-status-and-date`, { params });
  }

  getMonthlyRevenue(month?: string): Observable<DailyRevenueDTO[]> {
    let params = new HttpParams();
    if (month) {
      params = params.set('month', month);
    }
    return this.http.get<DailyRevenueDTO[]>(`${this.apiUrl}/monthly-revenue`, { params });
  }

  getTopSellingBrands(date?: string): Observable<BrandSalesDTO[]> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get<BrandSalesDTO[]>(`${this.apiUrl}/top-selling-brands`, { params });
  }
}
