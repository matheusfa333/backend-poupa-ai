import { Controller, Get, Query } from '@nestjs/common';
import { GenerateReportUsecase } from 'src/usecases/transaction/generate-report/generate-report.usecase';
import { generateReportQuerySchema } from './generate-report.dto';
import type { GenerateReportQueryDto } from './generate-report.dto';
import { GenerateReportPresenter } from './generate-report.presenter';
import { UserId } from 'src/infra/web/auth/decorators/user-id.decorator';
import { ZodValidationPipe } from 'src/infra/web/pipes/zod-validation.pipe';

@Controller('transactions')
export class GenerateReportRoute {
  constructor(private readonly generateReportUsecase: GenerateReportUsecase) {}

  @Get('report')
  async handle(
    @UserId() userId: string,
    @Query(new ZodValidationPipe(generateReportQuerySchema)) validatedQuery: GenerateReportQueryDto,
  ) {
    const now = new Date();
    const month = validatedQuery.month || now.getMonth() + 1;
    const year = validatedQuery.year || now.getFullYear();
    const includeComparison = validatedQuery.includeComparison ?? true;

    const output = await this.generateReportUsecase.execute({
      userId,
      month,
      year,
      includeComparison,
    });

    // Formatar resposta
    return GenerateReportPresenter.toHttp(output);
  }
}
