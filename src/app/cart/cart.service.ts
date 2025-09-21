import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../shared/models/product.model'; // Assuming Product model path

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
 
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  constructor() {
    // Load cart from local storage or initialize
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedCart = window.localStorage.getItem('cart');
      if (storedCart) {
        this.cartItemsSubject.next(JSON.parse(storedCart));
      }
    }
  }

  private saveCart(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('cart', JSON.stringify(this.cartItemsSubject.value));
    }
  }

  addToCart(product: Product): void {
    const currentItems = this.cartItemsSubject.value;
    const existingItem = currentItems.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      currentItems.push({ product, quantity: 1 });
    }
    this.cartItemsSubject.next(currentItems);
    this.saveCart();
  }

  decreaseQuantity(productId: string): void {
    const currentItems = this.cartItemsSubject.value;
    const existingItem = currentItems.find(item => item.product.id.toString() === productId);

    if (existingItem) {
      existingItem.quantity--;
      if (existingItem.quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        this.cartItemsSubject.next(currentItems);
        this.saveCart();
      }
    }
  }

  removeFromCart(productId: string): void {
    let currentItems = this.cartItemsSubject.value;
    currentItems = currentItems.filter(item => item.product.id.toString() !== productId);
    this.cartItemsSubject.next(currentItems);
    this.saveCart();
  }

  getCartItemQuantity(productId: string): number {
    const currentItems = this.cartItemsSubject.value;
    const existingItem = currentItems.find(item => item.product.id.toString() === productId);
    return existingItem ? existingItem.quantity : 0;
  }

  getCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  clearCart(): void {
    this.cartItemsSubject.next([]);
    this.saveCart();
  }
  getTotal(): number {
    let total = 0;
    const cartItems = this.cartItemsSubject.value;
    cartItems.forEach(item => {
      const discountedPrice = item.product.price * (1 - item.product.discountPercent / 100);
      total += discountedPrice * item.quantity;
    });
    return total;
  }

  getCartTotalQuantity(): number {
    return this.cartItemsSubject.value.reduce((total, item) => total + item.quantity, 0);
  }


}