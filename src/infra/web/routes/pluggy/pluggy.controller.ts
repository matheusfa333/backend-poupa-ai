import { Controller, Post, Get, Delete, Body, Param, Req, UseGuards, Logger } from '@nestjs/common';
import { AuthGuard } from 'src/infra/web/auth/auth.guard';
import { IsPublic } from 'src/infra/web/auth/decorators/is-public.decorator';
import { CreatePluggyConnectTokenUsecase } from 'src/usecases/pluggy/create-connect-token/create-connect-token.usecase';
import { SavePluggyItemUsecase } from 'src/usecases/pluggy/save-item/save-pluggy-item.usecase';
import { ListPluggyItemsUsecase } from 'src/usecases/pluggy/list-items/list-pluggy-items.usecase';
import { DeletePluggyItemUsecase } from 'src/usecases/pluggy/delete-item/delete-pluggy-item.usecase';
import { SyncPluggyItemUsecase } from 'src/usecases/pluggy/sync-item/sync-pluggy-item.usecase';
import { PrismaPluggyItemRepository } from 'src/infra/repositories/prisma/pluggy/prisma-pluggy-item.repository';

type PluggyWebhookEvent = {
  event: string;
  eventId: string;
  itemId: string;
  error?: { code: string; message: string };
};

@Controller('pluggy')
@UseGuards(AuthGuard)
export class PluggyController {
  private readonly logger = new Logger(PluggyController.name);

  constructor(
    private readonly createTokenUsecase: CreatePluggyConnectTokenUsecase,
    private readonly saveItemUsecase: SavePluggyItemUsecase,
    private readonly listItemsUsecase: ListPluggyItemsUsecase,
    private readonly deleteItemUsecase: DeletePluggyItemUsecase,
    private readonly syncItemUsecase: SyncPluggyItemUsecase,
    private readonly pluggyItemRepo: PrismaPluggyItemRepository,
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

  @Post('webhook')
  @IsPublic()
  async handleWebhook(@Body() body: PluggyWebhookEvent) {
    // Respond immediately — Pluggy requires 2XX within 5 seconds
    setImmediate(() => this.processWebhookEvent(body));
    return { received: true };
  }

  private async processWebhookEvent(event: PluggyWebhookEvent) {
    this.logger.log(`Webhook: ${event.event} itemId=${event.itemId}`);
    try {
      switch (event.event) {
        case 'item/created':
        case 'item/updated': {
          const item = await this.pluggyItemRepo.findByItemId(event.itemId);
          if (!item) return;
          await this.syncItemUsecase.execute(item.getId(), item.getUserId());
          break;
        }
        case 'item/error': {
          const item = await this.pluggyItemRepo.findByItemId(event.itemId);
          if (!item) return;
          item.updateStatus('LOGIN_ERROR');
          await this.pluggyItemRepo.update(item);
          break;
        }
        default:
          this.logger.log(`Unhandled webhook event: ${event.event}`);
      }
    } catch (err) {
      this.logger.error(`Webhook processing failed for ${event.event}`, err);
    }
  }
}
