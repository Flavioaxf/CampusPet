import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { ICampanhaRepository } from '@/services/interfaces/ICampanhaRepository';
import type { Campanha, CreateCampanhaDTO } from '@/types/domain';

const COLLECTION = 'campanhas';

function toCampanha(id: string, data: Record<string, unknown>): Campanha {
  const { dataInicio, dataFim, ...rest } = data;
  return {
    id,
    ...(rest as unknown as Omit<Campanha, 'id' | 'dataInicio' | 'dataFim'>),
    dataInicio: dataInicio ? (dataInicio as Timestamp).toDate() : new Date(),
    dataFim: dataFim ? (dataFim as Timestamp).toDate() : null,
  };
}

export class CampanhaRepository implements ICampanhaRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<Campanha | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toCampanha(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[CampanhaRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar Campanha com id ${id}`);
    }
  }

  async findAll(): Promise<Campanha[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toCampanha(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[CampanhaRepository.findAll]', error);
      throw new Error('Erro ao listar Campanha');
    }
  }

  async create(data: CreateCampanhaDTO): Promise<Campanha> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
      });
      const created = await getDoc(ref);
      return toCampanha(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[CampanhaRepository.create]', error);
      throw new Error('Erro ao criar Campanha');
    }
  }

  async update(id: string, data: Partial<Campanha>): Promise<Campanha> {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data as Record<string, unknown>);
      const updated = await getDoc(ref);
      return toCampanha(updated.id, (updated.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error(`[CampanhaRepository.update] id=${id}`, error);
      throw new Error(`Erro ao atualizar Campanha com id ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
      console.error(`[CampanhaRepository.delete] id=${id}`, error);
      throw new Error(`Erro ao excluir Campanha com id ${id}`);
    }
  }
}
