import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, IonList, IonItem } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Firestore, collection, addDoc, collectionData } from '@angular/fire/firestore';
import {  doc,  query, where } from 'firebase/firestore';
import { Auth } from '@angular/fire/auth';

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
  private firestore :Firestore =inject(Firestore);
  private auth :Auth=inject(Auth);
  constructor(private router: Router) {
    this.checkLoginStatus();
  }

  checkLoginStatus(){
    const user = this.auth.currentUser;
    this.isLogin = !!user;
  }

  ngOnInit() {
    if (this.isLogin) {
      this.loadPhoneNumbers();
    }
  }
  async addPhoneNumber() {
    if (!this.isLogin) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.newPhoneNumber.trim()) {
      const phonesRef = collection(this.firestore, 'phoneNumbers');
      await addDoc(phonesRef, {
        number: this.newPhoneNumber,
        createdAt: new Date(),
        userId: this.auth.currentUser?.uid
      });
      this.newPhoneNumber = '';
      this.loadPhoneNumbers(); 
    }
  }

  async loadPhoneNumbers() {
    const phonesRef = collection(this.firestore, 'phoneNumbers');
    const q = query(phonesRef, where('userId', '==', this.auth.currentUser?.uid));
    collectionData(q, { idField: 'id' }).subscribe((data: any) => {
      this.phoneNumbers = data.map((item: any) => item.number);
    });
  }

  get filteredNumbers() {
    return this.phoneNumbers.filter(num => num.includes(this.searchQuery));
  }
}
