import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonList, IonBackButton, 
  IonButtons, IonItem, IonLabel, IonSpinner, IonBadge, IonText } from '@ionic/angular/standalone';
import { PhoneService } from 'src/app/core/services/phone.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

import { AlertController, LoadingController, ToastController } from '@ionic/angular';


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
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
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
  async deletePhone(phoneId: string) {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: 'Êtes-vous sûr de vouloir supprimer ce numéro de téléphone ? Cette action est irréversible.',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            await this.confirmDeletePhone(phoneId);
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmDeletePhone(phoneId: string) {
    const loading = await this.loadingController.create({
      message: 'Suppression en cours...'
    });
    
    await loading.present();
    
    try {
      await this.phoneService.deletePhoneNumber(phoneId);
      
      // Update local data after successful deletion
      this.ratedPhones = this.ratedPhones.filter(phone => phone.phoneId !== phoneId);
      
      this.showToast('Numéro supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      let errorMessage = 'Erreur lors de la suppression du numéro.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      this.showToast(errorMessage);
    } finally {
      await loading.dismiss();
    }
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: message.includes('succès') ? 'success' : 'danger'
    });
    
    await toast.present();
  }
}