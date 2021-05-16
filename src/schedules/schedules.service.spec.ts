import { Test, TestingModule } from '@nestjs/testing';
import { SchedulesService } from './schedules.service';

describe('SchedulesService', () => {
  let schedulesService: SchedulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchedulesService],
    }).compile();

    schedulesService = module.get<SchedulesService>(SchedulesService);
  });

  it('should be defined', () => {
    expect(schedulesService).not.toBeDefined();
  });
});
