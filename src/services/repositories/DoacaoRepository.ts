import { collection, doc, getDoc, getDocs, addDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { IDoacaoRepository } from '@/services/interfaces/IDoacaoRepository';
import type { Doacao, CreateDoacaoDTO } from '@/types/domain';

const COLLECTION = 'doacoes';

function toDoacao(id: string, data: Record<string, unknown>): Doacao {
  const { data: dateField, registradoEm, ...rest } = data;
  return {
    id,
    ...(rest as unknown as Omit<Doacao, 'id' | 'data' | 'registradoEm'>),
    data: dateField ? (dateField as Timestamp).toDate() : new Date(),
    registradoEm: registradoEm ? (registradoEm as Timestamp).toDate() : new Date(),
  };
}

export class DoacaoRepository implements IDoacaoRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<Doacao | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toDoacao(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[DoacaoRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar Doacao com id ${id}`);
    }
  }

  async findAll(): Promise<Doacao[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toDoacao(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[DoacaoRepository.findAll]', error);
      throw new Error('Erro ao listar Doacao');
    }
  }

  async create(data: CreateDoacaoDTO): Promise<Doacao> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
        registradoEm: serverTimestamp(),
      });
      const created = await getDoc(ref);
      return toDoacao(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[DoacaoRepository.create]', error);
      throw new Error('Erro ao criar Doacao');
    }
  }

  async update(id: string, data: Partial<Doacao>): Promise<Doacao> {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data as Record<string, unknown>);
      const updated = await getDoc(ref);
      return toDoacao(updated.id, (updated.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error(`[DoacaoRepository.update] id=${id}`, error);
      throw new Error(`Erro ao atualizar Doacao com id ${id}`);
    }
  }

}
