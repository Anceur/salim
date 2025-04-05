import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, IonList, IonItem } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, IonList, IonItem, CommonModule, FormsModule]
})
export class HomePage {
  phoneNumbers: string[] = [];  
  searchQuery: string = '';     
  newPhoneNumber: string = '';  
  isLogin = false;
  constructor(private router: Router) {
    this.checkLoginStatus();
  }

  checkLoginStatus(){
    this.isLogin=!!localStorage.getItem('token');
  }


  addPhoneNumber() {

    if(!this.isLogin){
      this.router.navigate(['/login']);
      return;
    }
    if (this.newPhoneNumber.trim()) {
      this.phoneNumbers.push(this.newPhoneNumber);
      this.newPhoneNumber = ''; 
    }
  }


  get filteredNumbers() {
    return this.phoneNumbers.filter(num => num.includes(this.searchQuery));
  }
}
