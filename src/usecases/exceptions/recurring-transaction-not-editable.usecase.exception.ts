import { UsecaseException } from './usecase.exception';

export class RecurringTransactionNotEditableUsecaseException extends UsecaseException {
  public constructor(transactionId: string) {
    super(
      `Transaction ${transactionId} was generated from an active recurring transaction and cannot be removed directly`,
      'Esta transacao foi gerada por uma transacao fixa ativa. Inative ou exclua a fixa antes de remover este lancamento.',
      'RecurringTransactionNotEditableUsecaseException',
    );
    this.name = RecurringTransactionNotEditableUsecaseException.name;
  }
}
