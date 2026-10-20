import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IsActiveMatchOptions, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface NavLink {
  label: string;
  path: string;
  fragment?: string;
  activeOptions: IsActiveMatchOptions;
}

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.css',
})
export class PublicLayoutComponent {
  private readonly snackBar = inject(MatSnackBar);

  protected readonly menuOpen = signal(false);
  protected readonly year = new Date().getFullYear();
  protected readonly navLinks: NavLink[] = [
    {
      label: 'Inicio',
      path: '/',
      activeOptions: {
        paths: 'exact',
        queryParams: 'ignored',
        matrixParams: 'ignored',
        fragment: 'exact',
      },
    },
    {
      label: 'Tours',
      path: '/tours',
      activeOptions: {
        paths: 'subset',
        queryParams: 'ignored',
        matrixParams: 'ignored',
        fragment: 'ignored',
      },
    },
    {
      label: 'Destinos',
      path: '/',
      fragment: 'destinos',
      activeOptions: {
        paths: 'exact',
        queryParams: 'ignored',
        matrixParams: 'ignored',
        fragment: 'exact',
      },
    },
    {
      label: 'Nosotros',
      path: '/',
      fragment: 'nosotros',
      activeOptions: {
        paths: 'exact',
        queryParams: 'ignored',
        matrixParams: 'ignored',
        fragment: 'exact',
      },
    },
  ];

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected subscribe(email: string): void {
    const value = email.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    if (!valid) {
      this.snackBar.open('Ingresa un correo válido para suscribirte.', 'Cerrar', {
        duration: 3200,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
      return;
    }

    this.snackBar.open('¡Gracias! Pronto recibirás nuestras mejores rutas.', 'OK', {
      duration: 3200,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
