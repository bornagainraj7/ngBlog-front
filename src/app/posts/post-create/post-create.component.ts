import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { PostsService } from './../posts.service';
import { Post } from '../post.model';
import { MimeTypeValidator } from './mime-type.validator';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/users/user.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {

  newPost = 'No Content';
  enteredTitle = '';
  enteredContent = '';
  private mode = 'create';
  private postId: string;
  public post: Post;
  isLoading = false;

  form: FormGroup;
  imagePreview: string;

  private authStatusSubs: Subscription;

  constructor(private postService: PostsService, public route: ActivatedRoute, private userService: UserService) { }

  ngOnInit() {
    this.authStatusSubs = this.userService.getAuthStatusListener()
    .subscribe(auth => {
      this.isLoading = false;
    })

    this.form = new FormGroup({
      title: new FormControl(null, { validators: [Validators.required, Validators.minLength(3)] }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, { validators: [Validators.required], asyncValidators: [MimeTypeValidator] })
    });

    this.route.paramMap.subscribe((param) => {
      if (param.has('postId')) {
        this.isLoading = true;
        this.mode = 'edit';
        this.postId = param.get('postId');
        this.postService.getSinglePost(this.postId)
        .subscribe(res => {
          this.isLoading = false;
          const data = res.data;
          this.post = { id: data._id, title: data.title, content: data.content, imagePath: data.imagePath, creator: data.creator };
          this.form.setValue({ title: this.post.title, content: this.post.content, image: this.post.imagePath });
        }, error => {
          console.log(error.error);
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
    } else {
      this.postService.updatePost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image);
    }
    this.form.reset();
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();
    this.form.patchValue({ image: file });
    this.form.get('image').updateValueAndValidity();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  ngOnDestroy() {
    this.authStatusSubs.unsubscribe();
  }

}
