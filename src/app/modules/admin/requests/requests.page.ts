import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonIcon, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { Firestore, collection, query, where, getDocs, updateDoc, doc, getDoc, onSnapshot } from '@angular/fire/firestore';
import { addIcons } from 'ionicons';
import { 
  businessOutline, mailOutline, callOutline, locationOutline, 
  checkmarkOutline, closeOutline, videocamOutline, eyeOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { ModalController, AlertController, ToastController } from '@ionic/angular';

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
    private firestore: Firestore,
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
    const q = query(
      collection(this.firestore, 'businesses'),
      where('status', '==', 'pending')
    );
    
    this.unsubscribe = onSnapshot(q, (snapshot) => {
      this.pendingAccounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });
  }

  async loadPendingAccounts() {
    const q = query(
      collection(this.firestore, 'businesses'),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    this.pendingAccounts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async loadStatistics() {
    const approvedQuery = query(
      collection(this.firestore, 'businesses'),
      where('status', '==', 'approved')
    );
    
    const rejectedQuery = query(
      collection(this.firestore, 'businesses'),
      where('status', '==', 'rejected')
    );

    const approvedSnapshot = await getDocs(approvedQuery);
    const rejectedSnapshot = await getDocs(rejectedQuery);
    
    this.approvedCount = approvedSnapshot.size;
    this.rejectedCount = rejectedSnapshot.size;
  }

  async validateAccount(accountId: string) {
    try {
      const businessRef = doc(this.firestore, `businesses/${accountId}`);
      await updateDoc(businessRef, {
        status: 'approved'
      });
      
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
              const businessRef = doc(this.firestore, `businesses/${accountId}`);
              await updateDoc(businessRef, {
                status: 'rejected'
              });
              
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
              
              await this.saveMeetingToDatabase(meetingData);
              
              // Send notification to business owner (would be implemented with proper notification service)
              this.notifyBusinessOwner(account, meetLink, data.date, data.time);
              
              this.showToast('Meeting scheduled successfully');
              return true; // Add this line to return a value
            } catch (error) {
              this.showAlert('Error', 'Failed to schedule meeting. Please try again.');
              console.error('Error scheduling meeting:', error);
              return false; // Add this line to return a value
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async saveMeetingToDatabase(meetingData: any) {
    // Add meeting to Firestore collection
    const meetingsCollection = collection(this.firestore, 'meetings');
    // Actual implementation would use addDoc to save the meeting data
    console.log('Saving meeting data:', meetingData);
    
    // Also update the business document with meeting info
    const businessRef = doc(this.firestore, `businesses/${meetingData.businessId}`);
    await updateDoc(businessRef, {
      meetingScheduled: true,
      meetingDetails: {
        date: meetingData.date,
        time: meetingData.time,
        link: meetingData.meetLink
      }
    });
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