

  import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.page.html',
  styleUrls: ['./loading.page.scss'],

  standalone: true,
  imports: [CommonModule, IonContent, IonSpinner]
})
export class LoadingPage implements OnInit, AfterViewInit {
  @ViewChild('animationGif') gifElement!: ElementRef<HTMLImageElement>;
  
  showFallback = false;
  private gifLoaded = false;

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private authService: AuthService
  ) { }

  ngOnInit() {
    console.log('Loading component initialized');
    
    // Set a fallback timer in case GIF fails to load
    setTimeout(() => {
      if (!this.gifLoaded) {
        console.log('GIF not loaded after timeout, showing fallback');
        this.showFallback = true;
        
        // Navigate to home after showing fallback
        setTimeout(() => this.navigateToHome(), 2000);
      }
    }, 2500);
    
    // Navigate to home after GIF animation should be complete
    // Assuming the GIF animation is around 3-4 seconds
    setTimeout(() => {
      this.navigateToHome();
    }, 3800);
  }

  ngAfterViewInit() {
    // Check if GIF is already loaded (might have been cached)
    if (this.gifElement?.nativeElement.complete) {
      this.onGifLoaded();
    }
  }

  onGifLoaded() {
    console.log('GIF loaded successfully');
    this.gifLoaded = true;
  }

  navigateToHome() {
    this.authService.getCurrentUser().subscribe(result => {
      this.ngZone.run(() => {
        if (result?.role === 'admin') {
          console.log('Navigating to admin dashboard');
          this.router.navigateByUrl('/admin', { replaceUrl: true });
        } else {
          console.log('Navigating to home page');
          this.router.navigateByUrl('/home', { replaceUrl: true });
        }
      });
    });
  }
  
  
} 