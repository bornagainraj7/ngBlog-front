import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService } from '../user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {

  isLoading = false;

  private authStatusSubs: Subscription;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.authStatusSubs = this.userService.getAuthStatusListener()
    .subscribe(auth => {
      this.isLoading = false;
    });
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    this.userService.createUser(form.value.email, form.value.password);
    // form.resetForm();
  }

  ngOnDestroy() {
    this.authStatusSubs.unsubscribe();
  }

}
