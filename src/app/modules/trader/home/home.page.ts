import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, IonList, IonItem, 
  LoadingController, ToastController, IonIcon, IonButtons, IonLabel, IonBadge, IonChip } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { query, where } from 'firebase/firestore';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../../core/services/auth.service';
import { addIcons } from 'ionicons';
import { 
  callOutline, searchOutline, addOutline, logOutOutline, trashOutline, 
  thumbsUpOutline, thumbsDownOutline, thumbsUp, thumbsDown, call 
} from 'ionicons/icons';
import { PhoneService } from 'src/app/core/services/phone.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
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
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private phoneRatingService: PhoneService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    // Add Ionic icons
    addIcons({
      logOutOutline,
      searchOutline,
      callOutline,
      addOutline,
      trashOutline,
      thumbsUpOutline,
      thumbsDownOutline,
      thumbsUp,
      thumbsDown,
      call
    });
  }

  ngOnInit() {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    this.auth.onAuthStateChanged(user => {
      this.isLogin = !!user;
      if (this.isLogin) {
        this.loadPhoneNumbers();
      }
    });
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

    const loading = await this.loadingCtrl.create({
      message: 'Ajout du numéro en cours...',
    });
    await loading.present();

    try {
      await this.authService.addPhoneNumber(this.newPhoneNumber);
      this.newPhoneNumber = '';
      this.loadPhoneNumbers();
      this.presentToast('Numéro de téléphone ajouté avec succès');
    } catch (error: any) {
      console.error('Error adding phone number:', error);
      this.presentToast(error.message || 'Échec de l\'ajout du numéro de téléphone');
    } finally {
      loading.dismiss();
    }
  }

  async loadPhoneNumbers() {
    const phonesRef = collection(this.firestore, 'phoneNumbers');
    const q = query(phonesRef, where('userId', '==', this.auth.currentUser?.uid));
    collectionData(q, { idField: 'id' }).subscribe(async (data: any) => {
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
    return this.phoneNumbers.filter(item => 
      item.number.toLowerCase().includes(this.searchQuery.toLowerCase())
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

  // Helper method to determine if user has already rated this phone as valid
  hasValidRating(phone: any): boolean {
    return phone.userRating && phone.userRating.isValid === true;
  }

  // Helper method to determine if user has already rated this phone as invalid
  hasInvalidRating(phone: any): boolean {
    return phone.userRating && phone.userRating.isValid === false;
  }
}