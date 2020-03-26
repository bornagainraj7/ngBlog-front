import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../users/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  private authListSubs: Subscription;
  public userAuthenicated = false;

  constructor(public userService: UserService) { }

  ngOnInit() {
    this.userAuthenicated = this.userService.getIsAuth();
    this.authListSubs = this.userService.getAuthStatusListener()
    .subscribe(auth => {
      this.userAuthenicated = auth;
    });
  }

  onLogout() {
    this.userService.logout();
  }
  ngOnDestroy() {

  }

}
