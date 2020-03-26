import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from './../posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material';
import { UserService } from 'src/app/users/user.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

  // posts = [
  //   { title: 'Post One', content: 'This is First Post!' },
  //   { title: 'Post Two', content: 'This is Second Post!' },
  //   { title: 'Post Three', content: 'This is Third Post!' },
  // ];
  posts: Post[] = [];
  private postsSub: Subscription;
  isLoading = false;

  totalPosts = 0;
  postPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];

  private authStatusSubs: Subscription;
  userAuthenticated = false;

  constructor(private postService: PostsService, private userService: UserService) { }

  ngOnInit() {
    this.fetchPosts();
    this.userAuthenticated = this.userService.getIsAuth();
    this.authStatusSubs = this.userService.getAuthStatusListener()
    .subscribe(auth => {
      this.userAuthenticated = auth;
    });
  }

  fetchPosts() {
    this.isLoading = true;
    this.postService.getPosts(this.postPerPage, this.currentPage);
    this.postsSub = this.postService.getPostUpdateListener()
    .subscribe((postData: { posts: Post[], count: number }) => {
      this.isLoading = false;
      this.posts = postData.posts;
      this.totalPosts = postData.count;
    });
  }

  onDelete(id) {
    this.isLoading = true;
    this.postService.deletePost(id)
    .subscribe(() => {
      this.fetchPosts();
    });
  }

  onPageChange(pageData: PageEvent) {
    this.currentPage = pageData.pageIndex + 1;
    this.postPerPage = pageData.pageSize;
    this.fetchPosts();
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSubs.unsubscribe();
  }

}
