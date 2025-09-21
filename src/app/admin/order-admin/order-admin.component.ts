import { Component, OnInit, ViewChild, AfterViewInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { OrderService } from '../../orders/order.service';
import { Order, OrderStatus } from '../../shared/models/order.model'; // Import OrderStatus
import { ProductService } from '../../products/product.service';
import { forkJoin } from 'rxjs';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-order-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatSortModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    MatListModule
  ],
  templateUrl: './order-admin.component.html',
  styleUrls: ['./order-admin.component.css']
})
export class OrderAdminComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'status', 'actions'];
  dataSource: MatTableDataSource<Order> = new MatTableDataSource();
  orderStatues: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED]; // Updated to use OrderStatus enum

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('orderDetailsDialog') orderDetailsDialog!: TemplateRef<any>;

  constructor(
    private orderService: OrderService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private productService: ProductService,
    private admin: AdminService
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

getNextStatus(current: OrderStatus): OrderStatus | null { // Changed type to OrderStatus
  const idx = this.orderStatues.indexOf(current);
  if (idx !== -1 && current !== OrderStatus.DELIVERED && current !== OrderStatus.CANCELLED) { // Use OrderStatus enum
    return this.orderStatues[idx + 1];
  }
  return null;
}

canMoveToNext(order: Order): boolean {
  return !!this.getNextStatus(order.status) && order.status !== OrderStatus.CANCELLED; // Use OrderStatus enum
}

moveToNextStatus(order: Order): void {
  const next = this.getNextStatus(order.status);
  if (next) {
    this.orderService.updateOrderStatus(order.id, next).subscribe(() => {
      order.status = next; // next is already OrderStatus
      this.snackBar.open(`Order ${order.id} moved to ${next}`, 'Close', { duration: 3000 });
    });
  }
}

cancelOrder(order: Order): void {
  if (order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.DELIVERED) { // Use OrderStatus enum
    this.orderService.updateOrderStatus(order.id, OrderStatus.CANCELLED).subscribe(() => { // Use OrderStatus enum
      order.status = OrderStatus.CANCELLED; // Use OrderStatus enum
      this.snackBar.open(`Order ${order.id} cancelled`, 'Close', { duration: 3000 });
    });
  }
}

cancelOrderForAdmin(order: Order): void {
  if (order.status !== OrderStatus.DELIVERED) {
    this.orderService.cancelOrderForAdmin(order.id).subscribe(() => {
      order.status = OrderStatus.CANCELLED;
      this.snackBar.open(`Order ${order.id} cancelled`, 'Close', { duration: 3000 });
    });
  }
}


  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = (data: Order, filter: string) => {
      return data.id.toString().includes(filter) ||
             data.status.toLowerCase().includes(filter);
    };
  }

  loadOrders(): void {
    this.orderService.getAllOrders().subscribe(orders => {
      this.dataSource.data = orders;
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onStatusChange(order: Order, newStatus: OrderStatus): void { // Changed newStatus type to OrderStatus
    this.orderService.updateOrderStatus(order.id, newStatus).subscribe(() => {
      order.status = newStatus;
      this.snackBar.open(`Order ${order.id} status updated to ${newStatus}`, 'Close', { duration: 3000 });
    });
  }

  viewOrderDetails(order: Order): void {
    if (order.items.length > 0) {
      const productObservables = order.items.map(item =>
        this.productService.getProductById(item.productId)
      );

      forkJoin(productObservables).subscribe(products => {
        order.items.forEach((item, index) => {
          item.imageUrl = products[index].imageUrl;
        });
        this.dialog.open(this.orderDetailsDialog, {
          width: '600px',
          data: order
        });
      });
    } else {
      this.dialog.open(this.orderDetailsDialog, {
        width: '600px',
        data: order
      });
    }
  }

 returnRequestAccept(order: any){
  this.admin.acceptReturnRequest(order.id).subscribe(() => {
    order.status = OrderStatus.RETURNED;
    this.snackBar.open(`Return request for Order ${order.id} accepted`, 'Close', { duration: 3000 });
  });

 }

  
}