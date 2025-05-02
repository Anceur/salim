import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, NavController, ToastController, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonItem, IonLabel, IonInput } from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Firestore, doc, updateDoc, getDoc } from '@angular/fire/firestore';
import { StorageService } from 'src/app/core/services/storage.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { IonBackButton, IonButtons } from '@ionic/angular/standalone';


@Component({
  selector: 'app-editer',
  templateUrl: './editer.page.html',
  styleUrls: ['./editer.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonBackButton, IonButtons
  ]
})
export class EditerPage implements OnInit {




    profileForm: FormGroup;
    submitted = false;
    userProfile: any;
    originalPhoneNumber: string = '';
  
    constructor(
      private formBuilder: FormBuilder,
      private router: Router,
      private navCtrl: NavController,
      private loadingCtrl: LoadingController,
      private toastCtrl: ToastController,
      private firestore: Firestore,
      private storageService: StorageService,
      private authService: AuthService
    ) {
      this.profileForm = this.formBuilder.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9+]+$')]],
        businessName: [''],
        businessField: [''],
        wilaya: ['']
      });
    }
  
    ngOnInit() {
      this.userProfile = this.storageService.getUserProfile();
      this.loadUserData();
    }
  
    async loadUserData() {
      if (!this.userProfile?.uid) {
        this.presentToast('Impossible de charger les données utilisateur. Veuillez vous reconnecter.', 'danger');
        this.router.navigate(['/login']);
        return;
      }
  
      try {
        const loading = await this.loadingCtrl.create({
          message: 'Chargement des données...'
        });
        await loading.present();
  
        const businessDocRef = doc(this.firestore, `businesses/${this.userProfile.uid}`);
        const businessSnapshot = await getDoc(businessDocRef);
  
        if (businessSnapshot.exists()) {
          const data = businessSnapshot.data();
          this.originalPhoneNumber = data['phoneNumber'] || '';
          
          this.profileForm.patchValue({
            firstName: data['firstName'] || '',
            lastName: data['lastName'] || '',
            phoneNumber: data['phoneNumber'] || '',
            businessName: data['businessName'] || '',
            businessField: data['businessField'] || '',
            wilaya: data['wilaya'] || ''
          });
        }
  
        await loading.dismiss();
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        this.presentToast('Erreur lors du chargement des données. Veuillez réessayer.', 'danger');
      }
    }
  
    get f() {
      return this.profileForm.controls;
    }
  
    async saveProfile() {
      this.submitted = true;
  
      if (this.profileForm.invalid) {
        return;
      }
  
      const formData = this.profileForm.value;
      
      try {
        const loading = await this.loadingCtrl.create({
          message: 'Enregistrement des modifications...'
        });
        await loading.present();
  
        // Check if phone number changed and if it's unique
        if (formData.phoneNumber !== this.originalPhoneNumber) {
          const isPhoneUnique = await this.authService.isPhoneNumberUnique(formData.phoneNumber);
          if (!isPhoneUnique) {
            await loading.dismiss();
            this.presentToast('Ce numéro de téléphone est déjà utilisé. Veuillez en choisir un autre.', 'danger');
            return;
          }
        }
  
        // Update business document in Firestore
        const businessDocRef = doc(this.firestore, `businesses/${this.userProfile.uid}`);
        await updateDoc(businessDocRef, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          businessName: formData.businessName,
          businessField: formData.businessField,
          wilaya: formData.wilaya,
          updatedAt: new Date()
        });
  
        // Update local storage
        const updatedProfile = {
          ...this.userProfile,
          firstName: formData.firstName,
          lastName: formData.lastName,
          businessName: formData.businessName
        };
        this.storageService.setUserProfile(updatedProfile);
  
        await loading.dismiss();
        this.presentToast('Profil mis à jour avec succès', 'success');
        this.navCtrl.navigateBack('/profile');
      } catch (error: any) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        this.presentToast(`Erreur: ${error.message || 'Une erreur s\'est produite'}`, 'danger');
      }
    }
  
    cancel() {
      this.navCtrl.navigateBack('/profile');
    }
  
    async presentToast(message: string, color: string = 'primary') {
      const toast = await this.toastCtrl.create({
        message,
        duration: 3000,
        color,
        position: 'bottom'
      });
      await toast.present();
    }
}
