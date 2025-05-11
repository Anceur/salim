import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { gridOutline, peopleOutline, notificationsOutline, personOutline, callOutline } from 'ionicons/icons';

import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonBadge, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [IonContent, IonTitle, IonToolbar, IonHeader, IonBadge, IonLabel, IonIcon, IonTabButton, IonTabBar, IonRouterOutlet, IonTabs]
})

export class TabsPage implements OnDestroy {
  private backButtonSub?: Subscription;

  

  constructor(private router: Router, private platform: Platform) {
        addIcons({
          'grid-outline': gridOutline,
          'people-outline': peopleOutline,
          'notifications-outline': notificationsOutline,
          'person-outline': personOutline,
          'call-outline': callOutline  
    });
  }

  ngOnInit(): void {
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(10, () => {
      const currentUrl = this.router.url;

      if (currentUrl.startsWith('/admin')) {

        console.log('Back button blocked in admin');
      } else {
        (navigator as any)['app'].exitApp();
      }
    });
  }

  ngOnDestroy(): void {
    this.backButtonSub?.unsubscribe();
  }

  navigateTo(tab: string): void {
    this.router.navigate([`/admin/tabs/${tab}`]);
  }
}