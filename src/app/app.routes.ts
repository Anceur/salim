import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'loading', // Redirect to home by default
    pathMatch: 'full'
  },
  {
    path: 'loading',
    loadComponent: () => import('../environments/components/loading/loading.component').then(m => m.LoadingComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./modules/trader/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'login',
    loadComponent: () => import('./modules/auth/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./modules/auth/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'requests',
    loadComponent: () => import('./modules/admin/requests/requests.page').then(m => m.RequestsPage)
  },
  {
    path: 'users',
    loadComponent: () => import('./modules/admin/users/users.page').then(m => m.UsersPage)
  },  {
    path: 'profile',
    loadComponent: () => import('./modules/trader/profile/profile.page').then( m => m.ProfilePage)
  }

];
