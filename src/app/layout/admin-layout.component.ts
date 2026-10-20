import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, effect, inject, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  exact?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-admin-layout',
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent {
  private readonly breakpoint = inject(BreakpointObserver);

  protected readonly isMobile = toSignal(
    this.breakpoint.observe('(max-width: 980px)').pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  protected readonly sidenav = viewChild<MatSidenav>('sidenav');

  protected readonly sections: NavSection[] = [
    {
      title: 'Operación',
      items: [
        { label: 'Dashboard', path: '/admin', icon: 'space_dashboard', exact: true },
        { label: 'Reservas', path: '/admin/bookings', icon: 'confirmation_number' },
        { label: 'Viajes', path: '/admin/trips', icon: 'route' },
        { label: 'Clientes', path: '/admin/clients', icon: 'groups' },
      ],
    },
    {
      title: 'Catálogo',
      items: [
        { label: 'Tours', path: '/admin/tours', icon: 'travel_explore' },
        { label: 'Lugares', path: '/admin/places', icon: 'location_on' },
      ],
    },
    {
      title: 'Equipo',
      items: [
        { label: 'Guías', path: '/admin/guides', icon: 'badge' },
        { label: 'Conductores', path: '/admin/drivers', icon: 'directions_bus' },
        { label: 'Buses', path: '/admin/buses', icon: 'airport_shuttle' },
      ],
    },
    {
      title: 'Sistema',
      items: [{ label: 'Usuarios', path: '/admin/users', icon: 'manage_accounts' }],
    },
  ];

  constructor() {
    effect(() => {
      const sidenav = this.sidenav();
      if (!sidenav) return;

      sidenav.mode = this.isMobile() ? 'over' : 'side';
      sidenav.opened = !this.isMobile();
    });
  }

  protected toggleSidenav(): void {
    this.sidenav()?.toggle();
  }

  protected closeOnMobile(): void {
    if (this.isMobile()) this.sidenav()?.close();
  }
}
