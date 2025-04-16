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

  constructor(
    private authService: AuthService, 
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router,
    private storageService:StorageService
  ) {}

  async validatePhoneNumber() {
    try {
      if (!this.phoneNumber) {
        this.isPhoneNumberValid = false;
        this.phoneNumberError = 'Phone number is required';
        return false;
      }

      const isUnique = await this.authService.isPhoneNumberUnique(this.phoneNumber);
      if (!isUnique) {
        this.isPhoneNumberValid = false;
        this.phoneNumberError = 'This phone number is already registered';
        return false;
      }

      this.isPhoneNumberValid = true;
      this.phoneNumberError = '';
      return true;
      
    } catch (error) {
      console.error('Error validating phone number:', error);
      this.isPhoneNumberValid = false;
      this.phoneNumberError = 'Error validating phone number';
      return false;
    }
  }

  async goToNextStep(): Promise<void> {
    // If moving from step 1, validate phone number first
    if (this.currentStep === 1) {
      // Check email, password, and basic fields
      if (!this.email || !this.password || !this.firstName || !this.lastName || !this.phoneNumber || !this.wilaya) {
        this.presentToast('Please fill in all required fields');
        return;
      }
      
      // Validate phone number uniqueness
      const isPhoneValid = await this.validatePhoneNumber();
      if (!isPhoneValid) {
        this.presentToast(this.phoneNumberError);
        return;
      }
    }
    
    // If on step 2, validate business info
    if (this.currentStep === 2) {
      if (!this.businessName || !this.businessField) {
        this.presentToast('Please fill in all business information');
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
      this.presentToast('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    if (!this.email || !this.password || !this.phoneNumber || !this.businessName || !this.businessField) {
      this.presentToast('Please fill in all required fields');
      return;
    }

    // Final validation of phone number before submission
    const isPhoneValid = await this.validatePhoneNumber();
    if (!isPhoneValid) {
      this.presentToast(this.phoneNumberError);
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Registering...',
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
        city: this.city,
        address: this.address,
      };
      this.storageService.setUserProfile(registrationData); 
  
      const result = await this.authService.registerBusiness(registrationData, this.email, this.password);
      this.presentToast('Business registered successfully!');
      this.router.navigate(['/success']);
    } catch (error: any) {
      console.error('Registration error', error);
      this.presentToast(error.message || 'Registration failed');
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
        return 'User Information';
      case 2:
        return 'Business Information';
      case 3:
        return 'Proof of Business';
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