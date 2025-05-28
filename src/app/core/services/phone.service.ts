import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, collection, collectionData, query, where, getDocs, updateDoc, addDoc, increment, getDoc, deleteDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

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

  // Get all ratings for a specific phone number
  async getPhoneComments(phoneId: string) {
  try {
    const ratingCollectionRef = collection(this.firestore, 'phoneRating');
    const phoneRatingsQuery = query(
      ratingCollectionRef,
      where('phoneId', '==', phoneId)
    );
    
    const ratingsSnapshot = await getDocs(phoneRatingsQuery);
    
    if (ratingsSnapshot.empty) {
      return [];
    }
    
    // Map the ratings data with their document IDs
    const ratings = ratingsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        isValid: data['isValid'],
        comment: data['comment'] || '', // تأكد من وجود comment
        timestamp: data['createdAt'], // استخدم timestamp بدلاً من createdAt
        createdAt: data['createdAt'] ? data['createdAt'].toDate() : new Date(),
        updatedAt: data['updatedAt'] ? data['updatedAt'].toDate() : null
      };
    });
    
    // Sort ratings by creation date (newest first)
    return ratings.sort((a: any, b: any) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    return [];
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

  // Delete a phone number from the database
  async deletePhoneNumber(phoneId: string) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('Utilisateur non connecté');

      // 1. Delete the phone number document
      const phoneRef = doc(this.firestore, 'phoneNumbers', phoneId);
      
      // Check if the phone belongs to the current user
      const phoneDoc = await getDoc(phoneRef);
      if (!phoneDoc.exists()) {
        throw new Error('Numéro de téléphone non trouvé');
      }
      
      const phoneData = phoneDoc.data();
      if (phoneData['userId'] !== user.uid) {
        throw new Error('Vous n\'êtes pas autorisé à supprimer ce numéro');
      }
      
      // 2. Find and delete all ratings for this phone
      const ratingCollectionRef = collection(this.firestore, 'phoneRating');
      const phoneRatingsQuery = query(
        ratingCollectionRef,
        where('phoneId', '==', phoneId)
      );
      
      const ratingsSnapshot = await getDocs(phoneRatingsQuery);
      
      // Delete all ratings in a batch
      const deletionPromises = ratingsSnapshot.docs.map(ratingDoc => {
        const ratingRef = doc(this.firestore, 'phoneRating', ratingDoc.id);
        return deleteDoc(ratingRef);
      });
      
      // 3. Wait for all rating deletions to complete
      await Promise.all(deletionPromises);
      
      // 4. Delete the phone document itself
      await deleteDoc(phoneRef);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du numéro:', error);
      throw error;
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

  getPhoneNumbers(): Observable<any[]> {
    const phoneCollectionRef = collection(this.firestore, 'phoneNumbers');
    return collectionData(phoneCollectionRef, { idField: 'id' }) as Observable<any[]>;
  }
}