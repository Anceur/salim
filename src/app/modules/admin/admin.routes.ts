import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./users/users.page').then(m => m.UsersPage),
      },
      {
        path: 'requests',
        loadComponent: () => import('./requests/requests.page').then(m => m.RequestsPage),
      },

      {
        path: 'phone',
        loadComponent: () => import('./phone/phone.page').then(m => m.PhonePage),
      },
  
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
