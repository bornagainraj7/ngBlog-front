import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';

@Injectable()

export class AuthInterceptor implements HttpInterceptor {

  constructor(private userService: UserService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authToken = this.userService.getToken();

    if (!authToken) {
      return next.handle(req);
    }

    const authRequest = req.clone({
      headers: req.headers.set('authToken', authToken)
    });
    return next.handle(authRequest);
  }
}
