import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, collection, collectionData, query, where, getDocs, updateDoc, addDoc, increment, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class PhoneService {

  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {}

  // Add a new phone number to the database
  async addPhoneNumber(phoneNumber: string) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('Utilisateur non connecté');

      const phoneCollectionRef = collection(this.firestore, 'phoneNumbers');
      await addDoc(phoneCollectionRef, {
        number: phoneNumber,
        userId: user.uid,
        createdAt: new Date(),
        validRatings: 0,
        invalidRatings: 0,
        totalRatings: 0
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du numéro:', error);
      throw error;
    }
  }

  // Rate a phone number (valid or invalid)
  async ratePhoneNumber(phoneId: string, isValid: boolean, comment?: string) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('Utilisateur non connecté');

      // Reference to ratings collection
      const ratingCollectionRef = collection(this.firestore, 'phoneRating');
      
      // Check if user already rated this phone
      const existingRatingQuery = query(
        ratingCollectionRef, 
        where('userId', '==', user.uid),
        where('phoneId', '==', phoneId)
      );
      
      const existingRatingSnapshot = await getDocs(existingRatingQuery);
      
      // If rating exists - update it
      if (!existingRatingSnapshot.empty) {
        const existingRatingDoc = existingRatingSnapshot.docs[0];
        const oldRating = existingRatingSnapshot.docs[0].data() as any;
        
        // Update the rating
        await updateDoc(doc(this.firestore, 'phoneRating', existingRatingDoc.id), {
          isValid: isValid,
          comment: comment || '',
          updatedAt: new Date()
        });
        
        // Update phone rating counts if the rating changed
        const phoneRef = doc(this.firestore, 'phoneNumbers', phoneId);
        
        if (oldRating.isValid !== isValid) {
          if (isValid) {
            // Changed from invalid to valid
            await updateDoc(phoneRef, {
              validRatings: increment(1),
              invalidRatings: increment(-1)
            });
          } else {
            // Changed from valid to invalid
            await updateDoc(phoneRef, {
              validRatings: increment(-1),
              invalidRatings: increment(1)
            });
          }
        }
        
      } else {
        // If no existing rating - create a new one
        await addDoc(ratingCollectionRef, {
          phoneId: phoneId,
          userId: user.uid,
          isValid: isValid,
          comment: comment || '',
          createdAt: new Date()
        });
        
        // Update phone rating counts
        const phoneRef = doc(this.firestore, 'phoneNumbers', phoneId);
        await updateDoc(phoneRef, {
          validRatings: increment(isValid ? 1 : 0),
          invalidRatings: increment(isValid ? 0 : 1),
          totalRatings: increment(1)
        });
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'évaluation du numéro:', error);
      throw error;
    }
  }

  // Get user's rating for a specific phone number
  async getUserRating(phoneId: string) {
    try {
      const user = this.auth.currentUser;
      if (!user) return null;

      const ratingCollectionRef = collection(this.firestore, 'phoneRating');
      const userRatingQuery = query(
        ratingCollectionRef,
        where('userId', '==', user.uid),
        where('phoneId', '==', phoneId)
      );
      
      const userRatingSnapshot = await getDocs(userRatingQuery);
      
      if (!userRatingSnapshot.empty) {
        const userRatingData = userRatingSnapshot.docs[0].data() as any;
        return userRatingData;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'évaluation:', error);
      return null;
    }
  }


  async getUserRatedPhones() {
    try {
      const user = this.auth.currentUser;
      if (!user) return [];
  
      const ratingCollectionRef = collection(this.firestore, 'phoneRating');
      const userRatingsQuery = query(
        ratingCollectionRef,
        where('userId', '==', user.uid)
      );
  
      const userRatingsSnapshot = await getDocs(userRatingsQuery);
  
      if (userRatingsSnapshot.empty) {
        return [];
      }
  
      const phoneRatings = userRatingsSnapshot.docs.map(doc => {
        return {
          id: doc.id,
          ...doc.data()
        };
      });
  
      // Get the actual phone number details
      const phoneDetails = await Promise.all(
        phoneRatings.map(async (rating: any) => {
          // Get the phone document directly by ID
          const phoneDocRef = doc(this.firestore, 'phoneNumbers', rating.phoneId);
          const phoneDocSnap = await getDoc(phoneDocRef);
  
          if (phoneDocSnap.exists()) {
            const phoneData = phoneDocSnap.data();
            return {
              ratingId: rating.id,
              phoneId: rating.phoneId,
              number: phoneData['number'],
              isValid: rating.isValid,
              comment: rating.comment,
              createdAt: rating.createdAt,
              updatedAt: rating.updatedAt || null,
              validRatings: phoneData['validRatings'] || 0,
              invalidRatings: phoneData['invalidRatings'] || 0,
              totalRatings: phoneData['totalRatings'] || 0
            };
          }
          return null;
        })
      );
  
      // Filter out any null entries (phones that might have been deleted)
      return phoneDetails.filter(phone => phone !== null);
    } catch (error) {
      console.error('Erreur lors de la récupération des numéros évalués:', error);
      return [];
    }
  }

  

  // Search for phone numbers that match a query
  async searchPhoneNumber(query: string) {
    try {
      if (!query || query.trim() === '') {
        return [];
      }

      const phoneCollectionRef = collection(this.firestore, 'phoneNumbers');
      const phonesSnapshot = await getDocs(phoneCollectionRef);
      
      const results: any[] = [];
      
      phonesSnapshot.forEach(doc => {
        const phoneData = doc.data() as any;
        if (phoneData.number && phoneData.number.toString().includes(query)) {
          results.push({
            id: doc.id,
            ...phoneData
          });
        }
      });
      
      return results;
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      return [];
    }
  }


  
}