import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, IonList, IonItem, 
  LoadingController, ToastController, IonIcon, IonButtons, IonLabel, IonBadge, IonChip, IonPopover, IonAvatar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { query, where } from 'firebase/firestore';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../../core/services/auth.service';
import { addIcons } from 'ionicons';
import { 
  callOutline, searchOutline, addOutline, logOutOutline, trashOutline, 
  thumbsUpOutline, thumbsDownOutline, thumbsUp, thumbsDown, call, personOutline, settingsOutline, 
  logInOutline, search, closeCircleOutline } from 'ionicons/icons';
import { PhoneService } from 'src/app/core/services/phone.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonAvatar, IonPopover, 
    IonLabel, IonButtons, IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, 
    IonInput, IonButton, IonList, IonItem, IonChip, CommonModule, FormsModule
  ]
})
export class HomePage implements OnInit {
  phoneNumbers: any[] = [];  
  searchQuery: string = '';     
  newPhoneNumber: string = '';  
  isLogin = false;
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);
  isAuthenticated: boolean = false;
  
  // Properties for the evaluation dialog
  showEvaluation: boolean = false;
  comment: string = '';
  phoneToEvaluate: string = '';
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private phoneRatingService: PhoneService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    // Add Ionic icons
    addIcons({
      personOutline, settingsOutline, logOutOutline, searchOutline, callOutline, call, 
      trashOutline, addOutline, thumbsUpOutline, thumbsDownOutline, thumbsUp, thumbsDown, 
      logInOutline, search, closeCircleOutline
    });
  }

  ngOnInit() {
    this.checkLoginStatus();
    this.isAuthenticated = this.authService.isAuthenticated();
  
    this.authService.authState.subscribe(state => {
      this.isAuthenticated = state;
    });
    
    // Reset search query
    this.searchQuery = '';
    
    // Load phone numbers regardless of login state
    this.loadPhoneNumbers();
  }
  
  checkLoginStatus() {
    this.auth.onAuthStateChanged(user => {
      this.isLogin = !!user;
    });
  }

  clearSearch() {
    this.searchQuery = '';
  }
  
  async addPhoneNumber() {
    if (!this.isLogin) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.newPhoneNumber.trim()) {
      this.presentToast('Veuillez entrer un numéro de téléphone');
      return;
    }

    // Check if phone number already exists
    try {
      const isUnique = await this.authService.isPhoneNumberUnique(this.newPhoneNumber);
      if (!isUnique) {
        this.presentToast('Ce numéro de téléphone existe déjà');
        return;
      }
      
      // Show evaluation dialog instead of immediately adding the number
      this.phoneToEvaluate = this.newPhoneNumber;
      this.showEvaluation = true;
      
    } catch (error: any) {
      console.error('Error checking phone number:', error);
      this.presentToast(error.message || 'Erreur lors de la vérification du numéro');
    }
  }

  // Handle evaluation submission
  async submitEvaluation(isValid: boolean) {
    const loading = await this.loadingCtrl.create({
      message: 'Ajout du numéro en cours...',
    });
    await loading.present();

    try {
      // First add the phone number
      const result = await this.authService.addPhoneNumber(this.phoneToEvaluate);
      
      // Wait for the phone number to be loaded again to get its ID
      await this.loadPhoneNumbers();
      
      // Find the newly added phone in the loaded phones
      const addedPhone = this.phoneNumbers.find(p => p.number === this.phoneToEvaluate);
      
      if (addedPhone && addedPhone.id) {
        // Rate the phone number
        await this.phoneRatingService.ratePhoneNumber(addedPhone.id, isValid);
      }
      
      // Reset form and hide dialog
      this.newPhoneNumber = '';
      this.phoneToEvaluate = '';
      this.comment = '';
      this.showEvaluation = false;
      
      this.presentToast('Numéro de téléphone ajouté et évalué avec succès');
    } catch (error: any) {
      console.error('Error adding and evaluating phone number:', error);
      this.presentToast(error.message || 'Échec de l\'ajout du numéro de téléphone');
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

  async loadPhoneNumbers() {
    console.log('Loading phone numbers...');
    const phonesRef = collection(this.firestore, 'phoneNumbers');
    // Remove the filter to get all phone numbers instead of just the current user's
    collectionData(phonesRef, { idField: 'id' }).subscribe(async (data: any) => {
      console.log('Data received:', data);
      // Get ratings for each phone number
      const phonesWithRatings = await Promise.all(data.map(async (phone: any) => {
        // Initialize ratings if not present
        if (!phone.validRatings) {
          phone.validRatings = 0;
        }
        if (!phone.invalidRatings) {
          phone.invalidRatings = 0;
        }
        if (!phone.totalRatings) {
          phone.totalRatings = 0;
        }
        
        // Get current user's rating
        const userRating = await this.phoneRatingService.getUserRating(phone.id);
        phone.userRating = userRating;
        
        return phone;
      }));
      
      this.phoneNumbers = phonesWithRatings;
      console.log('Phone numbers loaded:', this.phoneNumbers);
    });
  }

  async deletePhoneNumber(item: any) {
    const loading = await this.loadingCtrl.create({
      message: 'Suppression en cours...',
    });
    await loading.present();

    try {
      const phoneDocRef = doc(this.firestore, 'phoneNumbers', item.id);
      await deleteDoc(phoneDocRef);
      this.presentToast('Numéro de téléphone supprimé');
    } catch (error: any) {
      console.error('Error deleting phone number:', error);
      this.presentToast(error.message || 'Échec de la suppression du numéro de téléphone');
    } finally {
      loading.dismiss();
    }
  }

  async ratePhone(phone: any, isValid: boolean) {
    if (!this.isLogin) {
      this.router.navigate(['/login']);
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Évaluation en cours...',
    });
    await loading.present();

    try {
      await this.phoneRatingService.ratePhoneNumber(phone.id, isValid);
      this.presentToast('Numéro évalué avec succès');
      // Update in local array to refresh UI
      this.loadPhoneNumbers();
    } catch (error: any) {
      console.error('Error rating phone:', error);
      this.presentToast(error.message || 'Échec de l\'évaluation du numéro');
    } finally {
      loading.dismiss();
    }
  }

  get filteredNumbers() {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      return []; // Return empty array when search is empty
    }
    
    const query = this.searchQuery.toLowerCase().trim();
    return this.phoneNumbers.filter(item => 
      item.number && item.number.toString().toLowerCase().includes(query)
    );
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

  logout() {
    this.authService.logout();
  }

  hasValidRating(phone: any): boolean {
    return phone.userRating && phone.userRating.isValid === true;
  }

  hasInvalidRating(phone: any): boolean {
    return phone.userRating && phone.userRating.isValid === false;
  }

  goToLogin(){
    this.router.navigate(['/login']);
  }

  goProfil(){
    this.router.navigate(['/profile']);
  }
}