import { Injectable } from '@angular/core';
import { collection, doc, getDoc, getDocs, query, Timestamp, where } from '@angular/fire/firestore'; 
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
        return { id: docSnap.id, ...docSnap.data() };
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
}
