import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(private translate: TranslateService) {
      this.translate.addLangs(['en', 'fr', 'ar']);


    this.translate.setDefaultLang('fr');

   
    const browserLang = this.translate.getBrowserLang();
    const langToUse = browserLang && ['en', 'fr', 'ar'].includes(browserLang) ? browserLang : 'fr';
    this.translate.use(langToUse);
  }
  
}
