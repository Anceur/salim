import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton } from '@ionic/angular/standalone';
import { Firestore, collection, query, where, getDocs, updateDoc, doc } from '@angular/fire/firestore';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.page.html',
  styleUrls: ['./requests.page.scss'],
  standalone: true,
  imports: [IonButton, IonLabel, IonItem, IonList, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class RequestsPage implements OnInit {

  pendingAccounts: any[] = [];

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    const q = query(
      collection(this.firestore, 'businesses'),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    this.pendingAccounts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async validateAccount(accountId: string) {
    const businessRef = doc(this.firestore, `businesses/${accountId}`);
    await updateDoc(businessRef, {
      status: 'approved'
    });
    this.pendingAccounts = this.pendingAccounts.filter(acc => acc.id !== accountId);
  }

  async rejectAccount(accountId: string) {
    const businessRef = doc(this.firestore, `businesses/${accountId}`);
    await updateDoc(businessRef, {
      status: 'rejected'
    });
    this.pendingAccounts = this.pendingAccounts.filter(acc => acc.id !== accountId);
  }

}
