import { google, oauth2_v2 } from 'googleapis';
import { IntegrationGoogleClient } from './IntegrationGoogleClient';

export class IntegrationGoogleUser extends IntegrationGoogleClient {
  getSupportedAPIs = () => google.getSupportedAPIs();

  getUserInfo$ = () =>
    this.request$<oauth2_v2.Schema$Userinfo>(
      [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      {
        method: 'GET',
        url: 'https://www.googleapis.com/oauth2/v3/userinfo',
      }
    );
}
