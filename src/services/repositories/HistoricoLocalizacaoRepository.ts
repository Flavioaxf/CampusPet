import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { IHistoricoLocalizacaoRepository } from '@/services/interfaces/IHistoricoLocalizacaoRepository';
import type { HistoricoLocalizacao, CreateHistoricoLocalizacaoDTO } from '@/types/domain';

const COLLECTION = 'historico_localizacao';

function toHistoricoLocalizacao(id: string, data: Record<string, unknown>): HistoricoLocalizacao {
  const { timestamp, ...rest } = data;
  return {
    id,
    ...(rest as unknown as Omit<HistoricoLocalizacao, 'id' | 'timestamp'>),
    timestamp: timestamp ? (timestamp as Timestamp).toDate() : new Date(),
  };
}

export class HistoricoLocalizacaoRepository implements IHistoricoLocalizacaoRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<HistoricoLocalizacao | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toHistoricoLocalizacao(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[HistoricoLocalizacaoRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar HistoricoLocalizacao com id ${id}`);
    }
  }

  async findAll(): Promise<HistoricoLocalizacao[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toHistoricoLocalizacao(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[HistoricoLocalizacaoRepository.findAll]', error);
      throw new Error('Erro ao listar HistoricoLocalizacao');
    }
  }

  async create(data: CreateHistoricoLocalizacaoDTO): Promise<HistoricoLocalizacao> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
      });
      const created = await getDoc(ref);
      return toHistoricoLocalizacao(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[HistoricoLocalizacaoRepository.create]', error);
      throw new Error('Erro ao criar HistoricoLocalizacao');
    }
  }

  async update(id: string, data: Partial<HistoricoLocalizacao>): Promise<HistoricoLocalizacao> {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data as Record<string, unknown>);
      const updated = await getDoc(ref);
      return toHistoricoLocalizacao(updated.id, (updated.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error(`[HistoricoLocalizacaoRepository.update] id=${id}`, error);
      throw new Error(`Erro ao atualizar HistoricoLocalizacao com id ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
      console.error(`[HistoricoLocalizacaoRepository.delete] id=${id}`, error);
      throw new Error(`Erro ao excluir HistoricoLocalizacao com id ${id}`);
    }
  }
}
