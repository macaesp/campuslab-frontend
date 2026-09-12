import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {
    private authService = inject(MsalService);
    isMenuOpen = false;
    userName = '';
    userRoles: string[] = [];

ngOnInit(): void {
    const account = this.authService.instance.getActiveAccount();
        if (account) {
        this.userName = account.name || account.username;
        this.userRoles = (account.idTokenClaims as any)?.roles || [];
    }
    }

toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    }

closeMenu(): void {
    this.isMenuOpen = false;
    }

hasRole(allowedRoles: string[]): boolean {
    return allowedRoles.some(role => this.userRoles.includes(role));
    }

logout(): void {
    this.authService.logoutRedirect();
    }
}
