import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { IAlteracaoPendenteRepository } from '@/services/interfaces/IAlteracaoPendenteRepository';
import type { AlteracaoPendente, CreateAlteracaoPendenteDTO } from '@/types/domain';

const COLLECTION = 'alteracoes_pendentes';

function toAlteracaoPendente(id: string, data: Record<string, unknown>): AlteracaoPendente {
  return {
    id,
    ...(data as unknown as Omit<AlteracaoPendente, 'id' | 'submetidoEm' | 'revisadoEm'>),
    submetidoEm: data.submetidoEm ? (data.submetidoEm as Timestamp).toDate() : new Date(),
    revisadoEm: data.revisadoEm ? (data.revisadoEm as Timestamp).toDate() : null,
  };
}

export class AlteracaoPendenteRepository implements IAlteracaoPendenteRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<AlteracaoPendente | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toAlteracaoPendente(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[AlteracaoPendenteRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar AlteracaoPendente com id ${id}`);
    }
  }

  async findAll(): Promise<AlteracaoPendente[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toAlteracaoPendente(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[AlteracaoPendenteRepository.findAll]', error);
      throw new Error('Erro ao listar AlteracaoPendente');
    }
  }

  async create(data: CreateAlteracaoPendenteDTO): Promise<AlteracaoPendente> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
      });
      const created = await getDoc(ref);
      return toAlteracaoPendente(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[AlteracaoPendenteRepository.create]', error);
      throw new Error('Erro ao criar AlteracaoPendente');
    }
  }

  async update(id: string, data: Partial<AlteracaoPendente>): Promise<AlteracaoPendente> {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data as Record<string, unknown>);
      const updated = await getDoc(ref);
      return toAlteracaoPendente(updated.id, (updated.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error(`[AlteracaoPendenteRepository.update] id=${id}`, error);
      throw new Error(`Erro ao atualizar AlteracaoPendente com id ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
      console.error(`[AlteracaoPendenteRepository.delete] id=${id}`, error);
      throw new Error(`Erro ao excluir AlteracaoPendente com id ${id}`);
    }
  }
}
