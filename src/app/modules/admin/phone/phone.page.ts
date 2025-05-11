import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardContent, IonList, IonLabel, IonItem, IonIcon, IonButton, IonCardTitle, IonFabButton, IonFab, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { addIcons } from 'ionicons';
import { call, closeOutline } from 'ionicons/icons';
import { PhoneService } from 'src/app/core/services/phone.service';

@Component({
  selector: 'app-phone',
  templateUrl: './phone.page.html',
  styleUrls: ['./phone.page.scss'],
  standalone: true,
  imports: [IonBackButton, IonButtons, IonFab, IonFabButton, IonCardTitle, IonButton, IonIcon, IonItem, IonLabel, IonList, IonCardContent, IonCardHeader, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class PhonePage implements OnInit {
  phoneNumbers: any[] = [];
  constructor(private phoneService: PhoneService) {
    {
        addIcons({
          'call': call,
        });
      }
    
   }

  ngOnInit() {
    this.loadPhoneNumbers();
  }
  private firestore: Firestore = inject(Firestore);

  loadPhoneNumbers() {
    this.phoneService.getPhoneNumbers().subscribe({
      next: (data: any[]) => {
        this.phoneNumbers = data;
      },
      error: (error) => {
        console.error('Error loading phone numbers:', error);
      }
    });
  }

}
