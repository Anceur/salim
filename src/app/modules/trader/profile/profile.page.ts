import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonText, IonButtons, IonBackButton, IonButton, IonIcon, ActionSheetController, ToastController, LoadingController } from '@ionic/angular/standalone';
import { StorageService } from 'src/app/core/services/storage.service';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from 'src/app/core/services/auth.service';
import { Keyboard } from '@capacitor/keyboard';
import { FirebasestorageService } from 'src/app/core/services/firebasestorage.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButton, IonBackButton, IonButtons, IonText, IonLabel, IonItem, IonList, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {
  userProfile: any;
  profileImage: string | null = null;

  constructor(
    private storageService: StorageService, 
    private router: Router, 
    private actionSheetController: ActionSheetController, 
    private toastController: ToastController, 
    private authService: AuthService,
    private firebaseStorageService: FirebasestorageService,
    private loadingController: LoadingController
  ) {}




  ngOnInit() {  
    
    Keyboard.setScroll({ isDisabled: false });
    this.userProfile = this.storageService.getUserProfile();
    console.log('userProfile:', this.userProfile);
    

    if (this.userProfile && this.userProfile.profileImageUrl) {
      this.profileImage = this.userProfile.profileImageUrl;
    }
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    }).catch((error) => {
      console.error('Error logging out:', error);
    });
  }

  goToEditProfile() {
    this.router.navigate(['/editer']);
  }
  back(){
    this.router.navigate(['/home']);
  }

  goToHistoric() {
    this.router.navigate(['/historic']);
  }

  // Upload profile image
  async uploadProfileImage() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Choisir une source',
      buttons: [
        {
          text: 'Camera',
          handler: () => {
            this.takePicture(CameraSource.Camera);
          }
        },
        {
          text: 'Galerie',
          handler: () => {
            this.takePicture(CameraSource.Photos);
          }
        },
        {
          text: 'Annuler',
          role: 'cancel'
        }
      ]
    });
    
    await actionSheet.present();
  }
  
  // Take or select picture
  async takePicture(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: source
      });
      
      // Show loading indicator
      const loading = await this.loadingController.create({
        message: 'Téléchargement en cours...',
        spinner: 'circles'
      });
      await loading.present();
      
      try {
        // Upload image to Firebase
        const downloadUrl = await this.firebaseStorageService.uploadProfileImage(image.dataUrl as string);
        
        // Update local display
        this.profileImage = downloadUrl;
        
        // Show success message
        const toast = await this.toastController.create({
          message: 'Photo de profil mise à jour',
          duration: 2000,
          color: 'success',
          position: 'bottom'
        });
        
        toast.present();
      } catch (error) {
        console.error('Error uploading image:', error);
        
        // Show error message
        const toast = await this.toastController.create({
          message: 'Erreur lors du téléchargement de l\'image',
          duration: 3000,
          color: 'danger',
          position: 'bottom'
        });
        
        toast.present();
      } finally {
        // Dismiss loading indicator
        loading.dismiss();
      }
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  }
}