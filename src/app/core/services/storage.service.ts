import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private userProfile: any = null;

  constructor() {
    const savedData = localStorage.getItem('userProfile');
    if (savedData) {
      this.userProfile = JSON.parse(savedData);
    }
  }

  setUserProfile(profile: any): void {
    this.userProfile = profile;
    localStorage.setItem('userProfile', JSON.stringify(profile)); 
  }

  getUserProfile(): any {
    return this.userProfile;
  }

  clear(): void {
    this.userProfile = null;
    localStorage.removeItem('userProfile');
  }

  // Nouvelles méthodes pour stocker/récupérer l'image de profil
  setProfileImage(imageUrl: string): void {
    if (this.userProfile) {
      this.userProfile.profileImageUrl = imageUrl;
      localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
    }
  }

  getProfileImage(): string | null {
    return this.userProfile?.profileImageUrl || null;
  }
}