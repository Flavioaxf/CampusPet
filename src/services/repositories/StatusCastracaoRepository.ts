import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { IStatusCastracaoRepository } from '@/services/interfaces/IStatusCastracaoRepository';
import type { StatusCastracao, CreateStatusCastracaoDTO } from '@/types/domain';

const COLLECTION = 'status_castracao';

function toStatusCastracao(id: string, data: Record<string, unknown>): StatusCastracao {
  const { dataAlteracao, ...rest } = data;
  return {
    id,
    ...(rest as unknown as Omit<StatusCastracao, 'id' | 'dataAlteracao'>),
    dataAlteracao: dataAlteracao ? (dataAlteracao as Timestamp).toDate() : new Date(),
  };
}

export class StatusCastracaoRepository implements IStatusCastracaoRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<StatusCastracao | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toStatusCastracao(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[StatusCastracaoRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar StatusCastracao com id ${id}`);
    }
  }

  async findAll(): Promise<StatusCastracao[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toStatusCastracao(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[StatusCastracaoRepository.findAll]', error);
      throw new Error('Erro ao listar StatusCastracao');
    }
  }

  async create(data: CreateStatusCastracaoDTO): Promise<StatusCastracao> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
      });
      const created = await getDoc(ref);
      return toStatusCastracao(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[StatusCastracaoRepository.create]', error);
      throw new Error('Erro ao criar StatusCastracao');
    }
  }

  async update(id: string, data: Partial<StatusCastracao>): Promise<StatusCastracao> {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data as Record<string, unknown>);
      const updated = await getDoc(ref);
      return toStatusCastracao(updated.id, (updated.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error(`[StatusCastracaoRepository.update] id=${id}`, error);
      throw new Error(`Erro ao atualizar StatusCastracao com id ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
      console.error(`[StatusCastracaoRepository.delete] id=${id}`, error);
      throw new Error(`Erro ao excluir StatusCastracao com id ${id}`);
    }
  }
}
