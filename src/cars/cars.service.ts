import { Injectable, Logger } from '@nestjs/common';
import { DatabaseError, QueryTypes, Sequelize } from 'sequelize';
import { CarModelDTO } from 'src/dtos/add-car-model.dto';
import { CarDTO } from 'src/dtos/add-car.dto';
import { OneCarDTO } from 'src/dtos/add-one-car.dto';
import { GetCarsByConditionsDTO } from 'src/dtos/get-cars-by-conditions.dto';
import { UpdateCarModelInformationDTO } from 'src/dtos/update-car-model-information.dto';
import { Car } from 'src/models/car.model';
import { CarModel, FilteredCar } from 'src/models/carModel.model';

@Injectable()
export class CarsService {
  private readonly logger = new Logger('CarsService');

  constructor(private sequelize: Sequelize) {}

  async getCarModelsByPartner(partnerId: string) {
    try {
      const carModels = await this.sequelize.query(
        'SP_GetCarModelsByPartner @partnerId=:partnerId',
        {
          type: QueryTypes.SELECT,
          replacements: { partnerId },
          mapToModel: true,
          model: CarModel,
        },
      );
      return carModels;
    } catch (error) {
      this.logger.error(error.message);
      throw DatabaseError;
    }
  }

  async getCarsByCarModel(carModelId: string): Promise<Car[]> {
    try {
      const cars = await this.sequelize.query(
        'SP_GetCarsByCarModel @carModelId=:carModelId',
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

  async registerCarModel(carModelDTO: CarModelDTO) {
    try {
      const inserted = await this.sequelize.query(
        `SP_RegisterCarModels @name=:name, @luggagePayload=:luggagePayload, ` +
          `@guestQuantity=:guestQuantity, @partnerId=:partnerId, ` +
          `@photoUrl=:photoUrl, @standardPricePerKm=:standardPricePerKm, ` +
          `@country=:country,@city=:city,@rank=:rank`,
        {
          type: QueryTypes.SELECT,
          replacements: {
            name: carModelDTO.name,
            luggagePayload: carModelDTO.luggagePayload,
            guestQuantity: carModelDTO.guestQuantity,
            partnerId: carModelDTO.partnerId,
            photoUrl: carModelDTO.photoUrl,
            standardPricePerKm: carModelDTO.standardPricePerKm,
            country: carModelDTO.country,
            city: carModelDTO.city,
            rank: carModelDTO.rank,
          },
          raw: true,
          mapToModel: true,
          model: CarModel,
        },
      );
      return inserted[0];
    } catch (error) {
      this.logger.error(error.message);
      throw DatabaseError;
    }
  }

  async registerCars(carsDTO: CarDTO[], carModelId: string): Promise<Car[]> {
    try {
      const insertedDetail = await Promise.all(
        carsDTO.map(async (cars) => {
          const inserted = await this.sequelize.query(
            `SP_RegisterCars @licencePlate=:licencePlate, @color=:color, ` +
              `@carModelId=:carModelId`,
            {
              type: QueryTypes.SELECT,
              replacements: {
                carModelId,
                licencePlate: cars.licencePlate,
                color: cars.color,
              },
              mapToModel: true,
              model: Car,
            },
          );
          return inserted[0];
        }),
      );
      return insertedDetail;
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  async registerOneCar(oneCarDTO: OneCarDTO): Promise<Car> {
    try {
      const inserted = await this.sequelize.query(
        `SP_RegisterCars @licencePlate=:licencePlate,@color=:color,@carModelId=:carModelId`,
        {
          type: QueryTypes.SELECT,
          replacements: {
            licencePlate: oneCarDTO.licencePlate,
            color: oneCarDTO.color,
            carModelId: oneCarDTO.carModelId,
          },
          raw: true,
          mapToModel: true,
          model: Car,
        },
      );
      return inserted[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  // get-cars-by-condition.dto.ts
  async getCarsByConditions(
    getCarsByConditionsDTO: GetCarsByConditionsDTO,
  ): Promise<FilteredCar[]> {
    try {
      const car = await this.sequelize.query(
        `SP_GetCarsByConditions @date=:date,@pickUpTime=:pickUpTime,@depCity=:depCity,@depCountry=:depCountry`,
        {
          type: QueryTypes.SELECT,
          replacements: { ...getCarsByConditionsDTO },
          raw: true,
          mapToModel: true,
          model: FilteredCar,
        },
      );
      if (
        typeof Object.keys(car) !== null &&
        typeof Object.keys(car) !== 'undefined' &&
        Object.keys(car).length > 0
      )
        return JSON.parse(Object.values(car[0])[0]);
      return [];
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
