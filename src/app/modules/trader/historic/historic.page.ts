import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonList, IonBackButton, 
  IonButtons, IonItem, IonLabel, IonSpinner, IonBadge, IonText } from '@ionic/angular/standalone';
import { PhoneService } from 'src/app/core/services/phone.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-historic',
  templateUrl: './historic.page.html',
  styleUrls: ['./historic.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    IonButtons, 
    IonBackButton, 
    IonList, 
    IonIcon, 
    IonButton, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonItem, 
    IonLabel,
    IonSpinner, 
    IonBadge,
    IonText,
    CommonModule, 
    FormsModule
  ]
})
export class HistoricPage implements OnInit {
  ratedPhones: any[] = [];
  isLoading = true;

  constructor(
    private phoneService: PhoneService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.checkAuthAndLoadData();
  }

  ionViewWillEnter() {
    this.checkAuthAndLoadData();
  }

  private checkAuthAndLoadData() {
    // Check if user is authenticated
    this.authService.authState.subscribe(isAuthenticated => {
      if (!isAuthenticated) {
        this.router.navigate(['/login']);
        return;
      }
      
      this.loadUserRatedPhones();
    });
  }

  private async loadUserRatedPhones() {
    try {
      this.isLoading = true;
      this.ratedPhones = await this.phoneService.getUserRatedPhones();
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading rated phones:', error);
      this.isLoading = false;
    }
  }
}