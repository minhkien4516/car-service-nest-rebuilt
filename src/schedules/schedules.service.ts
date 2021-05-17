import { Injectable, Logger } from '@nestjs/common';
import { DatabaseError, QueryTypes, Sequelize } from 'sequelize';
import { ScheduleDetailsDTO } from 'src/dtos/add-cars.-scheduleDetails.dto';
import { JourneysDTO } from 'src/dtos/add-journeys.dto';
import { SchedulesDTO } from 'src/dtos/add-schedules.dto';
import { Journeys } from 'src/models/journey.model';
import { ScheduleDetails } from 'src/models/scheduleDetails.model';
import { Schedules } from 'src/models/schedules.model';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger('SchedulesService');

  constructor(private sequelize: Sequelize) {}

  async getSchedulesByCarDate(
    carId: string,
    date: string,
  ): Promise<Schedules[]> {
    try {
      const schedules = await this.sequelize.query(
        `SP_GetSchedulesByCarAndDate @carId=:carId,@date=:date`,
        {
          type: QueryTypes.SELECT,
          replacements: { carId, date },
          raw: true,
          mapToModel: true,
          model: Schedules,
        },
      );
      return schedules;
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  async getJourneys(scheduleId: string): Promise<Journeys[]> {
    try {
      const details = await this.sequelize.query(
        'SP_GetJourneys @scheduleId=:scheduleId',
        {
          type: QueryTypes.SELECT,
          replacements: { scheduleId },
          raw: true,
          mapToModel: true,
          model: Journeys,
        },
      );
      return details;
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }

  async addSchedule(schedulesDTO: SchedulesDTO): Promise<Schedules> {
    try {
      const inserted = await this.sequelize.query(
        `SP_AddSchedules @date=:date,@start=:start,@travel=:travel`,
        {
          type: QueryTypes.SELECT,
          replacements: {
            date: schedulesDTO.date,
            start: schedulesDTO.start,
            travel: schedulesDTO.travel,
          },
          raw: true,
          mapToModel: true,
          model: Schedules,
        },
      );
      return inserted[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }
  async addJourney(
    journeysDTO: JourneysDTO[],
    scheduleId: string,
  ): Promise<Journeys[]> {
    try {
      const insertedDetails = await Promise.all(
        journeysDTO.map(async (details, index) => {
          const inserted = await this.sequelize.query(
            `SP_AddJourneys @scheduleId=:scheduleId,@description=:description,@placeId=:placeId,@orderNumber=:orderNumber, @district=:district,@city=:city,@country=:country`,
            {
              type: QueryTypes.SELECT,
              replacements: {
                scheduleId,
                placeId: details.placeId,
                description: details.description,
                district: details.district,
                city: details.city,
                country: details.country,
                orderNumber: index,
              },
              raw: true,
              mapToModel: true,
              model: Journeys,
            },
          );
          return inserted[0];
        }),
      );
      return insertedDetails;
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }
  async addScheduleDetail(
    scheduleDetailsDTO: ScheduleDetailsDTO[],
    scheduleId: string,
  ): Promise<ScheduleDetails[]> {
    try {
      const insertedDetails = await Promise.all(
        scheduleDetailsDTO.map(async (cars) => {
          const inserted = await this.sequelize.query(
            `SP_AddScheduleDetails @id=:id,@scheduleId=:scheduleId`,
            {
              type: QueryTypes.SELECT,
              replacements: {
                scheduleId,
                id: cars.id,
              },
              raw: true,
              mapToModel: true,
              model: ScheduleDetails,
            },
          );
          return inserted[0];
        }),
      );
      return insertedDetails;
    } catch (error) {
      this.logger.error(error.message);
      throw new DatabaseError(error);
    }
  }
}
