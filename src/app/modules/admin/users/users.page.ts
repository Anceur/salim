import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgxPaginationModule } from 'ngx-pagination';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonApp, 
  IonList, IonIcon, IonItem, IonLabel, IonListHeader, IonButton, 
  IonBadge, IonSearchbar, IonAvatar, IonGrid, IonRow, IonCol, 
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, 
  IonNote, IonCheckbox, IonText, IonToggle, IonTextarea, IonInput 
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [
    NgxPaginationModule, IonicModule, IonInput, IonTextarea, IonToggle, 
    IonText, IonCheckbox, IonNote, IonCardSubtitle, IonCardTitle, 
    IonCardHeader, IonCardContent, IonCard, IonCol, IonRow, IonGrid, 
    IonAvatar, IonSearchbar, IonBadge, IonButton, IonListHeader, 
    IonLabel, IonItem, IonIcon, IonList, IonApp, IonButtons, 
    IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule
  ]
})
export class UsersPage implements OnInit, OnDestroy {
  businesses: any[] = [];
  totalUsers$ = this.userService.totalUsers$;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Load dashboard stats and businesses data
    this.loadDashboardData();
    this.loadBusinesses();
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  async loadDashboardData() {
    await this.userService.loadDashboardStats();
  }

  async loadBusinesses() {
    try {
      this.businesses = await this.userService.getAllBusinesses();
      console.log('Loaded businesses:', this.businesses);
    } catch (error) {
      console.error('Error loading businesses:', error);
    }
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'medium';
    }
  }

  goRequests() {
    this.router.navigate(['/requests']);
  }

  goSetting() {
    this.router.navigate(['/settings']);
  }

  goProfile() {
    this.router.navigate(['/profile']);
  }

  goLogout() {
    this.router.navigate(['/login']);
  }
}