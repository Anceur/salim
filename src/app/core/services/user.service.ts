import { Injectable } from '@angular/core';
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, Timestamp, updateDoc, where } from '@angular/fire/firestore'; 
import { Firestore } from '@angular/fire/firestore';           
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private totalUsersSubject = new BehaviorSubject<number>(0);
  totalUsers$ = this.totalUsersSubject.asObservable();

  constructor(private firestore: Firestore) {}

  async loadDashboardStats() {
    await this.fetchTotalUsers();
  }

  async fetchTotalUsers() {
    try {
      const businessesRef = collection(this.firestore, 'businesses');
      const querySnapshot = await getDocs(businessesRef);
      this.totalUsersSubject.next(querySnapshot.size);
    } catch (error) {
      console.error('Error fetching total users:', error);
      this.totalUsersSubject.next(0);
    }
  }

  async getAllBusinesses() {
    try {
      const businessesRef = collection(this.firestore, 'businesses');
      const snapshot = await getDocs(businessesRef);
      
      // Map the documents with their IDs
      return snapshot.docs.map(doc => {
        const data = doc.data();
        // Add the document ID to the data object
        return {
          ...data,
          id: doc.id,
          // Ensure createdAt exists and is properly formatted
          createdAt: data['createdAt'] || Timestamp.now()
        };
      });
    } catch (error) {
      console.error('Error getting businesses:', error);
      return [];
    }
  }

  // Additional methods can be added here as needed
  async getBusinessById(id: string) {
    try {
      const docRef = doc(this.firestore, 'businesses', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
          id: docSnap.id, 
          ...data,
          // Ensure createdAt exists
          createdAt: data['createdAt'] || Timestamp.now(),
          // Ensure phone and address are extracted correctly, checking multiple possible field names
          phone: data['phone'] || data['phoneNumber'] || data['contactNumber'] || 'Non spécifié',
          address: data['wilaya'] || data['location'] || data['businessAddress'] || 'Non spécifiée',
          // Add a lastLogin field if it doesn't exist
          lastLogin: data['lastLogin'] || null
        };
      } else {
        console.log('No such document!');
        return null;
      }
    } catch (error) {
      console.error('Error getting business:', error);
      return null;
    }
  }

  async getBusinessesByStatus(status: string) {
    try {
      const businessesRef = collection(this.firestore, 'businesses');
      const q = query(businessesRef, where('status', '==', status));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting businesses by status:', error);
      return [];
    }
  }

  async getCurrentUserStatus(userId: string): Promise<string> {
    try {
      const docRef = doc(this.firestore, 'businesses', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data()['status'] || 'pending';
      }
      return 'pending';
    } catch (error) {
      console.error('Error getting user status:', error);
      return 'pending';
    }
  }


  getPendingAccounts(): Promise<any[]> {
    const q = query(
      collection(this.firestore, 'businesses'),
      where('status', '==', 'pending')
    );

    return getDocs(q).then(querySnapshot => {
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });
  }


  listenToPendingAccounts(callback: (accounts: any[]) => void): () => void {
    const q = query(
      collection(this.firestore, 'businesses'),
      where('status', '==', 'pending')
    );
    
    return onSnapshot(q, (snapshot) => {
      const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(accounts);
    });
  }

  /**
   * Get count of businesses by status
   */
  getBusinessCountByStatus(status: string): Promise<number> {
    const q = query(
      collection(this.firestore, 'businesses'),
      where('status', '==', status)
    );
    
    return getDocs(q).then(snapshot => snapshot.size);
  }

  /**
   * Update business account status
   */
  updateBusinessStatus(accountId: string, status: string): Promise<void> {
    const businessRef = doc(this.firestore, `businesses/${accountId}`);
    return updateDoc(businessRef, { status });
  }

  /**
   * Save meeting to database
   */
  saveMeeting(meetingData: any): Promise<void> {
    // In a full implementation, you would add the meeting document to a collection
    console.log('Saving meeting data:', meetingData);
    
    // Update the business document with meeting info
    const businessRef = doc(this.firestore, `businesses/${meetingData.businessId}`);
    return updateDoc(businessRef, {
      meetingScheduled: true,
      meetingDetails: {
        date: meetingData.date,
        time: meetingData.time,
        link: meetingData.meetLink
      }
    });
  }

  async deleteBusiness(businessId: string): Promise<void> {
    try {
      const businessRef = doc(this.firestore, 'businesses', businessId);
      await deleteDoc(businessRef);
      // Refresh total users count after deletion
      await this.fetchTotalUsers();
    } catch (error) {
      console.error('Error deleting business:', error);
      throw error;
    }
  }
  async getBusinessByUid(uid: string): Promise<any | null> {
    const businessDocRef = doc(this.firestore, `businesses/${uid}`);
    const snapshot = await getDoc(businessDocRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  async updateBusiness(uid: string, data: any): Promise<void> {
    const businessDocRef = doc(this.firestore, `businesses/${uid}`);
    await updateDoc(businessDocRef, {
      ...data,
      updatedAt: new Date()
    });
  }
}
