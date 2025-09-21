import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
 
  private apiUrl = 'http://localhost:8080/api/auth';
  private tokenKey = 'authToken';
  private refreshTokenKey = 'refreshToken';

  private loggedIn = new BehaviorSubject<boolean>(this.isLoggedIn());
  isLoggedIn$ = this.loggedIn.asObservable();

  private userRole = new BehaviorSubject<string | null>(this.getUserRole());
  userRole$ = this.userRole.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any // 👈 detect browser
  ) {
    this.checkAuthStatus();
  }

  // ✅ Registration
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // ✅ Login (stores tokens)
  login(data: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/login`, data).pipe(
    tap(response => {
      console.log('Login response:', response);  // 👀 check if it's null or an object
      if (response?.accessToken) {
        this.setToken(response.accessToken);
        this.setRefreshToken(response.refreshToken);
        this.loggedIn.next(true);
        const decodedToken: any = jwtDecode(response.accessToken);
        this.userRole.next(decodedToken.role || null);
      }
    })
  );
}



  // ✅ OTP
  generateOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate-otp`, { email });
  }

  verifyOtp(email: string, otpCode: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, { email, otpCode });
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
    }
  

  // ✅ Refresh Token
  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<any>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(response => {
        this.setToken(response.accessToken);
        this.setRefreshToken(response.refreshToken);
      })
    );
  }

  // ✅ Logout
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      // localStorage.removeItem(this.refreshTokenKey);
      this.loggedIn.next(false);
      this.userRole.next(null);
    }
  }

  // --------------------------
  //   🔹 Token Handling
  // --------------------------
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(this.tokenKey);
      if (token) {
        const decodedToken: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          // Token expired, clear it
          this.logout();
          return null;
        }
      }
      return token;
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.refreshTokenKey);
    }
    return null;
  }

  private setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  private setRefreshToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.refreshTokenKey, token);
    }
  }

  private checkAuthStatus(): void {
    const loggedIn = this.isLoggedIn();
    const role = this.getUserRole();
    this.loggedIn.next(loggedIn);
    this.userRole.next(role);
  }

  // ✅ Logged-in check
  isLoggedIn(): boolean {
    console.log('isLoggedIn called');
    const isLoggedIn = !!this.getToken();
    console.log('isLoggedIn result:', isLoggedIn);
    return isLoggedIn;
  }

  // ✅ Extract role from JWT
  getUserRole(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.role || null;
    }
    return null;
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.userId || null;
    }
    return null;
  }
}
