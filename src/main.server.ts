import 'zone.js/node';

(process.env as any)['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { provideServerRendering } from '@angular/platform-server';

export async function renderApp() {
  return bootstrapApplication(App, {
    providers: [
      provideRouter(routes),
      importProvidersFrom(ReactiveFormsModule, HttpClientModule),
      provideServerRendering(),
      provideHttpClient(),
    ],
  });
}

export default renderApp;
