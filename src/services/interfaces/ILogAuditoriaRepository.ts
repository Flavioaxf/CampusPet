import type { LogAuditoria, CreateLogAuditoriaDTO } from '@/types/domain';

export interface ILogAuditoriaRepository {
  findById(id: string): Promise<LogAuditoria | null>;
  findAll(): Promise<LogAuditoria[]>;
  create(data: CreateLogAuditoriaDTO): Promise<LogAuditoria>;
}
