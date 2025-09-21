import { Component, OnInit } from '@angular/core';
import { OrderService } from '../order.service';
import { Order } from '../../shared/models/order.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ProductService } from 'C:/Users/hario/Projects/Ordertracking/ecom-frontend/src/app/products/product.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatTableModule, MatCardModule, MatButtonModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  displayedColumns: string[] = ['productImage', 'id', 'createdAt', 'totalAmount', 'status', 'actions'];

  constructor(private orderService: OrderService, private productService: ProductService) { }

  ngOnInit(): void {
    this.orderService.getOrdersForUser().subscribe(data => {
      this.orders = data;
      this.orders.forEach(order => {
        if (order.items.length > 0) {
          this.productService.getProductById(order.items[0].productId).subscribe(product => {
            order.items[0].imageUrl = product.imageUrl;
          });
        }
      });
    });
  }
}
