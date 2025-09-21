import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Address } from '../models/address.model';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  private apiUrl = 'http://localhost:8080/api/v1/users';

  constructor(private http: HttpClient) { }

  addAddress(userId: number, address: Address): Observable<Address> {
    return this.http.post<Address>(`${this.apiUrl}/${userId}/addresses`, address);
  }

  getAddresses(userId: number): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiUrl}/${userId}/addresses`);
  }

  deleteAddress(userId: number, addressId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}/addresses/${addressId}`);
  }
}
