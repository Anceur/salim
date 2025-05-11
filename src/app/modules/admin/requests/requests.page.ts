import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonIcon, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  businessOutline, mailOutline, callOutline, locationOutline, 
  checkmarkOutline, closeOutline, videocamOutline, eyeOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { ModalController, AlertController, ToastController } from '@ionic/angular';

import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.page.html',
  styleUrls: ['./requests.page.scss'],
  standalone: true,
  imports: [IonBackButton, IonButtons, 
    IonButton, IonLabel, IonItem, IonList, IonContent, 
    IonHeader, IonTitle, IonToolbar, IonIcon,
    CommonModule, FormsModule
  ],
  providers: [
    ModalController,
    AlertController,
    ToastController
  ]
})
export class RequestsPage implements OnInit {
  pendingAccounts: any[] = [];
  approvedCount: number = 0;
  rejectedCount: number = 0;
  unsubscribe: any;

  constructor(
    private userservice: UserService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    addIcons({
      businessOutline, mailOutline, callOutline, locationOutline,
      checkmarkOutline, closeOutline, videocamOutline, eyeOutline,
      checkmarkCircleOutline
    });
  }

  async ngOnInit() {
    // Get initial data
    await this.loadPendingAccounts();
    await this.loadStatistics();
    
    // Set up real-time listener
    this.setupRealtimeListener();
  }

  ngOnDestroy() {
    // Unsubscribe from Firestore listener when component is destroyed
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  setupRealtimeListener() {
    this.unsubscribe = this.userservice.listenToPendingAccounts((accounts) => {
      this.pendingAccounts = accounts;
    });
  }

  async loadPendingAccounts() {
    this.pendingAccounts = await this.userservice.getPendingAccounts();
  }

  async loadStatistics() {
    this.approvedCount = await this.userservice.getBusinessCountByStatus('approved');
    this.rejectedCount = await this.userservice.getBusinessCountByStatus('rejected');
  }

  async validateAccount(accountId: string) {
    try {
      await this.userservice.updateBusinessStatus(accountId, 'approved');
      
      // Update statistics
      this.approvedCount++;
      
      this.showToast('Business account approved');
    } catch (error) {
      this.showAlert('Error', 'Failed to approve account. Please try again.');
      console.error('Error approving account:', error);
    }
  }

  async rejectAccount(accountId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Rejection',
      message: 'Are you sure you want to reject this business account?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Reject',
          handler: async () => {
            try {
              await this.userservice.updateBusinessStatus(accountId, 'rejected');
              
              // Update statistics
              this.rejectedCount++;
              
              this.showToast('Business account rejected');
            } catch (error) {
              this.showAlert('Error', 'Failed to reject account. Please try again.');
              console.error('Error rejecting account:', error);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async createMeeting(account: any) {
    const alert = await this.alertCtrl.create({
      header: 'Schedule Google Meet',
      message: `Schedule a meeting with ${account.businessName}`,
      inputs: [
        {
          name: 'date',
          type: 'date',
          min: new Date().toISOString().split('T')[0],
          placeholder: 'Meeting Date'
        },
        {
          name: 'time',
          type: 'time',
          placeholder: 'Meeting Time'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Create Meeting',
          handler: async (data) => {
            if (!data.date || !data.time) {
              this.showAlert('Error', 'Please select date and time for the meeting.');
              return false;
            }
            
            try {
              // Create meet link (integration with Google Meet API would go here)
              const meetLink = `https://meet.google.com/${this.generateMeetCode()}`;
              
              // Save meeting details to Firestore
              const meetingData = {
                businessId: account.id,
                businessName: account.businessName,
                businessEmail: account.email,
                date: data.date,
                time: data.time,
                meetLink: meetLink,
                createdAt: new Date()
              };
              
              await this.userservice.saveMeeting(meetingData);
              
              // Send notification to business owner (would be implemented with proper notification service)
              this.notifyBusinessOwner(account, meetLink, data.date, data.time);
              
              this.showToast('Meeting scheduled successfully');
              return true;
            } catch (error) {
              this.showAlert('Error', 'Failed to schedule meeting. Please try again.');
              console.error('Error scheduling meeting:', error);
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  notifyBusinessOwner(account: any, meetLink: string, date: string, time: string) {
    // This would be implemented with a proper notification service
    // For now, just log the notification
    console.log(`Notification would be sent to ${account.email} about meeting on ${date} at ${time}: ${meetLink}`);
  }

  generateMeetCode() {
    // Generate a Google Meet-like code (3 groups of 3 alphanumeric characters)
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (i < 2) result += '-';
    }
    
    return result;
  }

  async viewProof(proofUrl: string) {
    // Open a modal or full-screen view of the proof document
    const alert = await this.alertCtrl.create({
      header: 'Business Proof',
      message: '<div style="text-align: center;"><img src="' + proofUrl + '" style="max-width: 100%; max-height: 300px;"></div>',
      buttons: ['Close']
    });

    await alert.present();
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    toast.present();
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}