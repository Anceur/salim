import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon } from '@ionic/angular/standalone';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { Keyboard } from '@capacitor/keyboard';
import { RouterLink, Router } from '@angular/router';

import { addIcons } from 'ionicons';
import { closeCircleOutline, mailOutline , lockClosedOutline , logInOutline , eyeOutline ,  arrowBack } from 'ionicons/icons';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterLink , IonIcon],
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
  ) {
    // Add Ionic icons
    addIcons({
      closeCircleOutline, mailOutline , lockClosedOutline , logInOutline , eyeOutline ,  arrowBack
    });
  }

  
  ngOnInit() {
    Keyboard.setScroll({ isDisabled: false }); // تمكين التمرير عند فتح لوحة المفاتيح
  }



  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }


  scrollToInput(event: Event) {
    const el = event.target as HTMLInputElement;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      const result = await this.authService.login(this.email, this.password);
      await loading.dismiss();
      this.presentToast('Connexion réussie !');
  

      if (result?.role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/home']);
      }
  
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