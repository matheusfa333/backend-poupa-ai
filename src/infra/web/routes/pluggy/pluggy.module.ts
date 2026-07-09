import { Module } from '@nestjs/common';
import { PluggyController } from './pluggy.controller';
import { PrismaModule } from 'src/infra/services/database/prisma/prisma.module';
import { PrismaPluggyItemRepository } from 'src/infra/repositories/prisma/pluggy/prisma-pluggy-item.repository';
import { PluggyApiService } from 'src/infra/services/pluggy/pluggy-api.service';
import { PluggyCategorizerService } from 'src/infra/services/pluggy/pluggy-categorizer.service';
import { CreatePluggyConnectTokenUsecase } from 'src/usecases/pluggy/create-connect-token/create-connect-token.usecase';
import { SavePluggyItemUsecase } from 'src/usecases/pluggy/save-item/save-pluggy-item.usecase';
import { ListPluggyItemsUsecase } from 'src/usecases/pluggy/list-items/list-pluggy-items.usecase';
import { DeletePluggyItemUsecase } from 'src/usecases/pluggy/delete-item/delete-pluggy-item.usecase';
import { SyncPluggyItemUsecase } from 'src/usecases/pluggy/sync-item/sync-pluggy-item.usecase';
import { TransactionGateway } from 'src/domain/repositories/transaction.gateway';
import { DatabaseModule } from 'src/infra/repositories/database.module';

@Module({
  imports: [PrismaModule, DatabaseModule],
  controllers: [PluggyController],
  providers: [
    PrismaPluggyItemRepository,
    PluggyApiService,
    PluggyCategorizerService,
    {
      provide: CreatePluggyConnectTokenUsecase,
      useFactory: (pluggyApi: PluggyApiService) =>
        new CreatePluggyConnectTokenUsecase(pluggyApi),
      inject: [PluggyApiService],
    },
    {
      provide: SavePluggyItemUsecase,
      useFactory: (repo: PrismaPluggyItemRepository, pluggyApi: PluggyApiService) =>
        new SavePluggyItemUsecase(repo, pluggyApi),
      inject: [PrismaPluggyItemRepository, PluggyApiService],
    },
    {
      provide: ListPluggyItemsUsecase,
      useFactory: (repo: PrismaPluggyItemRepository) =>
        new ListPluggyItemsUsecase(repo),
      inject: [PrismaPluggyItemRepository],
    },
    {
      provide: DeletePluggyItemUsecase,
      useFactory: (repo: PrismaPluggyItemRepository) =>
        new DeletePluggyItemUsecase(repo),
      inject: [PrismaPluggyItemRepository],
    },
    {
      provide: SyncPluggyItemUsecase,
      useFactory: (
        repo: PrismaPluggyItemRepository,
        txGateway: TransactionGateway,
        pluggyApi: PluggyApiService,
        categorizer: PluggyCategorizerService,
      ) => new SyncPluggyItemUsecase(repo, txGateway, pluggyApi, categorizer),
      inject: [PrismaPluggyItemRepository, TransactionGateway, PluggyApiService, PluggyCategorizerService],
    },
  ],
})
export class PluggyModule {}
