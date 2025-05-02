import { Injectable } from '@angular/core';
import { Storage, ref, uploadString, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class FirebasestorageService {
  constructor(
    private storage: Storage,
    private firestore: Firestore,
    private storageService: StorageService
  ) {}

  // Upload image to Firebase Storage
  async uploadProfileImage(imageDataUrl: string): Promise<string> {
    try {
      const userProfile = this.storageService.getUserProfile();
      
      if (!userProfile || !userProfile.uid) {
        throw new Error('Utilisateur non connecté');
      }

      const userId = userProfile.uid;
      const filePath = `profile_images/${userId}/profile.jpg`;
      const storageRef = ref(this.storage, filePath);

      // Remove header from base64 string if it exists
      const base64Data = imageDataUrl.includes('base64,') 
        ? imageDataUrl.split('base64,')[1]
        : imageDataUrl;

      // Upload string with data_url format
      await uploadString(storageRef, imageDataUrl, 'data_url');
      
      // Get the download URL
      const downloadUrl = await getDownloadURL(storageRef);
      
      // Update user profile in Firestore
      const userDocRef = doc(this.firestore, `businesses/${userId}`);
      await updateDoc(userDocRef, {
        profileImageUrl: downloadUrl
      });

      // Update local storage
      userProfile.profileImageUrl = downloadUrl;
      this.storageService.setUserProfile(userProfile);
      
      return downloadUrl;
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      throw error;
    }
  }

  // Delete profile image
  async deleteProfileImage(): Promise<void> {
    try {
      const userProfile = this.storageService.getUserProfile();
      
      if (!userProfile || !userProfile.uid) {
        throw new Error('Utilisateur non connecté');
      }

      const userId = userProfile.uid;
      const filePath = `profile_images/${userId}/profile.jpg`;
      const storageRef = ref(this.storage, filePath);

      // Delete the file
      await deleteObject(storageRef);
      
      // Update user profile in Firestore
      const userDocRef = doc(this.firestore, `businesses/${userId}`);
      await updateDoc(userDocRef, {
        profileImageUrl: null
      });

      // Update local storage
      userProfile.profileImageUrl = null;
      this.storageService.setUserProfile(userProfile);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      throw error;
    }
  }
}
