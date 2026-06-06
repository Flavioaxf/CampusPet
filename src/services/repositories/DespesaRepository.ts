import { collection, doc, getDoc, getDocs, addDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { IDespesaRepository } from '@/services/interfaces/IDespesaRepository';
import type { Despesa, CreateDespesaDTO } from '@/types/domain';

const COLLECTION = 'despesas';

function toDespesa(id: string, data: Record<string, unknown>): Despesa {
  const { data: dataField, registradoEm, ...rest } = data;
  return {
    id,
    ...(rest as unknown as Omit<Despesa, 'id' | 'data' | 'registradoEm'>),
    data: dataField ? (dataField as Timestamp).toDate() : new Date(),
    registradoEm: registradoEm ? (registradoEm as Timestamp).toDate() : new Date(),
  };
}

export class DespesaRepository implements IDespesaRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<Despesa | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toDespesa(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[DespesaRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar Despesa com id ${id}`);
    }
  }

  async findAll(): Promise<Despesa[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toDespesa(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[DespesaRepository.findAll]', error);
      throw new Error('Erro ao listar Despesa');
    }
  }

  async create(data: CreateDespesaDTO): Promise<Despesa> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
        registradoEm: serverTimestamp(),
      });
      const created = await getDoc(ref);
      return toDespesa(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[DespesaRepository.create]', error);
      throw new Error('Erro ao criar Despesa');
    }
  }

  async update(id: string, data: Partial<Despesa>): Promise<Despesa> {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data as Record<string, unknown>);
      const updated = await getDoc(ref);
      return toDespesa(updated.id, (updated.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error(`[DespesaRepository.update] id=${id}`, error);
      throw new Error(`Erro ao atualizar Despesa com id ${id}`);
    }
  }

}
