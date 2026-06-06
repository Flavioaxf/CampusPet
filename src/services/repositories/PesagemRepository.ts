import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { IPesagemRepository } from '@/services/interfaces/IPesagemRepository';
import type { Pesagem, CreatePesagemDTO } from '@/types/domain';

const COLLECTION = 'pesagens';

function toPesagem(id: string, data: Record<string, unknown>): Pesagem {
  const { data: dataField, ...rest } = data;
  return {
    id,
    ...(rest as unknown as Omit<Pesagem, 'id' | 'data'>),
    data: dataField ? (dataField as Timestamp).toDate() : new Date(),
  };
}

export class PesagemRepository implements IPesagemRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<Pesagem | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toPesagem(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[PesagemRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar Pesagem com id ${id}`);
    }
  }

  async findAll(): Promise<Pesagem[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toPesagem(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[PesagemRepository.findAll]', error);
      throw new Error('Erro ao listar Pesagem');
    }
  }

  async create(data: CreatePesagemDTO): Promise<Pesagem> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
      });
      const created = await getDoc(ref);
      return toPesagem(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[PesagemRepository.create]', error);
      throw new Error('Erro ao criar Pesagem');
    }
  }

  async update(id: string, data: Partial<Pesagem>): Promise<Pesagem> {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data as Record<string, unknown>);
      const updated = await getDoc(ref);
      return toPesagem(updated.id, (updated.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error(`[PesagemRepository.update] id=${id}`, error);
      throw new Error(`Erro ao atualizar Pesagem com id ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
      console.error(`[PesagemRepository.delete] id=${id}`, error);
      throw new Error(`Erro ao excluir Pesagem com id ${id}`);
    }
  }
}
