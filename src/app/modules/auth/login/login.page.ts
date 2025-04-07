import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule,RouterLink],
})
export class LoginPage {
  email = '';
  password = '';

  constructor(private authService: AuthService) {}

  async onLogin() {
    try {
      const user = await this.authService.login(this.email, this.password);
      console.log('Logged in!', user);
      // navigate or show success
    } catch (error) {
      console.error('Login error', error);
    }
  }
}
