import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, setDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStateSource = new BehaviorSubject<boolean>(false);
  authState = this.authStateSource.asObservable();
  

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private storageService: StorageService
  ) {
    // Check current auth state when service initializes
    this.auth.onAuthStateChanged((user) => {
      this.authStateSource.next(!!user);
    });
  }

  // Enregistrement
  async register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async isPhoneNumberUnique(phoneNumber: string): Promise<boolean> {
    try {
      const phonesRef = collection(this.firestore, 'phoneNumbers');
      const q = query(phonesRef, where('number', '==', phoneNumber));
      const querySnapshot = await getDocs(q);

      const businessesRef = collection(this.firestore, 'businesses');
      const businessQ = query(businessesRef, where('phoneNumber', '==', phoneNumber));
      const businessQuerySnapshot = await getDocs(businessQ);

      return querySnapshot.empty && businessQuerySnapshot.empty;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'unicité du numéro de téléphone:', error);
      throw error;
    }
  }

  async isEmailUnique(email: string): Promise<boolean> {
    try {
      const methods = await fetchSignInMethodsForEmail(this.auth, email);

      const businessesRef = collection(this.firestore, 'businesses');
      const businessQ = query(businessesRef, where('email', '==', email));
      const businessQuerySnapshot = await getDocs(businessQ);

      return methods.length === 0 && businessQuerySnapshot.empty;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'unicité de l\'email:', error);
      throw error;
    }
  }

  async registerBusiness(data: any, email: string, password: string) {
    try {
      if (data.phoneNumber) {
        const isPhoneUnique = await this.isPhoneNumberUnique(data.phoneNumber);
        if (!isPhoneUnique) {
          throw new Error('Ce numéro est déjà enregistré. Veuillez utiliser un autre numéro de téléphone.');
        }
      }

      const isEmailUnique = await this.isEmailUnique(email);
      if (!isEmailUnique) {
        throw new Error('Cet email est déjà enregistré. Veuillez utiliser un autre email.');
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

      if (data.phoneNumber) {
        const phoneRef = doc(collection(this.firestore, 'phoneNumbers'));
        await setDoc(phoneRef, {
          number: data.phoneNumber,
          userId: uid,
          createdAt: new Date()
        });
      }

      this.storageService.setUserProfile({
        uid,
        firstName: data.firstName,
        lastName: data.lastName,
        email,
        role: 'user',
        status: 'pending',
        businessName: data.businessName || ''
      });

      this.authStateSource.next(true);

      this.router.navigate(['/home']);

      return { success: true, uid };
    } catch (error) {
      throw error;
    }
  }

  // Fin enregistrement

  //login
  async login(email: string, password: string): Promise<void> {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);

      if (result.user) {
        // Fetch user profile data from Firestore
        const businessRef = doc(this.firestore, `businesses/${result.user.uid}`);
        const businessSnapshot = await getDocs(query(collection(this.firestore, 'businesses'), where('uid', '==', result.user.uid)));
        
        if (!businessSnapshot.empty) {
          const businessData = businessSnapshot.docs[0].data();
          
          // Store user profile in local storage
          this.storageService.setUserProfile({
            uid: result.user.uid,
            email: businessData['email'],
            firstName: businessData['firstName'],
            lastName: businessData['lastName'],
            role: businessData['role'] || 'user',
            status: businessData['status'],
            businessName: businessData['businessName'] || ''
          });
          
          this.authStateSource.next(true);
          this.router.navigate(['/home']);
        }
      }
    } catch (error: any) {
      let errorMessage = 'Échec de la connexion';

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Aucun utilisateur trouvé avec cet e-mail.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mot de passe incorrect.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Adresse e-mail invalide.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Ce compte a été désactivé.';
          break;
        default:
          errorMessage = 'Une erreur s\'est produite lors de la connexion.';
      }

      throw new Error(errorMessage);
    }
  }
  //end login

  // Logout function
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.authStateSource.next(false);
      return Promise.resolve();
    } catch (error: any) {
      return Promise.reject(error);
    }
  }
}