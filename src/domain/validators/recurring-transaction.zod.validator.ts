import { z } from 'zod';

const transactionTypeSchema = z.enum(['INCOME', 'EXPENSE', 'INVESTMENT']);

const transactionCategorySchema = z.enum([
  // Categorias de DESPESA
  'ALIMENTACAO',
  'TRANSPORTE',
  'LAZER',
  'SAUDE',
  'EDUCACAO',
  'MORADIA',
  'VESTUARIO',
  // Categorias de RECEITA
  'SALARIO',
  'FREELANCE',
  'INVESTIMENTO',
  'PRESENTE',
  // Genérico
  'OUTROS',
]);

const paymentMethodSchema = z
  .enum(['PIX', 'BOLETO', 'CARTAO', 'TRANSFERENCIA', 'DINHEIRO'])
  .nullable()
  .optional();

const recurrenceFrequencySchema = z.enum([
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'YEARLY',
]);

export const RecurringTransactionZodValidator = z
  .object({
    userId: z.string().uuid('O ID do usuário deve ser um UUID válido'),

    type: transactionTypeSchema,

    category: transactionCategorySchema,

    paymentMethod: paymentMethodSchema,

    amount: z
      .number()
      .int('O valor deve ser um número inteiro (em centavos)')
      .positive('O valor deve ser maior que zero'),

    description: z
      .string()
      .max(500, 'A descrição deve ter no máximo 500 caracteres')
      .nullable()
      .optional(),

    frequency: recurrenceFrequencySchema,

    startDate: z.date(),

    endDate: z.date().nullable().optional(),

    dayOfMonth: z
      .number()
      .int()
      .min(1, 'O dia do mês deve estar entre 1 e 28')
      .max(28, 'O dia do mês deve estar entre 1 e 28')
      .nullable()
      .optional(),

    dayOfWeek: z
      .number()
      .int()
      .min(0, 'O dia da semana deve estar entre 0 (Domingo) e 6 (Sábado)')
      .max(6, 'O dia da semana deve estar entre 0 (Domingo) e 6 (Sábado)')
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      const expenseCategories = [
        'ALIMENTACAO',
        'TRANSPORTE',
        'LAZER',
        'SAUDE',
        'EDUCACAO',
        'MORADIA',
        'VESTUARIO',
      ];

      if (
        data.type === 'EXPENSE' &&
        !expenseCategories.includes(data.category) &&
        data.category !== 'OUTROS'
      ) {
        return false;
      }

      return true;
    },
    {
      message:
        'A categoria deve ser compatível com o tipo DESPESA (ALIMENTACAO, TRANSPORTE, LAZER, SAUDE, EDUCACAO, MORADIA, VESTUARIO, OUTROS)',
      path: ['category'],
    },
  )
  .refine(
    (data) => {
      const incomeCategories = ['SALARIO', 'FREELANCE', 'PRESENTE'];

      if (
        data.type === 'INCOME' &&
        !incomeCategories.includes(data.category) &&
        data.category !== 'OUTROS'
      ) {
        return false;
      }

      return true;
    },
    {
      message:
        'A categoria deve ser compatível com o tipo RECEITA (SALARIO, FREELANCE, PRESENTE, OUTROS)',
      path: ['category'],
    },
  )
  .refine(
    (data) => {
      if (data.type === 'INVESTMENT' && data.category !== 'INVESTIMENTO') {
        return false;
      }

      return true;
    },
    {
      message: 'A categoria deve ser INVESTIMENTO para o tipo INVESTIMENTO',
      path: ['category'],
    },
  )
  .refine(
    (data) => {
      // MONTHLY frequency must have dayOfMonth
      if (data.frequency === 'MONTHLY' && !data.dayOfMonth) {
        return false;
      }
      return true;
    },
    {
      message: 'O dia do mês é obrigatório para frequência MENSAL',
      path: ['dayOfMonth'],
    },
  )
  .refine(
    (data) => {
      // WEEKLY frequency must have dayOfWeek
      if (data.frequency === 'WEEKLY' && (data.dayOfWeek === null || data.dayOfWeek === undefined)) {
        return false;
      }
      return true;
    },
    {
      message: 'O dia da semana é obrigatório para frequência SEMANAL',
      path: ['dayOfWeek'],
    },
  )
  .refine(
    (data) => {
      // endDate must be after startDate if provided
      if (data.endDate && data.endDate <= data.startDate) {
        return false;
      }
      return true;
    },
    {
      message: 'A data final deve ser posterior à data inicial',
      path: ['endDate'],
    },
  );

export type RecurringTransactionZodValidatorInput = z.infer<
  typeof RecurringTransactionZodValidator
>;
