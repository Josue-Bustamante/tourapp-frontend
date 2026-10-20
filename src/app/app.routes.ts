import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layout/public-layout.component';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { ToursComponent } from './pages/tours/tours.component';
import { TourDetailComponent } from './pages/tour-detail/tour-detail.component';
import { ReservationComponent } from './pages/reservation/reservation.component';
import { DashboardComponent } from './pages/admin/dashboard.component';
import { ToursAdminComponent } from './pages/admin/tours-admin.component';
import { TripsAdminComponent } from './pages/admin/trips-admin.component';
import { BookingsAdminComponent } from './pages/admin/bookings-admin.component';
import { ClientsAdminComponent } from './pages/admin/clients-admin.component';
import { PlacesAdminComponent } from './pages/admin/places-admin.component';
import { GuidesAdminComponent } from './pages/admin/guides-admin.component';
import { DriversAdminComponent } from './pages/admin/drivers-admin.component';
import { BusesAdminComponent } from './pages/admin/buses-admin.component';
import { UsersAdminComponent } from './pages/admin/users-admin.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent, title: 'TourApp · Viajes que se sienten' },
      { path: 'tours', component: ToursComponent, title: 'Tours · TourApp' },
      { path: 'tours/:id', component: TourDetailComponent, title: 'Detalle del tour · TourApp' },
      {
        path: 'reservar/:idTour',
        component: ReservationComponent,
        title: 'Reserva tu viaje · TourApp',
      },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', component: DashboardComponent, title: 'Dashboard · TourApp' },
      { path: 'tours', component: ToursAdminComponent, title: 'Tours · Administración' },
      { path: 'trips', component: TripsAdminComponent, title: 'Viajes · Administración' },
      { path: 'bookings', component: BookingsAdminComponent, title: 'Reservas · Administración' },
      { path: 'clients', component: ClientsAdminComponent, title: 'Clientes · Administración' },
      { path: 'places', component: PlacesAdminComponent, title: 'Lugares · Administración' },
      { path: 'guides', component: GuidesAdminComponent, title: 'Guías · Administración' },
      { path: 'drivers', component: DriversAdminComponent, title: 'Conductores · Administración' },
      { path: 'buses', component: BusesAdminComponent, title: 'Buses · Administración' },
      { path: 'users', component: UsersAdminComponent, title: 'Usuarios · Administración' },
    ],
  },
  { path: '**', redirectTo: '' },
];
