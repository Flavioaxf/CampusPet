import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { IOcorrenciaRepository } from '@/services/interfaces/IOcorrenciaRepository';
import type { Ocorrencia, CreateOcorrenciaDTO } from '@/types/domain';

const COLLECTION = 'ocorrencias';

function toOcorrencia(id: string, data: Record<string, unknown>): Ocorrencia {
  const { registradaEm, resolvidaEm, ...rest } = data;
  return {
    id,
    ...(rest as unknown as Omit<Ocorrencia, 'id' | 'registradaEm' | 'resolvidaEm'>),
    registradaEm: registradaEm ? (registradaEm as Timestamp).toDate() : new Date(),
    resolvidaEm: resolvidaEm ? (resolvidaEm as Timestamp).toDate() : null,
  };
}

export class OcorrenciaRepository implements IOcorrenciaRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<Ocorrencia | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toOcorrencia(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[OcorrenciaRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar Ocorrencia com id ${id}`);
    }
  }

  async findAll(): Promise<Ocorrencia[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toOcorrencia(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[OcorrenciaRepository.findAll]', error);
      throw new Error('Erro ao listar Ocorrencia');
    }
  }

  async create(data: CreateOcorrenciaDTO): Promise<Ocorrencia> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
      });
      const created = await getDoc(ref);
      return toOcorrencia(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[OcorrenciaRepository.create]', error);
      throw new Error('Erro ao criar Ocorrencia');
    }
  }

  async update(id: string, data: Partial<Ocorrencia>): Promise<Ocorrencia> {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data as Record<string, unknown>);
      const updated = await getDoc(ref);
      return toOcorrencia(updated.id, (updated.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error(`[OcorrenciaRepository.update] id=${id}`, error);
      throw new Error(`Erro ao atualizar Ocorrencia com id ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
      console.error(`[OcorrenciaRepository.delete] id=${id}`, error);
      throw new Error(`Erro ao excluir Ocorrencia com id ${id}`);
    }
  }
}
