import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonText, IonButtons, IonBackButton, IonButton, IonIcon } from '@ionic/angular/standalone';
import { StorageService } from 'src/app/core/services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButton, IonBackButton, IonButtons, IonText, IonLabel, IonItem, IonList, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {
  userProfile: any;

  constructor(private storageService: StorageService, private router: Router) {}

  ngOnInit() {
    this.userProfile = this.storageService.getUserProfile();
    console.log('userProfile:', this.userProfile);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
