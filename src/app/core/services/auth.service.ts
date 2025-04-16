import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, setDoc, collection, addDoc, query, where, getDocs } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { getDoc } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStateSource = new BehaviorSubject<boolean>(false);
  authState = this.authStateSource.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    // Surveiller les changements d'état d'authentification
    onAuthStateChanged(this.auth, (user) => {
      this.authStateSource.next(!!user);
    });
  }
  
  // Méthode pour vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    return !!this.auth.currentUser;
  }
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const uid = userCredential.user.uid;
  
      const userDoc = await getDoc(doc(this.firestore, `businesses/${uid}`));
      const userData = userDoc.data();
  
      if (!userData) {
        throw new Error('User data not found.');
      }
  
      const role = userData['role'];
  
     
      if (role !== 'admin') {
        if (userData['status'] === 'pending') {
          throw new Error('Your account is still pending validation.');
        }
  
        if (userData['status'] === 'rejected') {
          throw new Error('Your account has been rejected.');
        }
      }
  
  
      if (role === 'admin') {
        this.router.navigate(['/users']);
      } else {
        this.router.navigate(['/home']);
      }
  
      this.authStateSource.next(true);
      return userCredential;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  
  async register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  // Check if phone number already exists
  async isPhoneNumberUnique(phoneNumber: string): Promise<boolean> {
    try {
      const phonesRef = collection(this.firestore, 'phoneNumbers');
      const q = query(phonesRef, where('number', '==', phoneNumber));
      const querySnapshot = await getDocs(q);
      
      // If the snapshot is empty, the phone number is unique
      return querySnapshot.empty;
    } catch (error) {
      console.error('Error checking phone number uniqueness:', error);
      throw error;
    }
  }

  async registerBusiness(data: any, email: string, password: string) {
    try {
      // First check if phone number is unique
      if (data.phoneNumber) {
        const isUnique = await this.isPhoneNumberUnique(data.phoneNumber);
        if (!isUnique) {
          throw new Error('This phone number is already registered. Please use a different phone number.');
        }
      }
      
      const userCredential = await this.register(email, password);
      const uid = userCredential.user.uid;
      
      const businessDocRef = doc(this.firestore, `businesses/${uid}`);
      await setDoc(businessDocRef, {
        uid,
        email,
        role: 'user',
        ...data,
        status: 'pending', 
        createdAt: new Date()
      });

      // Save phone number separately if it exists
      if (data.phoneNumber) {
        await this.addPhoneNumber(data.phoneNumber, uid);
      }

      // Mettre à jour l'état d'authentification
      this.authStateSource.next(true);

      // Navigate to home page after successful registration
      this.router.navigate(['/home']);

      return { success: true, uid };
    } catch (error) {
      console.error('Error registering business:', error);
      throw error;
    }
  }
  
  async addPhoneNumber(phoneNumber: string, userId?: string) {
    try {
      // If userId is not provided, use current user's ID
      const uid = userId || this.auth.currentUser?.uid;
      
      if (!uid) {
        throw new Error('User not authenticated');
      }

      const phonesRef = collection(this.firestore, 'phoneNumbers');
      await addDoc(phonesRef, {
        number: phoneNumber,
        createdAt: new Date(),
        userId: uid
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding phone number:', error);
      throw error;
    }
  }

  logout() {
    this.auth.signOut();
    // Mettre à jour l'état d'authentification
    this.authStateSource.next(false);
    this.router.navigate(['/login']);
  }

  getUser() {
    return this.auth.currentUser;
  }
  getCurrentUser(): any {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }
}