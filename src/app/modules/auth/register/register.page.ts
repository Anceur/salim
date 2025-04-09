import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

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

  constructor(
    private authService: AuthService, 
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  async onRegister() {
    if (!this.agreeTerms) {
      this.presentToast('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    if (!this.email || !this.password || !this.phoneNumber) {
      this.presentToast('Please fill in all required fields');
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

  
goToNextStep(): void {
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

  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }
}