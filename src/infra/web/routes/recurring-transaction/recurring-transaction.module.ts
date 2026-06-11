import { Module } from '@nestjs/common';
import { RecurringTransactionController } from './recurring-transaction.controller';
import { CreateRecurringTransactionUsecase } from 'src/usecases/recurring-transaction/create/create-recurring-transaction.usecase';
import { ListRecurringTransactionsUsecase } from 'src/usecases/recurring-transaction/list/list-recurring-transactions.usecase';
import { ToggleRecurringTransactionUsecase } from 'src/usecases/recurring-transaction/toggle/toggle-recurring-transaction.usecase';
import { DeleteRecurringTransactionUsecase } from 'src/usecases/recurring-transaction/delete/delete-recurring-transaction.usecase';
import { PrismaRecurringTransactionRepository } from 'src/infra/repositories/prisma/recurring-transaction/prisma-recurring-transaction.repository';
import { PrismaModule } from 'src/infra/services/database/prisma/prisma.module';
import { ServiceModule } from 'src/infra/services/service.module';
import { RecurringTransactionUsecaseModule } from 'src/usecases/recurring-transaction/usecase.module';
import { DatabaseModule } from 'src/infra/repositories/database.module';

@Module({
  imports: [
    PrismaModule,
    ServiceModule,
    RecurringTransactionUsecaseModule,
    DatabaseModule,
  ],
  controllers: [RecurringTransactionController],
  providers: [
    PrismaRecurringTransactionRepository,
    {
      provide: CreateRecurringTransactionUsecase,
      useFactory: (repository: PrismaRecurringTransactionRepository) => {
        return new CreateRecurringTransactionUsecase(repository);
      },
      inject: [PrismaRecurringTransactionRepository],
    },
    {
      provide: ListRecurringTransactionsUsecase,
      useFactory: (repository: PrismaRecurringTransactionRepository) => {
        return new ListRecurringTransactionsUsecase(repository);
      },
      inject: [PrismaRecurringTransactionRepository],
    },
    {
      provide: ToggleRecurringTransactionUsecase,
      useFactory: (repository: PrismaRecurringTransactionRepository) => {
        return new ToggleRecurringTransactionUsecase(repository);
      },
      inject: [PrismaRecurringTransactionRepository],
    },
    {
      provide: DeleteRecurringTransactionUsecase,
      useFactory: (repository: PrismaRecurringTransactionRepository) => {
        return new DeleteRecurringTransactionUsecase(repository);
      },
      inject: [PrismaRecurringTransactionRepository],
    },
  ],
})
export class RecurringTransactionModule {}
