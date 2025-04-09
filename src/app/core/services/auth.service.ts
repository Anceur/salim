import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc, collection, addDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { getDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {}
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const uid = userCredential.user.uid;
  

      const userDoc = await getDoc(doc(this.firestore, `businesses/${uid}`));
      const userData = userDoc.data();
  
      if (!userData) {
        throw new Error('User data not found.');
      }
  
      
      if (userData['status'] === 'pending') {
        throw new Error('Your account is still pending validation.');
      }
  
      if (userData['status'] === 'rejected') {
        throw new Error('Your account has been rejected.');
      }
  
    
      const role = userData['role'];
  
    
      if (role === 'admin') {
        this.router.navigate(['/requests']);
      } else {
        this.router.navigate(['/home']);
      }
  
      return userCredential;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  async register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async registerBusiness(data: any, email: string, password: string) {
    try {
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
    this.router.navigate(['/login']);
  }

  getUser() {
    return this.auth.currentUser;
  }
}