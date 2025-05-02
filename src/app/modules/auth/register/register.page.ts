import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/core/services/storage.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class RegisterPage {
  email = '';
  password = '';
  phoneNumber = '';
  firstName = '';
  lastName = '';
  businessName = '';
  businessField = '';
  wilaya = '';
  city = '';
  address = '';
  agreeTerms = false;
  currentStep: number = 1;
  selectedFile: File | null = null;
  progressWidth: number = 0;
  

  isPhoneNumberValid = true;
  phoneNumberError = '';
  isEmailValid = true;
  emailError = '';

  constructor(
    private authService: AuthService, 
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router,
    private storageService: StorageService,

  ) {}

  wilayas: string[] = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
    'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
    'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
    'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
    'Illizi', 'Bordj Bou Arreridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
    'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
    'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès',
    'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', 'El M\'Ghair', 'El Meniaa'
  ];



  // التحقق من فرادة رقم الهاتف
  async validatePhoneNumber() {
    try {
      if (!this.phoneNumber) {
        this.isPhoneNumberValid = false;
        this.phoneNumberError = 'Le numéro de téléphone est requis';
        return false;
      }

      const isUnique = await this.authService.isPhoneNumberUnique(this.phoneNumber);
      if (!isUnique) {
        this.isPhoneNumberValid = false;
        this.phoneNumberError = 'Ce numéro de téléphone est déjà enregistré';
        return false;
      }

      this.isPhoneNumberValid = true;
      this.phoneNumberError = '';
      return true;
      
    } catch (error) {
      console.error('Error validating phone number:', error);
      this.isPhoneNumberValid = false;
      this.phoneNumberError = 'Erreur de validation du numéro de téléphone';
      return false;
    }
  }

  // التحقق من فرادة البريد الإلكتروني
  async validateEmail() {
    try {
      console.log('Validating email:', this.email);
      
      if (!this.email) {
        this.isEmailValid = false;
        this.emailError = 'L\'adresse e-mail est requise';
        return false;
      }
  
      console.log('Calling isEmailUnique');
      const isUnique = await this.authService.isEmailUnique(this.email);
      console.log('isEmailUnique result:', isUnique);
      
      if (!isUnique) {
        this.isEmailValid = false;
        this.emailError = 'Cette adresse e-mail est déjà enregistrée';
        return false;
      }
  
      this.isEmailValid = true;
      this.emailError = '';
      return true;
    } catch (error) {
      console.error('Error validating email:', error);
      this.isEmailValid = false;
      this.emailError = 'Erreur de validation de l\'adresse e-mail';
      return false;
    }
  }

  async goToNextStep(): Promise<void> {
    if (this.currentStep === 1) {
      // التحقق من ملء جميع الحقول المطلوبة
      if (!this.email || !this.password || !this.firstName || !this.lastName || !this.phoneNumber || !this.wilaya) {
        this.presentToast('Veuillez remplir tous les champs obligatoires');
        return;
      }
  
      // التحقق من الموافقة على الشروط
      if (!this.agreeTerms) {
        this.presentToast("Veuillez accepter les Conditions d'utilisation");
        return;
      }
  
      // التحقق من فرادة البريد الإلكتروني
      const isEmailValid = await this.validateEmail();
      if (!isEmailValid) {
        this.presentToast(this.emailError);
        return;
      }
      
      // التحقق من فرادة رقم الهاتف
      const isPhoneValid = await this.validatePhoneNumber();
      if (!isPhoneValid) {
        this.presentToast(this.phoneNumberError);
        return;
      }
    }
  
    if (this.currentStep === 2) {
      if (!this.businessName || !this.businessField) {
        this.presentToast('Veuillez remplir toutes les informations commerciales');
        return;
      }
    }
  
    if (this.currentStep < 3) {
      this.currentStep++;
      this.updateProgressBar();
    }
  }
  
  goToPreviousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateProgressBar();
    }
  }

  updateProgressBar(): void {
    this.progressWidth = (this.currentStep - 1) * 50;
  }

  async onRegister() {
    if (!this.agreeTerms) {
      this.presentToast("Veuillez accepter les Conditions d'utilisation et la Politique de confidentialité");
      return;
    }

    if (!this.email || !this.password || !this.phoneNumber || !this.businessName || !this.businessField) {
      this.presentToast('Veuillez remplir tous les champs requis');
      return;
    }

    // التحقق مرة أخرى من فرادة البريد الإلكتروني ورقم الهاتف
    const isEmailValid = await this.validateEmail();
    if (!isEmailValid) {
      this.presentToast(this.emailError);
      return;
    }
   
    const isPhoneValid = await this.validatePhoneNumber();
    if (!isPhoneValid) {
      this.presentToast(this.phoneNumberError);
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Enregistrement en cours...',
    });
    await loading.present();

    try {
      const registrationData = {
        phoneNumber: this.phoneNumber,
        firstName: this.firstName,
        lastName: this.lastName,
        businessName: this.businessName,
        businessField: this.businessField,
        wilaya: this.wilaya,
      };
      this.storageService.setUserProfile(registrationData); 
  
      const result = await this.authService.registerBusiness(registrationData, this.email, this.password);
      this.presentToast('Entreprise enregistrée avec succès !');
      this.router.navigate(['/success']);
    } catch (error: any) {
      this.presentToast(error.message || "Échec de l'enregistrement.");
    } finally {
      loading.dismiss();
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

  getStepTitle(): string {
    switch (this.currentStep) {
      case 1:
        return 'Informations utilisateur';
      case 2:
        return 'Informations entreprise';
      case 3:
        return 'Justificatif d\'entreprise';
      default:
        return '';
    }
  }

  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }
}