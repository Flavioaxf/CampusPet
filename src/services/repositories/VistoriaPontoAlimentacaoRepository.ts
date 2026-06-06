import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { IVistoriaPontoAlimentacaoRepository } from '@/services/interfaces/IVistoriaPontoAlimentacaoRepository';
import type { VistoriaPontoAlimentacao, CreateVistoriaPontoAlimentacaoDTO } from '@/types/domain';

const COLLECTION = 'vistorias_pontos';

function toVistoriaPontoAlimentacao(id: string, data: Record<string, unknown>): VistoriaPontoAlimentacao {
  const { dataHora, ...rest } = data;
  return {
    id,
    ...(rest as unknown as Omit<VistoriaPontoAlimentacao, 'id' | 'dataHora'>),
    dataHora: dataHora ? (dataHora as Timestamp).toDate() : new Date(),
  };
}

export class VistoriaPontoAlimentacaoRepository implements IVistoriaPontoAlimentacaoRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<VistoriaPontoAlimentacao | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toVistoriaPontoAlimentacao(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[VistoriaPontoAlimentacaoRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar VistoriaPontoAlimentacao com id ${id}`);
    }
  }

  async findAll(): Promise<VistoriaPontoAlimentacao[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toVistoriaPontoAlimentacao(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[VistoriaPontoAlimentacaoRepository.findAll]', error);
      throw new Error('Erro ao listar VistoriaPontoAlimentacao');
    }
  }

  async create(data: CreateVistoriaPontoAlimentacaoDTO): Promise<VistoriaPontoAlimentacao> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
      });
      const created = await getDoc(ref);
      return toVistoriaPontoAlimentacao(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[VistoriaPontoAlimentacaoRepository.create]', error);
      throw new Error('Erro ao criar VistoriaPontoAlimentacao');
    }
  }

  async update(id: string, data: Partial<VistoriaPontoAlimentacao>): Promise<VistoriaPontoAlimentacao> {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data as Record<string, unknown>);
      const updated = await getDoc(ref);
      return toVistoriaPontoAlimentacao(updated.id, (updated.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error(`[VistoriaPontoAlimentacaoRepository.update] id=${id}`, error);
      throw new Error(`Erro ao atualizar VistoriaPontoAlimentacao com id ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
      console.error(`[VistoriaPontoAlimentacaoRepository.delete] id=${id}`, error);
      throw new Error(`Erro ao excluir VistoriaPontoAlimentacao com id ${id}`);
    }
  }
}
