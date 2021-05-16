import { Controller, HttpException, HttpStatus, Logger } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { UpdateCarModelInformationDTO } from 'src/models/update-car-model-information.dto';
import { CarsService } from './cars.service';

@Controller('cars')
export class CarsController {
  private readonly logger = new Logger('CarsController');

  constructor(private carsService: CarsService) {}

  @MessagePattern('update_car')
  async patchCar(
    @Payload() updateCarModelInformationDTO: UpdateCarModelInformationDTO,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      const carModel = await this.carsService.updateCarModelInformation(
        updateCarModelInformationDTO,
      );
      const details = await this.carsService.getCarsByCarModel(carModel.id);
      return { vehicle: { ...carModel, details } };
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.SERVICE_UNAVAILABLE);
    } finally {
      channel.ack(originalMessage);
    }
  }
}
