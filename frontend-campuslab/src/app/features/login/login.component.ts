import { Component, inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'cl-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private msal = inject(MsalService);

  // /login · público. Redirige a Azure AD (login.microsoftonline.com).
  loginWithMicrosoft(): void {
    this.msal.loginRedirect();
  }
}
