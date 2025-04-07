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

  constructor(
    private authService: AuthService, 
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  async onRegister() {
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
      // Navigation is now handled in the AuthService
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
}