import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth.interface';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from './../../environments/environment';

const url = `${environment.apiUrl}/user`;

@Injectable({
  providedIn: 'root'
})


export class UserService {

  private token;
  private authStatusList = new Subject<boolean>();

  private isAuthenticated = false;

  private tokenTimer: NodeJS.Timer;
  private userId: string;
  private email: string;

  constructor(private http: HttpClient, private router: Router) { }

  getToken() {
    return this.token;
  }

  getAuthStatusListener() {
    return this.authStatusList.asObservable();
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getUserEmail() {
    return this.email;
  }

  private saveAuthData(token: string, expirationDate: Date) {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', this.userId);
    localStorage.setItem('email', this.email);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
  }


  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('email');
    if (!token || !expirationDate) {
      return;
    }
    return { token, expirationDate: new Date(expirationDate), userId, email };
  }

  autoAuthUser() {
    const authInfo = this.getAuthData();
    if (!authInfo) {
      return;
    }
    const expiresIn = authInfo.expirationDate.getTime() - Date.now();
    if (expiresIn > 60000) {
      this.token = authInfo.token;
      this.isAuthenticated = true;
      this.authStatusList.next(true);
      this.userId = authInfo.userId;
      this.email = authInfo.email;
      this.setAuthTimer(expiresIn / 1000);
    }
  }


  createUser(email: string, password: string) {
    const user: AuthData = { email, password };
    this.http.post(`${url}/signup`, user)
    .subscribe(response => {
      this.router.navigate(['/login']);
      console.log(response);
    }, error => {
      this.authStatusList.next(false);
      console.log(error);
    });
  }

  loginUser(email: string, password: string) {
    const user: AuthData = { email, password };
    this.http.post<{ message: string, data: any, user: any }>(`${url}/login`, user)
    .subscribe(response => {
      this.token = response.data;
      if (this.token) {

        const expiresIn = 86400;
        this.setAuthTimer(expiresIn);

        this.isAuthenticated = true;
        this.authStatusList.next(true);

        this.userId = response.user._id;
        this.email = response.user.email;

        const now = new Date();
        const expirationDate = new Date(now.getTime() + expiresIn * 1000);
        this.saveAuthData(this.token, expirationDate);

        this.router.navigate(['/']);
      }

    }, error => {
      this.authStatusList.next(false);
      console.log(error);
    });
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusList.next(false);
    this.userId = null;
    this.email = null;
    this.clearAuthData();
    clearTimeout(this.tokenTimer);
    this.router.navigate(['/']);
  }

}
