import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { IFollowUpPosAdocaoRepository } from '@/services/interfaces/IFollowUpPosAdocaoRepository';
import type { FollowUpPosAdocao, CreateFollowUpPosAdocaoDTO } from '@/types/domain';

const COLLECTION = 'followups_adocao';

function toFollowUpPosAdocao(id: string, data: Record<string, unknown>): FollowUpPosAdocao {
  const { data: dateField, registradoEm, ...rest } = data;
  return {
    id,
    ...(rest as unknown as Omit<FollowUpPosAdocao, 'id' | 'data' | 'registradoEm'>),
    data: dateField ? (dateField as Timestamp).toDate() : new Date(),
    registradoEm: registradoEm ? (registradoEm as Timestamp).toDate() : new Date(),
  };
}

export class FollowUpPosAdocaoRepository implements IFollowUpPosAdocaoRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<FollowUpPosAdocao | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toFollowUpPosAdocao(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[FollowUpPosAdocaoRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar FollowUpPosAdocao com id ${id}`);
    }
  }

  async findAll(): Promise<FollowUpPosAdocao[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toFollowUpPosAdocao(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[FollowUpPosAdocaoRepository.findAll]', error);
      throw new Error('Erro ao listar FollowUpPosAdocao');
    }
  }

  async create(data: CreateFollowUpPosAdocaoDTO): Promise<FollowUpPosAdocao> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
        registradoEm: serverTimestamp(),
      });
      const created = await getDoc(ref);
      return toFollowUpPosAdocao(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[FollowUpPosAdocaoRepository.create]', error);
      throw new Error('Erro ao criar FollowUpPosAdocao');
    }
  }

  async update(id: string, data: Partial<FollowUpPosAdocao>): Promise<FollowUpPosAdocao> {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data as Record<string, unknown>);
      const updated = await getDoc(ref);
      return toFollowUpPosAdocao(updated.id, (updated.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error(`[FollowUpPosAdocaoRepository.update] id=${id}`, error);
      throw new Error(`Erro ao atualizar FollowUpPosAdocao com id ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
      console.error(`[FollowUpPosAdocaoRepository.delete] id=${id}`, error);
      throw new Error(`Erro ao excluir FollowUpPosAdocao com id ${id}`);
    }
  }
}
