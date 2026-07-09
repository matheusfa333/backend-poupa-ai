import { Controller, Post, Get, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/infra/web/auth/auth.guard';
import { CreatePluggyConnectTokenUsecase } from 'src/usecases/pluggy/create-connect-token/create-connect-token.usecase';
import { SavePluggyItemUsecase } from 'src/usecases/pluggy/save-item/save-pluggy-item.usecase';
import { ListPluggyItemsUsecase } from 'src/usecases/pluggy/list-items/list-pluggy-items.usecase';
import { DeletePluggyItemUsecase } from 'src/usecases/pluggy/delete-item/delete-pluggy-item.usecase';
import { SyncPluggyItemUsecase } from 'src/usecases/pluggy/sync-item/sync-pluggy-item.usecase';

@Controller('pluggy')
@UseGuards(AuthGuard)
export class PluggyController {
  constructor(
    private readonly createTokenUsecase: CreatePluggyConnectTokenUsecase,
    private readonly saveItemUsecase: SavePluggyItemUsecase,
    private readonly listItemsUsecase: ListPluggyItemsUsecase,
    private readonly deleteItemUsecase: DeletePluggyItemUsecase,
    private readonly syncItemUsecase: SyncPluggyItemUsecase,
  ) {}

  @Post('connect-token')
  async createConnectToken(@Req() req: any, @Body() body: { itemId?: string }) {
    return this.createTokenUsecase.execute(req.userId, body?.itemId);
  }

  @Post('items')
  async saveItem(@Req() req: any, @Body() body: { itemId: string }) {
    return this.saveItemUsecase.execute(req.userId, body.itemId);
  }

  @Get('items')
  async listItems(@Req() req: any) {
    return this.listItemsUsecase.execute(req.userId);
  }

  @Delete('items/:id')
  async deleteItem(@Req() req: any, @Param('id') id: string) {
    await this.deleteItemUsecase.execute(id, req.userId);
    return { success: true };
  }

  @Post('items/:id/sync')
  async syncItem(@Req() req: any, @Param('id') id: string) {
    return this.syncItemUsecase.execute(id, req.userId);
  }
}
