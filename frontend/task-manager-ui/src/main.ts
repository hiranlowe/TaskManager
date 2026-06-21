import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { APP_CONFIG, AppConfig } from './app/config/app-config';
import { environment } from './environments/environment';

const fallbackConfig: AppConfig = {
  apiBaseUrl: environment.apiBaseUrl
};

const bootstrap = (runtimeConfig: AppConfig) => bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),
    { provide: APP_CONFIG, useValue: runtimeConfig }
  ]
});

fetch('/app-config.json')
  .then(async (response) => {
    if (!response.ok) {
      throw new Error(`Unable to load runtime config: ${response.status}`);
    }

    return response.json() as Promise<AppConfig>;
  })
  .then((runtimeConfig) => bootstrap(runtimeConfig))
  .catch((err) => {
    console.warn('Falling back to bundled config.', err);
    return bootstrap(fallbackConfig);
  })
  .catch((err) => console.error(err));
