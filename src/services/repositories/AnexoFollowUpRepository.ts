import { collection, doc, getDoc, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { IAnexoFollowUpRepository } from '@/services/interfaces/IAnexoFollowUpRepository';
import type { AnexoFollowUp, CreateAnexoFollowUpDTO } from '@/types/domain';

const COLLECTION = 'anexos_followup';

function toAnexoFollowUp(id: string, data: Record<string, unknown>): AnexoFollowUp {
  return {
    id,
    ...(data as unknown as Omit<AnexoFollowUp, 'id'>),
  };
}

export class AnexoFollowUpRepository implements IAnexoFollowUpRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<AnexoFollowUp | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toAnexoFollowUp(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[AnexoFollowUpRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar AnexoFollowUp com id ${id}`);
    }
  }

  async findAll(): Promise<AnexoFollowUp[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toAnexoFollowUp(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[AnexoFollowUpRepository.findAll]', error);
      throw new Error('Erro ao listar AnexoFollowUp');
    }
  }

  async create(data: CreateAnexoFollowUpDTO): Promise<AnexoFollowUp> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
      });
      const created = await getDoc(ref);
      return toAnexoFollowUp(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[AnexoFollowUpRepository.create]', error);
      throw new Error('Erro ao criar AnexoFollowUp');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
      console.error(`[AnexoFollowUpRepository.delete] id=${id}`, error);
      throw new Error(`Erro ao excluir AnexoFollowUp com id ${id}`);
    }
  }
}
