import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Post } from './post.model';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { url } from 'inspector';

import { environment } from './../../environments/environment';

const URL = `${environment.apiUrl}/posts`;

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], count: number}>();

  constructor(private http: HttpClient, private router: Router) { }



  getPosts(pageSize: number, currentPage: number) {
    const params = `?pagesize=${pageSize}&page=${currentPage}`;
    this.http.get<{ message: string, data: any, count: number }>(`${URL}${params}`)
    .pipe(map((postData) => {
      return { posts: postData.data.map(post => {
        return {
          id: post._id,
          title: post.title,
          content: post.content,
          imagePath: post.imagePath,
          creator: post.creator
        };
      }), count: postData.count };
    }))
    .subscribe(transformedPostsData => {
      this.posts = transformedPostsData.posts;
      this.postsUpdated.next({ posts: [...this.posts], count: transformedPostsData.count });
    }, error => {
      console.log(error);
    });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getSinglePost(id: string) {
    return this.http.get<{data: any, message: string}>(`${URL}/${id}`);
  }

  addPost(title: string, content: string, image: File) {
    // const post: Post = { id: null, title, content };
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, 'image');
    this.http.post<{ message: string, data: Post }>(URL, postData)
    .subscribe(res => {
      this.router.navigate(['/']);
    }, error => {
      console.log(error);
      this.router.navigate(['/create']);
    });

  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, 'image');
    } else {
      postData = { id, title, content, imagePath: image, creator: null };
    }
    this.http.put<{ message: string, data: any }>(`${URL}/${id}`, postData)
    .subscribe(res => {
      // const post: Post = { id, title, content, imagePath: res.data.imagePath };
      // const updatedPosts = [...this.posts];
      // const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
      // updatedPosts[oldPostIndex] = post;
      // this.posts = updatedPosts;
      // this.postsUpdated.next([...this.posts]);
      this.router.navigate(['/']);
    }, error => {
      console.log(error);
    });
  }

  deletePost(postId) {
    return this.http.delete(`${URL}/${postId}`);
  }
}
