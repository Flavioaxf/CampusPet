import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { ICategoriaFinanceiraRepository } from '@/services/interfaces/ICategoriaFinanceiraRepository';
import type { CategoriaFinanceira, CreateCategoriaFinanceiraDTO } from '@/types/domain';

const COLLECTION = 'categorias_financeiras';

function toCategoriaFinanceira(id: string, data: Record<string, unknown>): CategoriaFinanceira {
  return {
    id,
    ...(data as unknown as Omit<CategoriaFinanceira, 'id'>),
  };
}

export class CategoriaFinanceiraRepository implements ICategoriaFinanceiraRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<CategoriaFinanceira | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toCategoriaFinanceira(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[CategoriaFinanceiraRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar CategoriaFinanceira com id ${id}`);
    }
  }

  async findAll(): Promise<CategoriaFinanceira[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toCategoriaFinanceira(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[CategoriaFinanceiraRepository.findAll]', error);
      throw new Error('Erro ao listar CategoriaFinanceira');
    }
  }

  async create(data: CreateCategoriaFinanceiraDTO): Promise<CategoriaFinanceira> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
      });
      const created = await getDoc(ref);
      return toCategoriaFinanceira(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[CategoriaFinanceiraRepository.create]', error);
      throw new Error('Erro ao criar CategoriaFinanceira');
    }
  }

  async update(id: string, data: Partial<CategoriaFinanceira>): Promise<CategoriaFinanceira> {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data as Record<string, unknown>);
      const updated = await getDoc(ref);
      return toCategoriaFinanceira(updated.id, (updated.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error(`[CategoriaFinanceiraRepository.update] id=${id}`, error);
      throw new Error(`Erro ao atualizar CategoriaFinanceira com id ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
      console.error(`[CategoriaFinanceiraRepository.delete] id=${id}`, error);
      throw new Error(`Erro ao excluir CategoriaFinanceira com id ${id}`);
    }
  }
}
