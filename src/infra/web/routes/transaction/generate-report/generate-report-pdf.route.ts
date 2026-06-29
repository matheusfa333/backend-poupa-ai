import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { GenerateReportUsecase } from 'src/usecases/transaction/generate-report/generate-report.usecase';
import { generateReportQuerySchema } from './generate-report.dto';
import type { GenerateReportQueryDto } from './generate-report.dto';
import { UserId } from 'src/infra/web/auth/decorators/user-id.decorator';
import { ZodValidationPipe } from 'src/infra/web/pipes/zod-validation.pipe';
import { ReportPdfService } from 'src/infra/services/pdf/report-pdf.service';

@Controller('transactions')
export class GenerateReportPdfRoute {
  public constructor(
    private readonly generateReportUsecase: GenerateReportUsecase,
    private readonly reportPdfService: ReportPdfService,
  ) {}

  @Get('report/pdf')
  public async handle(
    @UserId() userId: string,
    @Query(new ZodValidationPipe(generateReportQuerySchema)) validatedQuery: GenerateReportQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const now = new Date();
    const month = validatedQuery.month || now.getMonth() + 1;
    const year = validatedQuery.year || now.getFullYear();
    const includeComparison = validatedQuery.includeComparison ?? true;

    const report = await this.generateReportUsecase.execute({
      userId,
      month,
      year,
      includeComparison,
    });

    const pdfBuffer = this.reportPdfService.generate(report);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="relatorio-poupaai-${month}-${year}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }
}
