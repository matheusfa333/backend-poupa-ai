import { Injectable } from '@nestjs/common';
import { TransactionCategory, TransactionType } from 'src/domain/entities/transaction/transaction.entity';

type Categorization = { type: TransactionType; category: TransactionCategory };

const PLUGGY_CATEGORY_MAP: Record<string, TransactionCategory> = {
  // Alimentação
  'Food and Groceries': 'ALIMENTACAO',
  'Restaurants and Bars': 'ALIMENTACAO',
  'Supermarket': 'ALIMENTACAO',
  'Food': 'ALIMENTACAO',
  // Transporte
  'Transport': 'TRANSPORTE',
  'Automotive': 'TRANSPORTE',
  'Taxi and Rideshare': 'TRANSPORTE',
  'Gas Station': 'TRANSPORTE',
  'Public Transportation': 'TRANSPORTE',
  // Lazer
  'Entertainment': 'LAZER',
  'Leisure': 'LAZER',
  'Streaming': 'ASSINATURA',
  'Sports': 'LAZER',
  'Travel': 'LAZER',
  // Saúde
  'Health': 'SAUDE',
  'Pharmacy': 'SAUDE',
  'Medical': 'SAUDE',
  'Hospital': 'SAUDE',
  // Educação
  'Education': 'EDUCACAO',
  'Books': 'EDUCACAO',
  // Moradia
  'Housing': 'MORADIA',
  'Utilities': 'MORADIA',
  'Rent': 'MORADIA',
  // Vestuário
  'Clothing': 'VESTUARIO',
  'Shopping': 'VESTUARIO',
  // Assinaturas
  'Subscriptions': 'ASSINATURA',
  'Telecommunications': 'ASSINATURA',
  // Receitas
  'Income': 'SALARIO',
  'Salary': 'SALARIO',
  'Transfer': 'OUTROS',
  // Investimentos
  'Investments': 'INVESTIMENTO',
};

const DESCRIPTION_KEYWORDS: Array<{ pattern: RegExp; category: TransactionCategory; type?: TransactionType }> = [
  { pattern: /salário|salario|pagamento\s+de\s+sal/i, category: 'SALARIO', type: 'INCOME' },
  { pattern: /freelance|freela/i, category: 'FREELANCE', type: 'INCOME' },
  { pattern: /investimento|cdb|lca|lci|tesouro|fundo/i, category: 'INVESTIMENTO', type: 'INVESTMENT' },
  { pattern: /uber|99|taxi|onibus|metro|combustivel|gasolina|estacionamento/i, category: 'TRANSPORTE' },
  { pattern: /mercado|supermercado|extra|carrefour|atacado|ifood|delivery|rappi|restaurante|lanche|pizza|hamburger/i, category: 'ALIMENTACAO' },
  { pattern: /netflix|spotify|amazon\s+prime|youtube\s+premium|disney|hbo|globoplay|deezer/i, category: 'ASSINATURA' },
  { pattern: /farmácia|farmacia|remedios|remédios|consulta|médico|medico|plano\s+de\s+saúde/i, category: 'SAUDE' },
  { pattern: /escola|faculdade|curso|udemy|alura|educação/i, category: 'EDUCACAO' },
  { pattern: /aluguel|condomínio|condominio|energia|água|agua|internet|luz/i, category: 'MORADIA' },
  { pattern: /roupa|calçado|calcado|vestuário|vestuario|moda/i, category: 'VESTUARIO' },
  { pattern: /cartão|cartao\s+de\s+crédito|credito/i, category: 'CARTAO_CREDITO' },
  { pattern: /presente|gift/i, category: 'PRESENTE' },
];

@Injectable()
export class PluggyCategorizerService {
  categorize(pluggyCategory: string | null, description: string, pluggyType: 'DEBIT' | 'CREDIT'): Categorization {
    // Check description keywords first (more specific)
    for (const { pattern, category, type } of DESCRIPTION_KEYWORDS) {
      if (pattern.test(description)) {
        const resolvedType: TransactionType = type ?? (pluggyType === 'CREDIT' ? 'INCOME' : 'EXPENSE');
        return { type: resolvedType, category };
      }
    }

    // Fall back to Pluggy category mapping
    if (pluggyCategory && PLUGGY_CATEGORY_MAP[pluggyCategory]) {
      const category = PLUGGY_CATEGORY_MAP[pluggyCategory];
      const type: TransactionType =
        pluggyType === 'CREDIT' ? 'INCOME' :
        category === 'INVESTIMENTO' ? 'INVESTMENT' : 'EXPENSE';
      return { type, category };
    }

    // Default based on transaction type
    const type: TransactionType = pluggyType === 'CREDIT' ? 'INCOME' : 'EXPENSE';
    const category: TransactionCategory = pluggyType === 'CREDIT' ? 'OUTROS' : 'OUTROS';
    return { type, category };
  }
}
