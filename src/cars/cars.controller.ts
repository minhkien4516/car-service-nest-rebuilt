import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Query,
} from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { CarModelDTO } from 'src/dtos/add-car-model.dto';
import { OneCarDTO } from 'src/dtos/add-one-car.dto';
import { GetCarsByConditionsDTO } from 'src/dtos/get-cars-by-conditions.dto';
import { UpdateCarModelInformationDTO } from 'src/dtos/update-car-model-information.dto';

import { CarsService } from './cars.service';

@Controller('cars')
export class CarsController {
  private readonly logger = new Logger('CarsController');

  constructor(private carsService: CarsService) {}

  @MessagePattern('get_cars_by_partner')
  async getCars(@Payload() partnerId: string, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      const carModels = await this.carsService.getCarModelsByPartner(partnerId);
      const cars = await Promise.all(
        carModels.map(async (carModel) => {
          const details = await this.carsService.getCarsByCarModel(carModel.id);
          return { ...carModel, details };
        }),
      );
      return { cars };
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.SERVICE_UNAVAILABLE);
    } finally {
      channel.ack(originalMessage);
    }
  }

  @MessagePattern('get_cars_by_conditions')
  @Get('searchBy')
  public async getCarsByConditions(
    @Query() getCarsByConditionsDTO: GetCarsByConditionsDTO,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      const filteredCar = await this.carsService.getCarsByConditions(
        getCarsByConditionsDTO,
      );
      return { vehicles: filteredCar };
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.SERVICE_UNAVAILABLE);
    } finally {
      channel.ack(originalMessage);
    }
  }

  @MessagePattern('register_car')
  async postCar(
    @Payload() carModelDTO: CarModelDTO,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    const { details } = carModelDTO;
    try {
      const carModel = await this.carsService.registerCarModel(carModelDTO);
      const carModelDetail = await this.carsService.registerCars(
        details,
        carModel.id,
      );
      return {
        vehicle: { ...carModel, details: [...carModelDetail] },
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.SERVICE_UNAVAILABLE);
    } finally {
      channel.ack(originalMessage);
    }
  }

  @MessagePattern('register_one_car')
  async postOneCar(
    @Payload() oneCarDTO: OneCarDTO,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      const car = await this.carsService.registerOneCar(oneCarDTO);
      return { vehicle: { ...car } };
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.SERVICE_UNAVAILABLE);
    } finally {
      channel.ack(originalMessage);
    }
  }

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
