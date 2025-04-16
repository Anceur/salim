import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class SettingsPage implements OnInit {
  // Default settings
  settings = {
    // System settings
    maintenanceMode: false,
    debugMode: false,
    systemNotifications: true,
    cacheControl: 'moderate',
    
    // User management
    allowRegistrations: true,
    defaultUserRole: 'user',
    userApproval: 'email',
    sessionTimeout: 30,
    
    // Security
    twoFactorAuth: false,
    strongPasswords: true,
    passwordExpiry: 90,
    ipRestriction: false,
    allowedIPs: '',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsAlerts: false,
    activityLog: true,
    
    // Appearance
    theme: 'system',
    primaryColor: '#3880ff',
    secondaryColor: '#3dc2ff',
    fontSize: 14,
    
    // Backup & Restore
    autoBackup: true,
    backupFrequency: 'weekly',
    backupStorage: 'cloud'
  };

  constructor(private toastController: ToastController) {}

  ngOnInit() {
    // Load saved settings
    this.loadSettings();
  }

  loadSettings() {
    // In a real application, you would fetch these from a service or API
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      this.settings = JSON.parse(savedSettings);
    }
  }

  async saveSettings() {
    // In a real application, you would save these via a service or API
    localStorage.setItem('adminSettings', JSON.stringify(this.settings));
    
    // Show success toast
    const toast = await this.toastController.create({
      message: 'Settings saved successfully',
      duration: 2000,
      position: 'bottom',
      color: 'success',
      buttons: [
        {
          side: 'end',
          icon: 'checkmark-done',
          role: 'cancel'
        }
      ]
    });
    toast.present();
  }

  resetToDefaults() {
    // Reset to default values implementation
    this.settings = {
      maintenanceMode: false,
      debugMode: false,
      systemNotifications: true,
      cacheControl: 'moderate',
      allowRegistrations: true,
      defaultUserRole: 'user',
      userApproval: 'email',
      sessionTimeout: 30,
      twoFactorAuth: false,
      strongPasswords: true,
      passwordExpiry: 90,
      ipRestriction: false,
      allowedIPs: '',
      emailNotifications: true,
      pushNotifications: true,
      smsAlerts: false,
      activityLog: true,
      theme: 'system',
      primaryColor: '#3880ff',
      secondaryColor: '#3dc2ff',
      fontSize: 14,
      autoBackup: true,
      backupFrequency: 'weekly',
      backupStorage: 'cloud'
    };
  }

  exportSettings() {
    const dataStr = JSON.stringify(this.settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'admin-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
}