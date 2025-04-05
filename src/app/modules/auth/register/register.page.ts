import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class RegisterPage {
  phoneNumber = '';
  firstName = '';
  lastName = '';
  businessName = '';
  businessField = '';
  wilaya = '';
  city = '';
  address = '';

  constructor(private authService: AuthService) {}

  async onRegister() {
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
      const result = await this.authService.registerBusiness(registrationData);
      console.log('Business registered!', result);
      
    } catch (error) {
      console.error('Registration error', error);
    }
  }
}