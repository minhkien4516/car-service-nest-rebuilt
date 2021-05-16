import { Injectable, Logger } from '@nestjs/common';
import { DatabaseError } from 'sequelize';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize';
import { Car } from 'src/models/car.model';
import { CarModel } from 'src/models/carModel.model';
import { UpdateCarModelInformationDTO } from 'src/models/update-car-model-information.dto';

@Injectable()
export class CarsService {
  private readonly logger = new Logger('CarsService');

  constructor(private sequelize: Sequelize) {}

  async getCarsByCarModel(carModelId: string): Promise<Car[]> {
    try {
      const cars = await this.sequelize.query(
        'SP_GetCarByCarModel @carModelId=:carModelId',
        {
          type: QueryTypes.SELECT,
          replacements: { carModelId },
          raw: true,
          mapToModel: true,
          model: Car,
        },
      );
      return cars;
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  async getCarModelById(id: string): Promise<CarModel> {
    try {
      const carModel = await this.sequelize.query(
        'SP_GetCarModelById @id=:id',
        {
          type: QueryTypes.SELECT,
          replacements: { id },
          raw: true,
          mapToModel: true,
          model: CarModel,
        },
      );
      return carModel[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  async updateCarModelInformation(
    updateCarModelInformationDTO: UpdateCarModelInformationDTO,
  ): Promise<CarModel> {
    try {
      const carModel = await this.sequelize.query(
        'SP_UpdateCarModelInformation @id=:vehicleId, @name=:name, ' +
          '@luggagePayload=:luggagePayload, @guestQuantity=:guestQuantity, ' +
          '@photoUrl=:photoUrl, @rank=:rank, @city=:city, ' +
          '@standardPricePerKm=:standardPricePerKm, @country=:country',
        {
          type: QueryTypes.SELECT,
          replacements: { ...updateCarModelInformationDTO },
          raw: true,
          mapToModel: true,
          model: CarModel,
        },
      );
      return carModel[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }
}
