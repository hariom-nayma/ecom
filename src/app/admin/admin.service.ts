import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductCategory } from '../shared/models/category.model';
import { User } from '../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private userApiUrl = 'http://localhost:8080/api/admin/users';
  private categoryApiUrl = 'http://localhost:8080/api/admin/categories';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.userApiUrl);
  }

  blockUser(id: number): Observable<any> {
    return this.http.put(`${this.userApiUrl}/${id}/block`, {});
  }

  unblockUser(id: number): Observable<any> {
    return this.http.put(`${this.userApiUrl}/${id}/unblock`, {});
  }

  createCategory(category: ProductCategory): Observable<ProductCategory> {
    return this.http.post<ProductCategory>(this.categoryApiUrl, category);
  }

  getAllCategories(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(this.categoryApiUrl);
  }

  updateCategory(id: number, category: ProductCategory): Observable<ProductCategory> {
    return this.http.put<ProductCategory>(`${this.categoryApiUrl}/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.categoryApiUrl}/${id}`);
  }

  acceptReturnRequest(id: number): Observable<any> {
    return this.http.put(`${this.userApiUrl}/${id}/accept-return`, {});
  }

  rejectReturnRequest(id: number): Observable<any> {
    return this.http.put(`${this.userApiUrl}/${id}/reject-return`, {});
  }
}