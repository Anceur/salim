import { Routes } from '@angular/router';
import{adminGuard} from './guards/admin.guard'

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'loading', 
    pathMatch: 'full'
  },
  {
    path: 'loading',
    loadComponent: () => import('./shared/loading/loading.page').then(m => m.LoadingPage)
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
    path: 'profile',
    loadComponent: () => import('./modules/trader/profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'home',
    loadComponent: () => import('./modules/trader/home/home.page').then( m => m.HomePage)
  },

  {
    path: 'editer',
    loadComponent: () => import('./modules/trader/editer/editer.page').then( m => m.EditerPage)
  },
  {
    path: 'historic',
    loadComponent: () => import('./modules/trader/historic/historic.page').then( m => m.HistoricPage)
  },
  {
    path: 'tabs',
    loadComponent: () => import('./modules/admin/tabs/tabs.page').then( m => m.TabsPage)
  },

  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.routes').then(m => m.adminRoutes),
    canActivate: [adminGuard]
  },


  



];
