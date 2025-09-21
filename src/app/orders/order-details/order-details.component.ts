import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../order.service';
import { Order, OrderStatus } from '../../shared/models/order.model'; // Import OrderStatus
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ProductService } from '../../products/product.service';
import { forkJoin } from 'rxjs';
import { WebsocketService } from '../../shared/services/websocket.service';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatListModule],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
  order: Order | undefined;
  savings: number = 0;
  step: number = 1; // Default to first step
  isTerminalStatus: boolean = false;
  public OrderStatus = OrderStatus; // Expose OrderStatus to the template

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private productService: ProductService,
    private websocketService: WebsocketService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getOrderById(id).subscribe(data => {
      this.order = data;
      this.calculateSavings();
      this.fetchProductImages();
      this.step = this.getStepNumber(this.order.status);
      this.isTerminalStatus = this.checkTerminalStatus(this.order.status);
    });

    this.websocketService.getNotificationObservable().subscribe({
      next: (payload) => {
        console.log('📩 Notification:', payload);
         this.orderService.getOrderById(id).subscribe(data => {
      this.order = data;
      this.calculateSavings();
      this.fetchProductImages();
      this.step = this.getStepNumber(this.order.status);
      this.isTerminalStatus = this.checkTerminalStatus(this.order.status);
    });
      }

    });
  }

  fetchProductImages(): void {
    if (this.order && this.order.items.length > 0) {
      const productObservables = this.order.items.map(item =>
        this.productService.getProductById(item.productId)
      );

      forkJoin(productObservables).subscribe(products => {
        this.order?.items.forEach((item, index) => {
          item.imageUrl = products[index].imageUrl;
        });
      });
    }
  }

  calculateSavings(): void {
    if (this.order) {
      const originalTotal = this.order.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      this.savings = originalTotal - this.order.totalAmount;
    }
  }

  getTimestampForStatus(status: OrderStatus): string | undefined { // Changed type to OrderStatus
    const historyEntry = this.order?.statusHistory.find(entry => entry.status === status);
    return historyEntry ? historyEntry.timestamp : undefined;
  }

  getStepNumber(status: OrderStatus): number { // Changed type to OrderStatus
    switch (status) {
      case OrderStatus.PENDING: // Use OrderStatus enum
      return 1; // Received
      case OrderStatus.PROCESSING: // Use OrderStatus enum
        return 2; // Confirmed
      case OrderStatus.SHIPPED: // Use OrderStatus enum
        return 3; // Packed
      case OrderStatus.DELIVERED: // Use OrderStatus enum
        return 4; // Picked up
      case OrderStatus.CANCELLED: // Use OrderStatus enum
      case OrderStatus.RETURN_REQUESTED: // Use OrderStatus enum
      case OrderStatus.RETURNED: // Use OrderStatus enum
        return 5; // Delivered (or terminal status)
      default:
        return 1; // Fallback
    }
  }

  checkTerminalStatus(status: OrderStatus): boolean { // Changed type to OrderStatus
    const terminalStatuses = [OrderStatus.CANCELLED, OrderStatus.RETURN_REQUESTED, OrderStatus.RETURNED]; // Use OrderStatus enum
    return terminalStatuses.includes(status);
  }

  downloadInvoice(): void {
    const orderId = this.order?.id;
    if (orderId) {
      this.orderService.getInvoice(orderId).subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_order_${orderId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
    }
  }

  isReturnable(): boolean {
    if (!this.order || this.order.status !== OrderStatus.DELIVERED) { // Use OrderStatus enum
      return false;
    }

    const deliveredHistory = this.order.statusHistory.find(history => history.status === OrderStatus.DELIVERED); // Use OrderStatus enum
    if (!deliveredHistory) {
      return false;
    }

    const deliveryDate = new Date(deliveredHistory.timestamp);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - deliveryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 7; // Returnable within 7 days of delivery
  }

  returnOrder(): void {
    if (this.order && this.isReturnable()) {
      this.orderService.returnOrder(this.order.id).subscribe(updatedOrder => {
        this.order = updatedOrder;
      });
    }
  }

  // inside OrderDetailsComponent (add these methods / fields)

getOriginalTotal(): number {
  if (!this.order) return 0;
  return this.order.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
}

// order-details.component.ts

getSavings(): number {
  return this.order?.savings || 0;
}

getSavingsPercent(): number {
  const original = (this.order?.totalAmount || 0) + this.getSavings();
  if (!original || this.getSavings() <= 0) return 0;
  return Math.round((this.getSavings() / original) * 100);
}


/**
 * Approximate per-item savings by distributing total savings proportionally
 * to each item's pre-discount share (only if you don't have item-specific discounts).
 */
getItemSavings(item: any): number {
  const original = this.getOriginalTotal();
  if (!original || this.getSavings() <= 0) return 0;
  const itemOriginal = (item.unitPrice || 0) * (item.quantity || 1);
  return Math.round((itemOriginal / original) * this.getSavings());
}

/** Toggle for breakdown panel */
showSavingsBreakdown = false;
toggleSavingsBreakdown(): void {
  this.showSavingsBreakdown = !this.showSavingsBreakdown;
}

}