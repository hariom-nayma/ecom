import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../product.service';
import { Product } from '../../shared/models/product.model';
import { CartService, CartItem } from '../../cart/cart.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | undefined;
  cartItems: CartItem[] = [];
  private cartSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProductById(id).subscribe(data => {
      this.product = data;
    });

    this.cartSubscription = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  getProductQuantity(productId: string): number {
    const item = this.cartItems.find(i => i.product.id.toString() === productId);
    return item ? item.quantity : 0;
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  increaseQuantity(product: Product): void {
    this.cartService.addToCart(product); // addToCart also handles incrementing quantity
  }

  decreaseQuantity(productId: string): void {
    if (this.product) {
      this.cartService.decreaseQuantity(productId);
    }
  }
}