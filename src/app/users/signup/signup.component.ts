import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  isLoading = false;

  constructor(private userService: UserService) { }

  ngOnInit() {
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.userService.createUser(form.value.email, form.value.password);
    // form.resetForm();
  }

}
