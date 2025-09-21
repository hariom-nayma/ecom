import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService, Page } from '../product.service';
import { Product } from '../../shared/models/product.model';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../cart/cart.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { ProductCategory } from '../../shared/models/category.model';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatTabsModule,
    MatSliderModule,
    MatCheckboxModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatRadioModule,
    MatPaginatorModule
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = []; // Now holds the products for the current page from server
  categories: ProductCategory[] = [];
  brands: string[] = [];
  cartItems: CartItem[] = [];
  private cartSubscription: Subscription | undefined;

  // Pagination
  totalElements: number = 0;
  pageSize: number = 12;
  pageIndex: number = 0;

  // Filters
  selectedCategoryName: string = '';
  selectedBrands: string[] = [];
  maxPrice: number = 500000;
  minDiscount: number = 0;
  inStockOnly: boolean = false;
  searchTerm: string = '';
  sortBy: string = 'price-asc';
  minRating: number = 0;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.productService.getCategories().subscribe(data => {
      this.categories = data;
    });

    this.cartSubscription = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });

    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['search'] || '';
      this.loadProducts(); // Initial load with potential search term
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  loadProducts(): void {
    this.productService.getAllProducts(
      this.pageIndex,
      this.pageSize,
      this.searchTerm || undefined,
      this.selectedCategoryName || undefined,
      this.selectedBrands.length > 0 ? this.selectedBrands : undefined,
      this.minRating > 0 ? this.minRating : undefined,
      this.minDiscount > 0 ? this.minDiscount : undefined,
      undefined, // maxDiscount is not implemented in frontend UI yet
      this.maxPrice < 500000 ? this.maxPrice : undefined, // Pass maxPrice to backend
      this.sortBy === 'price-asc' ? 'price_asc' :
      this.sortBy === 'price-desc' ? 'price_desc' :
      this.sortBy === 'rating-desc' ? 'rating_desc' :
      this.sortBy === 'newest' ? 'newest_first' :
      this.sortBy === 'name-asc' ? 'name_asc' :
      this.sortBy === 'name-desc' ? 'name_desc' :
      this.sortBy // default or other values
    ).subscribe((page: Page<Product>) => {
      this.products = page.content;
      this.totalElements = page.totalElements;
      // Extract brands from the current page's products if not already loaded
      if (this.brands.length === 0 && page.content.length > 0) {
        this.brands = [...new Set(page.content.map(p => p.brand))];
      }
    });
  }

  onFilterChange(): void {
    this.pageIndex = 0; // Reset to first page on filter change
    this.loadProducts();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  clearFilters(): void {
    this.selectedCategoryName = '';
    this.selectedBrands = [];
    this.minDiscount = 0;
    this.maxPrice = 500000;
    this.inStockOnly = false;
    this.minRating = 0;
    this.searchTerm = '';
    this.sortBy = 'price-asc';
    this.pageIndex = 0;
    this.loadProducts();
  }

  getProductQuantity(productId: string): number {
    const item = this.cartItems.find(i => i.product.id.toString() === productId);
    return item ? item.quantity : 0;
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  increaseQuantity(product: Product): void {
    this.cartService.addToCart(product);
  }

  decreaseQuantity(productId: string): void {
    this.cartService.decreaseQuantity(productId);
  }
}
