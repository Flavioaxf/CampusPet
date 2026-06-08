import type { CategoriaFinanceira, CreateCategoriaFinanceiraDTO } from '@/types/domain';

export interface ICategoriaFinanceiraRepository {
  findById(id: string): Promise<CategoriaFinanceira | null>;
  findAll(): Promise<CategoriaFinanceira[]>;
  create(data: CreateCategoriaFinanceiraDTO): Promise<CategoriaFinanceira>;
  update(id: string, data: Partial<CategoriaFinanceira>): Promise<CategoriaFinanceira>;
  delete(id: string): Promise<void>;
  hasMovimentacoes(id: string): Promise<boolean>;
}
