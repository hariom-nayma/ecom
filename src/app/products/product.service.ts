import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../shared/models/product.model';
import { ProductCategory } from '../shared/models/category.model';

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // current page number
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productApiUrl = 'http://localhost:8080/api/products';
  private categoryApiUrl = 'http://localhost:8080/api/products/categories';

  constructor(private http: HttpClient) { }

  getAllProducts(
    page: number = 0,
    size: number = 10,
    keyword?: string,
    category?: string,
    brands?: string[],
    minRating?: number,
    minDiscount?: number,
    maxDiscount?: number,
    maxPrice?: number, // New parameter
    sortBy?: string
  ): Observable<Page<Product>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (keyword) {
      params = params.set('keyword', keyword);
    }
    if (category) {
      params = params.set('category', category);
    }
    if (brands && brands.length > 0) {
      brands.forEach(brand => { params = params.append('brands', brand); });
    }
    if (minRating) {
      params = params.set('minRating', minRating.toString());
    }
    if (minDiscount) {
      params = params.set('minDiscount', minDiscount.toString());
    }
    if (maxDiscount) {
      params = params.set('maxDiscount', maxDiscount.toString());
    }
    if (maxPrice) { // New condition
      params = params.set('maxPrice', maxPrice.toString());
    }
    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }

    return this.http.get<Page<Product>>(this.productApiUrl, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.productApiUrl}/${id}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.productApiUrl, product);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.productApiUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.productApiUrl}/${id}`);
  }

  getCategories(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(this.categoryApiUrl);
  }
}
