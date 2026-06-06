import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { INotificacaoRepository } from '@/services/interfaces/INotificacaoRepository';
import type { Notificacao, CreateNotificacaoDTO } from '@/types/domain';

const COLLECTION = 'notificacoes';

function toNotificacao(id: string, data: Record<string, unknown>): Notificacao {
  const { enviadaEm, ...rest } = data;
  return {
    id,
    ...(rest as unknown as Omit<Notificacao, 'id' | 'enviadaEm'>),
    enviadaEm: enviadaEm ? (enviadaEm as Timestamp).toDate() : new Date(),
  };
}

export class NotificacaoRepository implements INotificacaoRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<Notificacao | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toNotificacao(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[NotificacaoRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar Notificacao com id ${id}`);
    }
  }

  async findAll(): Promise<Notificacao[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toNotificacao(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[NotificacaoRepository.findAll]', error);
      throw new Error('Erro ao listar Notificacao');
    }
  }

  async create(data: CreateNotificacaoDTO): Promise<Notificacao> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
      });
      const created = await getDoc(ref);
      return toNotificacao(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[NotificacaoRepository.create]', error);
      throw new Error('Erro ao criar Notificacao');
    }
  }

  async update(id: string, data: Partial<Notificacao>): Promise<Notificacao> {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data as Record<string, unknown>);
      const updated = await getDoc(ref);
      return toNotificacao(updated.id, (updated.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error(`[NotificacaoRepository.update] id=${id}`, error);
      throw new Error(`Erro ao atualizar Notificacao com id ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
      console.error(`[NotificacaoRepository.delete] id=${id}`, error);
      throw new Error(`Erro ao excluir Notificacao com id ${id}`);
    }
  }
}
