import { Controller, HttpException, HttpStatus, Logger } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { SchedulesDTO } from 'src/dtos/add-schedules.dto';

import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  private readonly logger = new Logger('SchedulesController');
  constructor(private readonly schedulesService: SchedulesService) {}

  @MessagePattern('get_schedules_by_car_and_date')
  async getSchedules(
    @Payload() data: { carId: string; date: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      const schedules = await this.schedulesService.getSchedulesByCarDate(
        data.carId,
        data.date,
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
      throw new HttpException(error.message, HttpStatus.SERVICE_UNAVAILABLE);
    } finally {
      channel.ack(originalMessage);
    }
  }

  @MessagePattern('add_schedule')
  async postSchedules(
    @Payload() schedulesDTO: SchedulesDTO,
    @Ctx() context: RmqContext,
  ) {
    const { details, cars } = schedulesDTO;
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
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
    } finally {
      channel.ack(originalMessage);
    }
  }
}
