import { Body, Controller, Get, HttpException, HttpStatus, Logger, Post, Query } from '@nestjs/common';
import { SchedulesDTO } from 'src/dtos/add-schedules.dto';

import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  private readonly logger = new Logger('SchedulesController');
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  async getSchedules(
    @Query('carId') carId: string,
    @Query('date') date: string,
  ) {
    try {
      const schedules = await this.schedulesService.getSchedulesByCarDate(
        carId,
        date,
      );
      const journeys = await Promise.all(
        schedules.map(async (schedule) => {
          const details = await this.schedulesService.getJourneys(schedule.id);
          return { ...schedule, details };
        }),
      );
      return { schedules: journeys };
    } catch (error) {
      this.logger.error(error.message);
      throw HttpStatus.SERVICE_UNAVAILABLE;
    }
  }

  @Post()
  async postSchedules(@Body() schedulesDTO: SchedulesDTO) {
    const { details, cars } = schedulesDTO;

    try {
      const schedule = await this.schedulesService.addSchedule(schedulesDTO);
      const car = await this.schedulesService.addScheduleDetail(
        cars,
        schedule.id,
      );
      console.log(cars);
      const scheduleDetails = await this.schedulesService.addJourney(
        details,
        schedule.id,
      );
      return {
        ...schedule,
        cars: [...car],
        details: [...scheduleDetails],
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
