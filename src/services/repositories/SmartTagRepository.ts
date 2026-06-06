import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { ISmartTagRepository } from '@/services/interfaces/ISmartTagRepository';
import type { SmartTag, CreateSmartTagDTO } from '@/types/domain';

const COLLECTION = 'smart_tags';

function toSmartTag(id: string, data: Record<string, unknown>): SmartTag {
  const { pareadoEm, ...rest } = data;
  return {
    id,
    ...(rest as unknown as Omit<SmartTag, 'id' | 'pareadoEm'>),
    pareadoEm: pareadoEm ? (pareadoEm as Timestamp).toDate() : null,
  };
}

export class SmartTagRepository implements ISmartTagRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<SmartTag | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toSmartTag(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[SmartTagRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar SmartTag com id ${id}`);
    }
  }

  async findAll(): Promise<SmartTag[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toSmartTag(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[SmartTagRepository.findAll]', error);
      throw new Error('Erro ao listar SmartTag');
    }
  }

  async create(data: CreateSmartTagDTO): Promise<SmartTag> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
      });
      const created = await getDoc(ref);
      return toSmartTag(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[SmartTagRepository.create]', error);
      throw new Error('Erro ao criar SmartTag');
    }
  }

  async update(id: string, data: Partial<SmartTag>): Promise<SmartTag> {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data as Record<string, unknown>);
      const updated = await getDoc(ref);
      return toSmartTag(updated.id, (updated.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error(`[SmartTagRepository.update] id=${id}`, error);
      throw new Error(`Erro ao atualizar SmartTag com id ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
      console.error(`[SmartTagRepository.delete] id=${id}`, error);
      throw new Error(`Erro ao excluir SmartTag com id ${id}`);
    }
  }
}
