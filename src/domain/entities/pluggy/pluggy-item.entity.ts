import { Utils } from 'src/shared/utils/utils';

export type PluggyItemCreateDto = {
  userId: string;
  itemId: string;
  connectorId?: number | null;
  bankName?: string | null;
};

export type PluggyItemWithDto = {
  id: string;
  userId: string;
  itemId: string;
  connectorId: number | null;
  bankName: string | null;
  status: string;
  lastSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class PluggyItem {
  private constructor(
    private readonly id: string,
    private readonly userId: string,
    private readonly itemId: string,
    private connectorId: number | null,
    private bankName: string | null,
    private status: string,
    private lastSyncAt: Date | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create({ userId, itemId, connectorId, bankName }: PluggyItemCreateDto): PluggyItem {
    return new PluggyItem(
      Utils.generateUUID(),
      userId,
      itemId,
      connectorId ?? null,
      bankName ?? null,
      'UPDATED',
      null,
      new Date(),
      new Date(),
    );
  }

  static with({ id, userId, itemId, connectorId, bankName, status, lastSyncAt, createdAt, updatedAt }: PluggyItemWithDto): PluggyItem {
    return new PluggyItem(id, userId, itemId, connectorId, bankName, status, lastSyncAt, createdAt, updatedAt);
  }

  getId() { return this.id; }
  getUserId() { return this.userId; }
  getItemId() { return this.itemId; }
  getConnectorId() { return this.connectorId; }
  getBankName() { return this.bankName; }
  getStatus() { return this.status; }
  getLastSyncAt() { return this.lastSyncAt; }
  getCreatedAt() { return this.createdAt; }
  getUpdatedAt() { return this.updatedAt; }

  markSynced() {
    this.lastSyncAt = new Date();
    this.updatedAt = new Date();
  }

  updateStatus(status: string) {
    this.status = status;
    this.updatedAt = new Date();
  }
}
