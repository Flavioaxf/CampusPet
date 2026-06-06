import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { IVacinaRepository } from '@/services/interfaces/IVacinaRepository';
import type { Vacina, CreateVacinaDTO } from '@/types/domain';

const COLLECTION = 'vacinas';

function toVacina(id: string, data: Record<string, unknown>): Vacina {
  const { dataAplicacao, proximaDose, ...rest } = data;
  return {
    id,
    ...(rest as unknown as Omit<Vacina, 'id' | 'dataAplicacao' | 'proximaDose'>),
    dataAplicacao: dataAplicacao ? (dataAplicacao as Timestamp).toDate() : new Date(),
    proximaDose: proximaDose ? (proximaDose as Timestamp).toDate() : null,
  };
}

export class VacinaRepository implements IVacinaRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<Vacina | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toVacina(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[VacinaRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar Vacina com id ${id}`);
    }
  }

  async findAll(): Promise<Vacina[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toVacina(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[VacinaRepository.findAll]', error);
      throw new Error('Erro ao listar Vacina');
    }
  }

  async create(data: CreateVacinaDTO): Promise<Vacina> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
      });
      const created = await getDoc(ref);
      return toVacina(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[VacinaRepository.create]', error);
      throw new Error('Erro ao criar Vacina');
    }
  }

  async update(id: string, data: Partial<Vacina>): Promise<Vacina> {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data as Record<string, unknown>);
      const updated = await getDoc(ref);
      return toVacina(updated.id, (updated.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error(`[VacinaRepository.update] id=${id}`, error);
      throw new Error(`Erro ao atualizar Vacina com id ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
      console.error(`[VacinaRepository.delete] id=${id}`, error);
      throw new Error(`Erro ao excluir Vacina com id ${id}`);
    }
  }
}
