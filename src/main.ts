import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, HttpClientModule } from '@angular/common/http';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient() // <-- Add this provider
  ]
}).catch(err => console.error(err));
