import { collection, doc, getDoc, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { ILogAuditoriaRepository } from '@/services/interfaces/ILogAuditoriaRepository';
import type { LogAuditoria, CreateLogAuditoriaDTO } from '@/types/domain';

const COLLECTION = 'logs_auditoria';

function toLogAuditoria(id: string, data: Record<string, unknown>): LogAuditoria {
  return {
    id,
    ...(data as unknown as Omit<LogAuditoria, 'id' | 'realizadoEm'>),
    realizadoEm: data.realizadoEm ? (data.realizadoEm as Timestamp).toDate() : new Date(),
  };
}

export class LogAuditoriaRepository implements ILogAuditoriaRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<LogAuditoria | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toLogAuditoria(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[LogAuditoriaRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar LogAuditoria com id ${id}`);
    }
  }

  async findAll(): Promise<LogAuditoria[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toLogAuditoria(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[LogAuditoriaRepository.findAll]', error);
      throw new Error('Erro ao listar LogAuditoria');
    }
  }

  async create(data: CreateLogAuditoriaDTO): Promise<LogAuditoria> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
      });
      const created = await getDoc(ref);
      return toLogAuditoria(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[LogAuditoriaRepository.create]', error);
      throw new Error('Erro ao criar LogAuditoria');
    }
  }

}
