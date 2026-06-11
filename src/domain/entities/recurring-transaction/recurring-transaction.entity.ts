import { Entity } from 'src/domain/shared/entities/entity';
import { Utils } from 'src/shared/utils/utils';
import { RecurringTransactionValidatorFactory } from 'src/domain/factories/recurring-transaction.validator.factory';
import { ValidatorDomainException } from 'src/domain/shared/exception/validator-domain.exception';

export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export type TransactionType = 'INCOME' | 'EXPENSE' | 'INVESTMENT';

export type TransactionCategory =
  | 'ALIMENTACAO'
  | 'TRANSPORTE'
  | 'LAZER'
  | 'SAUDE'
  | 'EDUCACAO'
  | 'MORADIA'
  | 'VESTUARIO'
  | 'SALARIO'
  | 'FREELANCE'
  | 'INVESTIMENTO'
  | 'PRESENTE'
  | 'OUTROS';

export type PaymentMethod =
  | 'PIX'
  | 'BOLETO'
  | 'CARTAO'
  | 'TRANSFERENCIA'
  | 'DINHEIRO';

export type RecurringTransactionCreateDto = {
  userId: string;
  type: TransactionType;
  category: TransactionCategory;
  paymentMethod?: PaymentMethod;
  amount: number; // Em centavos
  description?: string;
  frequency: RecurrenceFrequency;
  startDate: Date;
  endDate?: Date;
  dayOfMonth?: number; // 1-28 para MONTHLY
  dayOfWeek?: number; // 0-6 para WEEKLY (0 = domingo)
};

export type RecurringTransactionWithDto = {
  id: string;
  userId: string;
  type: TransactionType;
  category: TransactionCategory;
  paymentMethod: PaymentMethod | null;
  amount: number; // Em centavos
  description: string | null;
  frequency: RecurrenceFrequency;
  startDate: Date;
  endDate: Date | null;
  dayOfMonth: number | null;
  dayOfWeek: number | null;
  active: boolean;
  lastProcessed: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class RecurringTransaction extends Entity {
  private constructor(
    id: string,
    private userId: string,
    private type: TransactionType,
    private category: TransactionCategory,
    private paymentMethod: PaymentMethod | null,
    private amount: number,
    private description: string | null,
    private frequency: RecurrenceFrequency,
    private startDate: Date,
    private endDate: Date | null,
    private dayOfMonth: number | null,
    private dayOfWeek: number | null,
    private active: boolean,
    private lastProcessed: Date | null,
    private deletedAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    userId,
    type,
    category,
    paymentMethod = undefined,
    amount,
    description = undefined,
    frequency,
    startDate,
    endDate = undefined,
    dayOfMonth = undefined,
    dayOfWeek = undefined,
  }: RecurringTransactionCreateDto): RecurringTransaction {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new RecurringTransaction(
      id,
      userId,
      type,
      category,
      paymentMethod ?? null,
      amount,
      description ?? null,
      frequency,
      startDate,
      endDate ?? null,
      dayOfMonth ?? null,
      dayOfWeek ?? null,
      true, // active
      null, // lastProcessed
      null, // deletedAt
      createdAt,
      updatedAt,
    );
  }

  public static with({
    id,
    userId,
    type,
    category,
    paymentMethod,
    amount,
    description,
    frequency,
    startDate,
    endDate,
    dayOfMonth,
    dayOfWeek,
    active,
    lastProcessed,
    deletedAt,
    createdAt,
    updatedAt,
  }: RecurringTransactionWithDto): RecurringTransaction {
    return new RecurringTransaction(
      id,
      userId,
      type,
      category,
      paymentMethod,
      amount,
      description,
      frequency,
      startDate,
      endDate,
      dayOfMonth,
      dayOfWeek,
      active,
      lastProcessed,
      deletedAt,
      createdAt,
      updatedAt,
    );
  }

  protected validate(): void {
    const validator = RecurringTransactionValidatorFactory.create();

    const result = validator.safeParse({
      userId: this.userId,
      type: this.type,
      category: this.category,
      paymentMethod: this.paymentMethod,
      amount: this.amount,
      description: this.description,
      frequency: this.frequency,
      startDate: this.startDate,
      endDate: this.endDate,
      dayOfMonth: this.dayOfMonth,
      dayOfWeek: this.dayOfWeek,
    });

    if (!result.success) {
      const firstError = result.error.issues[0];
      throw new ValidatorDomainException(
        `RecurringTransaction validation failed: ${firstError.path.join('.')} - ${firstError.message}`,
        firstError.message,
      );
    }
  }

  // Getters
  public getUserId(): string {
    return this.userId;
  }

  public getType(): TransactionType {
    return this.type;
  }

  public getCategory(): TransactionCategory {
    return this.category;
  }

  public getPaymentMethod(): PaymentMethod | null {
    return this.paymentMethod;
  }

  public getAmount(): number {
    return this.amount;
  }

  public getDescription(): string | null {
    return this.description;
  }

  public getFrequency(): RecurrenceFrequency {
    return this.frequency;
  }

  public getStartDate(): Date {
    return this.startDate;
  }

  public getEndDate(): Date | null {
    return this.endDate;
  }

  public getDayOfMonth(): number | null {
    return this.dayOfMonth;
  }

  public getDayOfWeek(): number | null {
    return this.dayOfWeek;
  }

  public isActive(): boolean {
    return this.active;
  }

  public getLastProcessed(): Date | null {
    return this.lastProcessed;
  }

  public getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  // Métodos de modificação
  public deactivate(): void {
    this.active = false;
  }

  public activate(): void {
    this.active = true;
  }

  public markAsProcessed(date: Date): void {
    this.lastProcessed = date;
  }

  public softDelete(): void {
    this.deletedAt = new Date();
  }
}
