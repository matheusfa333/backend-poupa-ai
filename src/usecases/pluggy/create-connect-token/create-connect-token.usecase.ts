import { PluggyApiService } from 'src/infra/services/pluggy/pluggy-api.service';

export class CreatePluggyConnectTokenUsecase {
  constructor(private readonly pluggyApi: PluggyApiService) {}

  async execute(userId: string, itemId?: string): Promise<{ accessToken: string }> {
    const accessToken = await this.pluggyApi.createConnectToken(userId, itemId);
    return { accessToken };
  }
}
