import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgxPaginationModule } from 'ngx-pagination';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonApp, 
  IonList, IonIcon, IonItem, IonLabel, IonListHeader, IonButton, 
  IonBadge, IonSearchbar, IonAvatar, IonGrid, IonRow, IonCol, 
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, 
  IonNote, IonCheckbox, IonText, IonToggle, IonTextarea, IonInput,
  IonModal
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';
import { Subscription } from 'rxjs';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc } from '@angular/fire/firestore';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/core/services/auth.service';


@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [
    NgxPaginationModule, IonicModule, IonInput, IonTextarea, IonToggle, 
    IonText, IonCheckbox, IonNote, IonCardSubtitle, IonCardTitle, 
    IonCardHeader, IonCardContent, IonCard, IonCol, IonRow, IonGrid, 
    IonAvatar, IonSearchbar, IonBadge, IonButton, IonListHeader, 
    IonLabel, IonItem, IonIcon, IonList, IonApp, IonButtons, 
    IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,
    IonModal
  ]
})
export class UsersPage implements OnInit, OnDestroy {

  businesses: any[] = [];
  pendingAccounts: any[] = [];
  approvedCount: number = 0;
  rejectedCount: number = 0;
  isModalOpen: boolean = false;
  selectedUser: any = null;

  totalUsers$ = this.userService.totalUsers$;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private userService: UserService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService:AuthService
  ) {
    addIcons({
      'close-outline': closeOutline
    });
  }

  ngOnInit() { 
    this.loadStatistics();
    // Load dashboard stats and businesses data
    this.loadDashboardData();
    this.loadBusinesses();
  }

  isAdminUser(user: any): boolean {
    // Check if the user has role property and if it's equal to 'ADMIN'
    return user && (user.role === 'ADMIN' || user.role === 'admin');
  }

  async loadStatistics() {
    // Get pending accounts
    this.pendingAccounts = await this.userService.getPendingAccounts();
    
    // Get approved and rejected counts
    this.approvedCount = await this.userService.getBusinessCountByStatus('approved');
    this.rejectedCount = await this.userService.getBusinessCountByStatus('rejected');
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  async loadDashboardData() {
    await this.userService.loadDashboardStats();
  }

  async loadBusinesses() {
    try {
      this.businesses = await this.userService.getAllBusinesses();
      console.log('Loaded businesses:', this.businesses);
    } catch (error) {
      console.error('Error loading businesses:', error);
    }
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'medium';
    }
  }

  // View user details function
  async viewUserDetails(user: any) {
    try {
      // Get the full user details from the database
      const fullUserDetails = await this.userService.getBusinessById(user.id);
      if (fullUserDetails) {
        this.selectedUser = fullUserDetails;
      } else {
        this.selectedUser = user;
      }
      console.log('Selected user details:', this.selectedUser);
      this.isModalOpen = true;
    } catch (error) {
      console.error('Error fetching user details:', error);
      this.selectedUser = user;
      this.isModalOpen = true;
    }
  }

  // Close modal function
  closeModal() {
    this.isModalOpen = false;
    this.selectedUser = null;
  }

  // Approve user function
  async approveUser(userId: string) {
    const loading = await this.loadingController.create({
      message: 'Approbation en cours...'
    });
    
    await loading.present();
    
    try {
      await this.userService.updateBusinessStatus(userId, 'approved');
      
      // Update local data
      if (this.selectedUser) {
        this.selectedUser.status = 'approved';
      }
      
      // Update the user in the businesses array
      const index = this.businesses.findIndex(business => business.id === userId);
      if (index !== -1) {
        this.businesses[index].status = 'approved';
      }
      
      // Update statistics
      await this.loadStatistics();
      
      const toast = await this.toastController.create({
        message: 'Utilisateur approuvé avec succès',
        duration: 2000,
        color: 'success'
      });
      
      toast.present();
      this.closeModal();
    } catch (error) {
      console.error('Failed to approve user:', error);
      
      const toast = await this.toastController.create({
        message: 'Échec de l\'approbation de l\'utilisateur',
        duration: 2000,
        color: 'danger'
      });
      
      toast.present();
    } finally {
      loading.dismiss();
    }
  }

  goRequests() {
    this.router.navigate(['/requests']);
  }

  goLogout() {
    this.router.navigate(['/login']);
  }
async deleteUser(userId: string) {
    // Find the user
    const user = this.businesses.find(u => u.id === userId);
    
    // Check if user is admin, if so, prevent deletion
    if (this.isAdminUser(user)) {
      const toast = await this.toastController.create({
        message: 'Les utilisateurs Admin ne peuvent pas être supprimés',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    // Continue with the normal delete confirmation flow for non-admin users
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            await this.performDelete(userId);
          }
        }
      ]
    });

    await alert.present();
  }
  /**
   * Perform the actual deletion
   */
  async performDelete(userId: string) {
    const loading = await this.loadingController.create({
      message: 'Suppression en cours...'
    });
    
    await loading.present();
    
    try {
      await this.userService.deleteBusiness(userId);
      
      // Remove the user from the local array
      this.businesses = this.businesses.filter(business => business.id !== userId);
      
      const toast = await this.toastController.create({
        message: 'Utilisateur supprimé avec succès',
        duration: 2000,
        color: 'success'
      });
      
      toast.present();
    } catch (error) {
      console.error('Failed to delete user:', error);
      
      const toast = await this.toastController.create({
        message: 'Échec de la suppression de l\'utilisateur',
        duration: 2000,
        color: 'danger'
      });
      
      toast.present();
    } finally {
      loading.dismiss();
    }
  }
  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    }).catch((error) => {
      console.error('Error logging out:', error);
    });
  }
}