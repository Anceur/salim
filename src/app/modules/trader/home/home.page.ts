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

import { 
  callOutline, searchOutline, addOutline, logOutOutline, personOutline, 
  logInOutline, search, closeCircleOutline, call, eyeOutline,
  checkmarkCircle, closeCircle, alertCircleOutline
} from 'ionicons/icons';
import { UserService } from '../../../core/services/user.service';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

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
  userStatus: string = 'pending'; // Initialize with 'pending' as default
  noResultsFound: boolean = false; // Nouveau: pour indiquer qu'aucun résultat n'a été trouvé

  // Properties for the evaluation dialog
  showEvaluation: boolean = false;
  comment: string = '';
  phoneToEvaluate: string = '';
  
  // Properties for the phone details modal
  showPhoneDetails: boolean = false;
  selectedPhone: any = null;
  

  private firestore: Firestore = inject(Firestore);
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private phoneService: PhoneService,
    private storageService: StorageService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private userService: UserService,
      private meta: Meta,
    private titleService: Title,
    private translate: TranslateService
  ) {
    // Add Ionic icons
    addIcons({
      personOutline, logOutOutline, searchOutline, callOutline, call, 
      addOutline, logInOutline, search, closeCircleOutline, eyeOutline,
      checkmarkCircle, closeCircle, alertCircleOutline
    });
  }


  ngOnInit() {

    this.translate.get([
      'META.HOME_KEYWORDS',
      'META.HOME_DESC',
      'PAGE_TITLE.HOME'
    ]).subscribe(translations => {
   
      this.meta.updateTag({ name: 'keywords', content: translations['META.HOME_KEYWORDS'] });

      
      this.meta.updateTag({ name: 'description', content: translations['META.HOME_DESC'] });

      this.titleService.setTitle(translations['PAGE_TITLE.HOME']);
    });
   

    // Reset userStatus when not authenticated
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
      } else {
        // Reset status when logged out
        this.userStatus = 'pending';
        console.log('User logged out, reset status to:', this.userStatus);
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
          // Ne pas appeler searchPhoneNumber() ici pour éviter de faire des recherches inutiles
        }
      );
    } catch (error: any) {
      console.error('Error loading phone numbers:', error);
      this.presentToast('Erreur lors du chargement des numéros');
    }
  }
  
  // Search for phone numbers
  async searchPhoneNumber() {
    // Vérifier si le champ de recherche est vide
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.showSearchPrompt = true;
      this.noResultsFound = false;
      this.filteredNumbers = [];
      this.presentToast('Veuillez entrer un numéro de téléphone');
      return;
    }
    
    this.showSearchPrompt = false;
    
    try {
      const loading = await this.loadingCtrl.create({
        message: 'Recherche en cours...',
        duration: 1000,
        cssClass: 'custom-loading'
      
      });
      await loading.present();
      
      this.filteredNumbers = await this.phoneService.searchPhoneNumber(this.searchQuery);
      
      // Vérifier si aucun résultat n'a été trouvé
      if (this.filteredNumbers.length === 0) {
        this.noResultsFound = true;
      } else {
        this.noResultsFound = false;
      }
    } catch (error: any) {
      console.error('Error searching phone numbers:', error);
      this.presentToast('Erreur lors de la recherche');
      this.noResultsFound = true;
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
      cssClass: 'custom-loading'
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
      
      // Si le numéro évalué correspond à la recherche en cours, rafraîchir les résultats
      if (this.searchQuery && this.searchQuery.includes(this.phoneToEvaluate)) {
        this.searchPhoneNumber();
      }
      
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

  // View phone details modal
  async viewPhoneDetails(phone: any) {
    this.selectedPhone = phone;
    
    // Fetch comments for this phone if not already loaded
    if (!this.selectedPhone.comments) {
      try {
        const loading = await this.loadingCtrl.create({
          message: 'Chargement des commentaires...',
          cssClass: 'custom-loading',
          duration: 1000
        });
        await loading.present();
        
        // Get comments from PhoneService
        this.selectedPhone.comments = await this.phoneService.getPhoneComments(phone.id);
        
        loading.dismiss();
      } catch (error) {
        console.error('Error loading comments:', error);
        this.presentToast('Erreur lors du chargement des commentaires');
      }
    }
    
    this.showPhoneDetails = true;
  }

  // Close phone details modal
  closePhoneDetails() {
    this.showPhoneDetails = false;
    this.selectedPhone = null;
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
      // Ensure status is reset on logout
      this.userStatus = 'pending';
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