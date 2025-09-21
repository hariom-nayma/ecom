import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import "./polyfills"
import { registerLocaleData } from '@angular/common';
import localeIn from '@angular/common/locales/en-IN';

// ✅ Register Indian locale
registerLocaleData(localeIn);
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
