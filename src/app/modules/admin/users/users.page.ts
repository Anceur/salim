import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgxPaginationModule } from 'ngx-pagination';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonApp, IonList, IonIcon, IonItem, IonLabel, IonListHeader, IonButton, IonBadge, IonSearchbar, IonAvatar, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonNote, IonCheckbox, IonText, IonToggle, IonTextarea, IonInput } from '@ionic/angular/standalone';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [ NgxPaginationModule ,IonicModule, IonInput, IonTextarea, IonToggle, IonText, IonCheckbox, IonNote, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCardContent, IonCard, IonCol, IonRow, IonGrid, IonAvatar, IonSearchbar, IonBadge, IonButton, IonListHeader, IonLabel, IonItem, IonIcon, IonList, IonApp, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class UsersPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
