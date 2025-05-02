import { Routes } from '@angular/router';
// import{adminGuard} from './guards/admin.guard'

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'loading', // Redirect to home by default
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
    path: 'requests',
    loadComponent: () => import('./modules/admin/requests/requests.page').then(m => m.RequestsPage),
    // canActivate: [adminGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./modules/admin/settings/settings.page').then(m => m.SettingsPage),
    // canActivate: [adminGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('./modules/admin/users/users.page').then(m => m.UsersPage),
    // canActivate: [adminGuard]
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
    path: 'settings',
    loadComponent: () => import('./modules/admin/settings/settings.page').then( m => m.SettingsPage)
  },
  {
    path: 'editer',
    loadComponent: () => import('./modules/trader/editer/editer.page').then( m => m.EditerPage)
  },
  {
    path: 'historic',
    loadComponent: () => import('./modules/trader/historic/historic.page').then( m => m.HistoricPage)
  },

  



];
