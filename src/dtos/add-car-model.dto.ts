import { CarDTO } from './add-car.dto';

export class CarModelDTO {
  name: string;
  luggagePayload: number;
  guestQuantity: number;
  partnerId: string;
  photoUrl: string;
  standardPricePerKm: number;
  country: string;
  city: string;
  rank: string;
  details: CarDTO[];
}
