import type { ContaFinanceira, CreateContaFinanceiraDTO } from '@/types/domain';

export interface IContaFinanceiraRepository {
  findById(id: string): Promise<ContaFinanceira | null>;
  findAll(): Promise<ContaFinanceira[]>;
  create(data: CreateContaFinanceiraDTO): Promise<ContaFinanceira>;
  update(id: string, data: Partial<ContaFinanceira>): Promise<ContaFinanceira>;
  delete(id: string): Promise<void>;
  hasMovimentacoes(id: string): Promise<boolean>;
}
