import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | undefined;
  similarProducts: Product[] = [];
  cartItems: CartItem[] = [];
  private cartSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.productService.getProductById(id).subscribe(data => {
        this.product = data;
        this.loadSimilarProducts();
      });
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

  loadSimilarProducts(): void {
    if (this.product) {
      this.productService.getProductsByCategory(this.product.categoryName, 0, 5).subscribe(products => {
        this.similarProducts = products.filter(p => p.id !== this.product?.id).slice(0, 4);
      });
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
    const item = this.cartItems.find(i => i.product.id.toString() === product.id.toString());
    if (item && item.quantity >= product.stock) {
      return; // Or show a message
    }
    this.cartService.addToCart(product);
  }

  decreaseQuantity(productId: string): void {
    if (this.product) {
      this.cartService.decreaseQuantity(productId);
    }
  }
}