import { Module } from '@nestjs/common';
import { CreateUserRoute } from './routes/user/create/create-user.route';
import { UsecaseModule } from 'src/usecases/user/usecase.module';
import { TransactionUsecaseModule } from 'src/usecases/transaction/usecase.module';
import { RecurringTransactionUsecaseModule } from 'src/usecases/recurring-transaction/usecase.module';
import { ValidatorDomainExceptionFilterProvider } from './filters/validator-domain.exception.filter';
import { DomainExceptionFilterProvider } from './filters/domain-exception.filter';
import { UsecaseExceptionFilterProvider } from './filters/usecase-exception.filter';
import { CredentialsNotValidUsecaseExceptionFilterProvider } from './filters/credentials-not-valid-usecase-exception.filter';
import { EmailAlreadyExistsUsecaseExceptionFilterProvider } from './filters/email-already-exists-usecase-exception.filter';
import { UserNotFoundUsecaseExceptionFilterProvider } from './filters/user-not-found-usecase-exception.filter';
import { WhatsappAlreadyInUseUsecaseExceptionFilterProvider } from './filters/whatsapp-already-in-use-usecase-exception.filter';
import { WhatsappNotLinkedUsecaseExceptionFilterProvider } from './filters/whatsapp-not-linked-usecase-exception.filter';
import { ServiceExceptionFilterProvider } from './filters/service-exception.filter';
import { RefreshTokenNotValidServiceExceptionFilterProvider } from './filters/refresh-token-not-valid-service-exception.filter';
import { TransactionNotFoundUsecaseExceptionFilterProvider } from './filters/transaction-not-found-usecase-exception.filter';
import { UnauthorizedTransactionAccessUsecaseExceptionFilterProvider } from './filters/unauthorized-transaction-access-usecase-exception.filter';
import { RecurringTransactionNotEditableUsecaseExceptionFilterProvider } from './filters/recurring-transaction-not-editable-usecase-exception.filter';
import { LoginUserRoute } from './routes/user/login/login-user.route';
import { RefreshAuthTokenRoute } from './routes/user/refresh/refresh-auth-token.route';
import { FindByIdUserRoute } from './routes/user/find-by-id/find-by-id-user.route';
import { UpdateProfileRoute } from './routes/user/update-profile/update-profile.route';
import { ChangePasswordRoute } from './routes/user/change-password/change-password.route';
import { DeleteAccountRoute } from './routes/user/delete-account/delete-account.route';
import { LinkWhatsappRoute } from './routes/user/link-whatsapp/link-whatsapp.route';
import { AuthenticateWhatsappRoute } from './routes/user/authenticate-whatsapp/authenticate-whatsapp.route';
import { UnlinkWhatsappRoute } from './routes/user/unlink-whatsapp/unlink-whatsapp.route';
import { AuthGuardProvider } from './auth/auth.guard';
import { ServiceModule } from '../services/service.module';
import { LogoutUserRoute } from './routes/user/logout/logout-user.route';
import { CreateTransactionRoute } from './routes/transaction/create/create-transaction.route';
import { ListTransactionsRoute } from './routes/transaction/list/list-transactions.route';
import { DeleteTransactionRoute } from './routes/transaction/delete/delete-transaction.route';
import { UpdateTransactionRoute } from './routes/transaction/update/update-transaction.route';
import { GetSummaryRoute } from './routes/transaction/summary/get-summary.route';
import { GetExpensesByCategoryRoute } from './routes/transaction/by-category/get-expenses-by-category.route';
import { GetEnumsMetadataRoute } from './routes/metadata/get-enums/get-enums-metadata.route';
import { ExtractFromImageRoute } from './routes/transaction/extract-from-image/extract-from-image.route';
import { GenerateReportRoute } from './routes/transaction/generate-report/generate-report.route';
import { GenerateReportPdfRoute } from './routes/transaction/generate-report/generate-report-pdf.route';
import { ReportPdfService } from '../services/pdf/report-pdf.service';
import { RecurringTransactionModule } from './routes/recurring-transaction/recurring-transaction.module';
import { PluggyModule } from './routes/pluggy/pluggy.module';

@Module({
  imports: [ServiceModule, UsecaseModule, TransactionUsecaseModule, RecurringTransactionUsecaseModule, RecurringTransactionModule, PluggyModule],
  controllers: [
    // User routes
    CreateUserRoute,
    LoginUserRoute,
    RefreshAuthTokenRoute,
    FindByIdUserRoute,
    LogoutUserRoute,
    UpdateProfileRoute,
    ChangePasswordRoute,
    DeleteAccountRoute,
    LinkWhatsappRoute,
    AuthenticateWhatsappRoute,
    UnlinkWhatsappRoute,
    // Transaction routes
    CreateTransactionRoute,
    ListTransactionsRoute,
    DeleteTransactionRoute,
    UpdateTransactionRoute,
    GetSummaryRoute,
    GetExpensesByCategoryRoute,
    ExtractFromImageRoute,
    GenerateReportRoute,
    GenerateReportPdfRoute,
    // Metadata routes
    GetEnumsMetadataRoute,
  ],
  providers: [
    ReportPdfService,
    AuthGuardProvider,
    ValidatorDomainExceptionFilterProvider,
    DomainExceptionFilterProvider,
    UsecaseExceptionFilterProvider,
    // User exception filters
    CredentialsNotValidUsecaseExceptionFilterProvider,
    EmailAlreadyExistsUsecaseExceptionFilterProvider,
    UserNotFoundUsecaseExceptionFilterProvider,
    WhatsappAlreadyInUseUsecaseExceptionFilterProvider,
    WhatsappNotLinkedUsecaseExceptionFilterProvider,
    // Transaction exception filters
    TransactionNotFoundUsecaseExceptionFilterProvider,
    UnauthorizedTransactionAccessUsecaseExceptionFilterProvider,
    RecurringTransactionNotEditableUsecaseExceptionFilterProvider,
    // Service exception filters
    ServiceExceptionFilterProvider,
    RefreshTokenNotValidServiceExceptionFilterProvider,
  ],
})
export class WebModule {}
