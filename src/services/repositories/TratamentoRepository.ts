import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { ITratamentoRepository } from '@/services/interfaces/ITratamentoRepository';
import type { Tratamento, CreateTratamentoDTO } from '@/types/domain';

const COLLECTION = 'tratamentos';

function toTratamento(id: string, data: Record<string, unknown>): Tratamento {
  const { dataInicio, fimEstimado, ...rest } = data;
  return {
    id,
    ...(rest as unknown as Omit<Tratamento, 'id' | 'dataInicio' | 'fimEstimado'>),
    dataInicio: dataInicio ? (dataInicio as Timestamp).toDate() : new Date(),
    fimEstimado: fimEstimado ? (fimEstimado as Timestamp).toDate() : null,
  };
}

export class TratamentoRepository implements ITratamentoRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<Tratamento | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toTratamento(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[TratamentoRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar Tratamento com id ${id}`);
    }
  }

  async findAll(): Promise<Tratamento[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toTratamento(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[TratamentoRepository.findAll]', error);
      throw new Error('Erro ao listar Tratamento');
    }
  }

  async create(data: CreateTratamentoDTO): Promise<Tratamento> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
      });
      const created = await getDoc(ref);
      return toTratamento(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[TratamentoRepository.create]', error);
      throw new Error('Erro ao criar Tratamento');
    }
  }

  async update(id: string, data: Partial<Tratamento>): Promise<Tratamento> {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data as Record<string, unknown>);
      const updated = await getDoc(ref);
      return toTratamento(updated.id, (updated.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error(`[TratamentoRepository.update] id=${id}`, error);
      throw new Error(`Erro ao atualizar Tratamento com id ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
      console.error(`[TratamentoRepository.delete] id=${id}`, error);
      throw new Error(`Erro ao excluir Tratamento com id ${id}`);
    }
  }
}
