export interface Booking {
  idBooking?: number;
  dateTime: string;
  totalPrice: number;
  idClient: number;
  idUser: number;
  idTrip: number;
}
