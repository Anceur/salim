import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, IonList, IonItem, 
 LoadingController, ToastController, IonIcon, IonButtons, IonLabel, 
  IonChip, IonPopover, IonModal, IonAvatar
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Firestore, collection, addDoc, collectionData, doc } from '@angular/fire/firestore';
import { AuthService } from '../../../core/services/auth.service';
import { PhoneService } from '../../../core/services/phone.service';
import { StorageService } from '../../../core/services/storage.service';
import { addIcons } from 'ionicons';
import { Keyboard } from '@capacitor/keyboard';
import { 
  callOutline, searchOutline, addOutline, logOutOutline, personOutline, 
  logInOutline, search, closeCircleOutline, call
} from 'ionicons/icons';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonAvatar, 
    IonPopover,
    IonModal,
    IonLabel, 
    IonButtons, 
    IonIcon, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonInput, 
    IonButton, 
    IonList, 
    IonItem, 
    IonChip,
    
  ]
})
export class HomePage implements OnInit {
  // Properties
  phoneNumbers: any[] = [];
  filteredNumbers: any[] = [];
  searchQuery: string = '';
  showSearchPrompt: boolean = true;
  isAuthenticated: boolean = false;
  userStatus: string = '';

  // Properties for the evaluation dialog
  showEvaluation: boolean = false;
  comment: string = '';
  phoneToEvaluate: string = '';

  private firestore: Firestore = inject(Firestore);
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private phoneService: PhoneService,
    private storageService: StorageService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private userService: UserService
  ) {
    // Add Ionic icons
    addIcons({
      personOutline, logOutOutline, searchOutline, callOutline, call, 
      addOutline, logInOutline, search, closeCircleOutline
    });
  }

  ngOnInit() {
    Keyboard.setScroll({ isDisabled: false });

    
    this.authService.authState.subscribe(async isAuthenticated => {
      console.log('Authentication state changed:', isAuthenticated);
      this.isAuthenticated = isAuthenticated;
      if (isAuthenticated) {
        // Get user profile from storage to get the user ID
        const userProfile = this.storageService.getUserProfile();
        if (userProfile && userProfile.uid) {
          // Get user status directly from Firebase
          this.userStatus = await this.userService.getCurrentUserStatus(userProfile.uid);
          console.log('User status from Firebase:', this.userStatus);
        }
      }
    });
    
    // Load all phone numbers
    this.loadPhoneNumbers();
  }


  async loadPhoneNumbers() {
    try {
      this.phoneService.getPhoneNumbers().subscribe(
        (data: any[]) => {
          this.phoneNumbers = data;
          this.searchPhoneNumber();
        }
      );
    } catch (error: any) {
      console.error('Error loading phone numbers:', error);
      this.presentToast('Erreur lors du chargement des numéros');
    }
  }
  // Search for phone numbers
  async searchPhoneNumber() {
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      this.showSearchPrompt = false;
      try {
        this.filteredNumbers = await this.phoneService.searchPhoneNumber(this.searchQuery);
      } catch (error: any) {
        console.error('Error searching phone numbers:', error);
        this.presentToast('Erreur lors de la recherche');
      }
    } else {
      this.filteredNumbers = [];
      this.showSearchPrompt = true;
    }
  }

  // Open evaluation dialog
  openEvaluationDialog() {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.userStatus !== 'approved') {
      this.presentToast('Veuillez attendre l\'approbation de votre compte pour ajouter des numéros');
      return;
    }

    this.showEvaluation = true;
  }

  // Submit evaluation for a phone number
  async submitEvaluation(isValid: boolean) {
    if (!this.phoneToEvaluate || this.phoneToEvaluate.trim() === '') {
      this.presentToast('Veuillez entrer un numéro de téléphone');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Ajout du numéro en cours...',
    });
    await loading.present();

    try {
      // Check if phone number is unique first
      const isUnique = await this.authService.isPhoneNumberUnique(this.phoneToEvaluate);
      
      if (!isUnique) {
        // If phone exists, find it and rate it
        const existingPhones = await this.phoneService.searchPhoneNumber(this.phoneToEvaluate);
        if (existingPhones.length > 0) {
          const phoneId = existingPhones[0].id;
          await this.phoneService.ratePhoneNumber(phoneId, isValid, this.comment);
          this.presentToast('Numéro évalué avec succès');
        } else {
          this.presentToast('Numéro existant mais introuvable');
        }
      } else {
        // If phone doesn't exist, add it first then rate it
        await this.phoneService.addPhoneNumber(this.phoneToEvaluate);
        // Refresh phone list
        const phones = await this.phoneService.searchPhoneNumber(this.phoneToEvaluate);
        if (phones.length > 0) {
          const newPhoneId = phones[0].id;
          await this.phoneService.ratePhoneNumber(newPhoneId, isValid, this.comment);
          this.presentToast('Numéro ajouté et évalué avec succès');
        }
      }
      
      // Reset and close dialog
      this.cancelEvaluation();
      // Refresh phone list
      this.loadPhoneNumbers();
      
    } catch (error: any) {
      console.error('Error evaluating phone number:', error);
      this.presentToast(error.message || 'Erreur lors de l\'évaluation');
    } finally {
      loading.dismiss();
    }
  }

  // Cancel evaluation and close dialog
  cancelEvaluation() {
    this.showEvaluation = false;
    this.phoneToEvaluate = '';
    this.comment = '';
  }

  // Show toast message
  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

  // Logout
  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    }).catch((error) => {
      console.error('Error logging out:', error);
      this.presentToast('Erreur lors de la déconnexion');
    });
  }
  goProfile(){
    this.router.navigate(['/profile'])
  }
  goLogin(){
    this.router.navigate(['/login'])
  }
}