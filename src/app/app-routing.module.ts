import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PostListComponent } from './posts/post-list/post-list.component';
import { PostCreateComponent } from './posts/post-create/post-create.component';
import { RouteGuard } from './users/route.guard';

const routes: Routes = [
  { path: '', component: PostListComponent },
  { path: 'create', component: PostCreateComponent, canActivate: [RouteGuard] },
  { path: 'edit/:postId', component: PostCreateComponent, canActivate: [RouteGuard] },
  { path: 'user', loadChildren: './users/user.module#UserModule' }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [
    RouterModule
  ],
  providers: [
    RouteGuard
  ]
})

export class AppRoutingModule {}
