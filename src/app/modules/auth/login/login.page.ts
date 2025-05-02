import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { RouterLink, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  mailOutline,
  lockClosedOutline,
  logInOutline,
  eyeOutline,
  arrowBack
} from 'ionicons/icons';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterLink],
})
export class LoginPage {
  email = '';
  password = '';
  showPassword = false;
  isSubmitting = false;
  emailError = '';
  passwordError = '';

  constructor(
    private authService: AuthService, 
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router
  ) 

  {
      // Add Ionic icons
      addIcons({
        'mail-outline': mailOutline,
        'lock-closed-outline': lockClosedOutline,
        'log-in-outline': logInOutline,
        'eye-outline': eyeOutline,
        'arrow-back': arrowBack,
      });
    }
  



  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onLogin() {
    if (!this.email || !this.password) {
      this.presentToast('Veuillez entrer votre e-mail et votre mot de passe');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Connexion en cours...',
    });
    await loading.present();

    try {
      await this.authService.login(this.email, this.password);
      await loading.dismiss();
      this.presentToast('Connexion réussie !');
      this.router.navigate(['/home']);
    } catch (error: any) {
      await loading.dismiss();
      this.presentToast(error.message || 'Échec de la connexion');
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }
}