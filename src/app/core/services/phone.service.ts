import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, collection, collectionData, query, where, getDocs, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class PhoneService {

  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {}

  async ratePhoneNumber(phoneId: string, isValid: boolean) {
    try {
      const currentUserId = this.auth.currentUser?.uid;
      
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      // Get reference to the ratings collection
      const ratingsRef = collection(this.firestore, 'phoneRatings');
      
      // Check if user already rated this phone
      const q = query(
        ratingsRef, 
        where('phoneId', '==', phoneId),
        where('userId', '==', currentUserId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Update existing rating
        const ratingId = querySnapshot.docs[0].id;
        const ratingRef = doc(this.firestore, 'phoneRatings', ratingId);
        
        await updateDoc(ratingRef, {
          isValid: isValid,
          updatedAt: new Date()
        });
      } else {
        // Create new rating
        await setDoc(doc(ratingsRef), {
          phoneId: phoneId,
          userId: currentUserId,
          isValid: isValid,
          createdAt: new Date()
        });
      }

      // Update the phone stats
      await this.updatePhoneRatingStats(phoneId);
      
      return { success: true };
    } catch (error) {
      console.error('Error rating phone number:', error);
      throw error;
    }
  }

  async updatePhoneRatingStats(phoneId: string) {
    try {
      // Get all ratings for this phone
      const ratingsRef = collection(this.firestore, 'phoneRatings');
      const q = query(ratingsRef, where('phoneId', '==', phoneId));
      const querySnapshot = await getDocs(q);
      
      let validCount = 0;
      let invalidCount = 0;
      
      querySnapshot.forEach(doc => {
        const rating = doc.data();
        if (rating['isValid']) {
          validCount++;
        } else {
          invalidCount++;
        }
      });
      
      // Update phone document with stats
      const phoneRef = doc(this.firestore, 'phoneNumbers', phoneId);
      await updateDoc(phoneRef, {
        validRatings: validCount,
        invalidRatings: invalidCount,
        totalRatings: validCount + invalidCount,
        lastUpdated: new Date()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating phone stats:', error);
      throw error;
    }
  }

  async getPhoneRatings(phoneId: string) {
    try {
      const ratingsRef = collection(this.firestore, 'phoneRatings');
      const q = query(ratingsRef, where('phoneId', '==', phoneId));
      
      const querySnapshot = await getDocs(q);
      
      let validCount = 0;
      let invalidCount = 0;
      let userRating = null;
      
      const currentUserId = this.auth.currentUser?.uid;
      
      querySnapshot.forEach(doc => {
        const rating = doc.data();
        if (rating['isValid']) {
          validCount++;
        } else {
          invalidCount++;
        }
        
        // Check if this is the current user's rating
        if (rating['userId'] === currentUserId) {
          userRating = {
            id: doc.id,
            isValid: rating['isValid']
          };
        }
      });
      
      return {
        validCount,
        invalidCount,
        totalCount: validCount + invalidCount,
        userRating
      };
    } catch (error) {
      console.error('Error getting phone ratings:', error);
      throw error;
    }
  }

  async getUserRating(phoneId: string) {
    try {
      const currentUserId = this.auth.currentUser?.uid;
      
      if (!currentUserId) {
        return null;
      }
      
      const ratingsRef = collection(this.firestore, 'phoneRatings');
      const q = query(
        ratingsRef, 
        where('phoneId', '==', phoneId),
        where('userId', '==', currentUserId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const ratingDoc = querySnapshot.docs[0];
      return {
        id: ratingDoc.id,
        isValid: ratingDoc.data()['isValid']
      };
    } catch (error) {
      console.error('Error getting user rating:', error);
      throw error;
    }
  }
}