import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private userProfile: any = null;

  constructor() {
    // تحميل البيانات من localStorage عند بدء الخدمة
    const savedData = localStorage.getItem('userProfile');
    if (savedData) {
      this.userProfile = JSON.parse(savedData);
    }
  }

  setUserProfile(profile: any): void {
    this.userProfile = profile;
    localStorage.setItem('userProfile', JSON.stringify(profile)); // حفظ دائم
  }

  getUserProfile(): any {
    return this.userProfile;
  }

  clear(): void {
    this.userProfile = null;
    localStorage.removeItem('userProfile');
  }
}
