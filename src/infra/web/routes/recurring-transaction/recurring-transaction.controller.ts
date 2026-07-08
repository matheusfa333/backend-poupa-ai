import {
  BadRequestException,
  UnauthorizedException,
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from 'src/infra/web/auth/auth.guard';
import { IsPublic } from 'src/infra/web/auth/decorators/is-public.decorator';
import { CreateRecurringTransactionUsecase } from 'src/usecases/recurring-transaction/create/create-recurring-transaction.usecase';
import { ListRecurringTransactionsUsecase } from 'src/usecases/recurring-transaction/list/list-recurring-transactions.usecase';
import { ToggleRecurringTransactionUsecase } from 'src/usecases/recurring-transaction/toggle/toggle-recurring-transaction.usecase';
import { DeleteRecurringTransactionUsecase } from 'src/usecases/recurring-transaction/delete/delete-recurring-transaction.usecase';
import { UpdateRecurringTransactionUsecase } from 'src/usecases/recurring-transaction/update/update-recurring-transaction.usecase';
import { RecurringTransactionProcessorService } from 'src/usecases/recurring-transaction/process/recurring-transaction-processor.service';
import { PrismaRecurringTransactionRepository } from 'src/infra/repositories/prisma/recurring-transaction/prisma-recurring-transaction.repository';

@Controller('recurring-transactions')
@UseGuards(AuthGuard)
export class RecurringTransactionController {
  constructor(
    private readonly createUsecase: CreateRecurringTransactionUsecase,
    private readonly listUsecase: ListRecurringTransactionsUsecase,
    private readonly toggleUsecase: ToggleRecurringTransactionUsecase,
    private readonly deleteUsecase: DeleteRecurringTransactionUsecase,
    private readonly updateUsecase: UpdateRecurringTransactionUsecase,
    private readonly processorService: RecurringTransactionProcessorService,
    private readonly repository: PrismaRecurringTransactionRepository,
  ) {}

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    const startDateKey = this.getDateOnlyString(body.startDate, 'Data de início');
    const endDateKey = body.endDate
      ? this.getDateOnlyString(body.endDate, 'Data de fim')
      : undefined;
    const todayKey = this.getTodayDateOnlyString('America/Sao_Paulo');

    if (startDateKey < todayKey) {
      throw new BadRequestException(
        'A data de início não pode ser anterior a hoje',
      );
    }

    if (endDateKey && endDateKey <= startDateKey) {
      throw new BadRequestException(
        'A data de fim deve ser posterior à data de início',
      );
    }

    const result = await this.createUsecase.execute({
      userId: req.userId,
      type: body.type,
      category: body.category,
      paymentMethod: body.paymentMethod,
      amount: body.amount,
      description: body.description,
      frequency: body.frequency,
      startDate: this.parseDateOnly(startDateKey),
      endDate: endDateKey ? this.parseDateOnly(endDateKey) : undefined,
      dayOfMonth: body.dayOfMonth,
      dayOfWeek: body.dayOfWeek,
    });

    return result;
  }

  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const startDateKey = this.getDateOnlyString(body.startDate, 'Data de início');
    const endDateKey = body.endDate
      ? this.getDateOnlyString(body.endDate, 'Data de fim')
      : undefined;

    if (endDateKey && endDateKey <= startDateKey) {
      throw new BadRequestException(
        'A data de fim deve ser posterior à data de início',
      );
    }

    const result = await this.updateUsecase.execute({
      id,
      userId: req.userId,
      type: body.type,
      category: body.category,
      paymentMethod: body.paymentMethod,
      amount: body.amount,
      description: body.description,
      frequency: body.frequency,
      startDate: this.parseDateOnly(startDateKey),
      endDate: endDateKey ? this.parseDateOnly(endDateKey) : null,
      dayOfMonth: body.dayOfMonth ?? null,
      dayOfWeek: body.dayOfWeek ?? null,
    });

    return result;
  }

  private getDateOnlyString(value: unknown, fieldName: string): string {
    if (typeof value !== 'string') {
      throw new BadRequestException(`${fieldName} inválida`);
    }

    const dateOnly = value.split('T')[0];

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      throw new BadRequestException(`${fieldName} inválida`);
    }

    const [year, month, day] = dateOnly.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      throw new BadRequestException(`${fieldName} inválida`);
    }

    return dateOnly;
  }

  private parseDateOnly(dateOnly: string): Date {
    const [year, month, day] = dateOnly.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private getTodayDateOnlyString(timeZone: string): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    return formatter.format(new Date());
  }

  @Get()
  async list(@Req() req: any) {
    const result = await this.listUsecase.execute({
      userId: req.userId,
      activeOnly: false,
    });

    return result;
  }

  @Put(':id/toggle')
  async toggle(@Req() req: any, @Param('id') id: string) {
    const result = await this.toggleUsecase.execute({
      id,
      userId: req.userId,
    });

    return result;
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    const result = await this.deleteUsecase.execute({
      id,
      userId: req.userId,
    });

    return result;
  }

  @Post('process')
  async processNow(@Req() req: any) {
    const result = await this.processorService.processNow(req.userId);
    return result;
  }

  @IsPublic()
  @Get('subscriptions/due-soon')
  async getSubscriptionsDueSoon(@Req() req: any) {
    const apiKey = req.headers['x-api-key'];
    const expectedKey = process.env.N8N_API_KEY;

    if (!expectedKey || apiKey !== expectedKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    const subscriptions = await this.repository.findSubscriptionsDueSoon();
    return { subscriptions };
  }
}
