import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { ILegislacaoAnimalRepository } from '@/services/interfaces/ILegislacaoAnimalRepository';
import type { LegislacaoAnimal, CreateLegislacaoAnimalDTO } from '@/types/domain';

const COLLECTION = 'legislacoes';

function toLegislacaoAnimal(id: string, data: Record<string, unknown>): LegislacaoAnimal {
  const { dataInclusao, ...rest } = data;
  return {
    id,
    ...(rest as unknown as Omit<LegislacaoAnimal, 'id' | 'dataInclusao'>),
    dataInclusao: dataInclusao ? (dataInclusao as Timestamp).toDate() : new Date(),
  };
}

export class LegislacaoAnimalRepository implements ILegislacaoAnimalRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<LegislacaoAnimal | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toLegislacaoAnimal(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[LegislacaoAnimalRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar LegislacaoAnimal com id ${id}`);
    }
  }

  async findAll(): Promise<LegislacaoAnimal[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toLegislacaoAnimal(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[LegislacaoAnimalRepository.findAll]', error);
      throw new Error('Erro ao listar LegislacaoAnimal');
    }
  }

  async create(data: CreateLegislacaoAnimalDTO): Promise<LegislacaoAnimal> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
      });
      const created = await getDoc(ref);
      return toLegislacaoAnimal(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[LegislacaoAnimalRepository.create]', error);
      throw new Error('Erro ao criar LegislacaoAnimal');
    }
  }

  async update(id: string, data: Partial<LegislacaoAnimal>): Promise<LegislacaoAnimal> {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data as Record<string, unknown>);
      const updated = await getDoc(ref);
      return toLegislacaoAnimal(updated.id, (updated.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error(`[LegislacaoAnimalRepository.update] id=${id}`, error);
      throw new Error(`Erro ao atualizar LegislacaoAnimal com id ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
      console.error(`[LegislacaoAnimalRepository.delete] id=${id}`, error);
      throw new Error(`Erro ao excluir LegislacaoAnimal com id ${id}`);
    }
  }
}
