import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { IPontoAlimentacaoRepository } from '@/services/interfaces/IPontoAlimentacaoRepository';
import type { PontoAlimentacao, CreatePontoAlimentacaoDTO } from '@/types/domain';
import { TipoPonto, StatusPonto } from '@/types/enums';

const COLLECTION = 'pontos_alimentacao';

function toPontoAlimentacao(id: string, data: Record<string, unknown>): PontoAlimentacao {
  return {
    id,
    nome: data.nome as string,
    tipo: data.tipo as TipoPonto,
    latitude: data.latitude as number,
    longitude: data.longitude as number,
    status: data.status as StatusPonto,
  };
}

export class PontoAlimentacaoRepository implements IPontoAlimentacaoRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<PontoAlimentacao | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toPontoAlimentacao(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[PontoAlimentacaoRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar PontoAlimentacao com id ${id}`);
    }
  }

  async findAll(): Promise<PontoAlimentacao[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toPontoAlimentacao(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[PontoAlimentacaoRepository.findAll]', error);
      throw new Error('Erro ao listar PontoAlimentacao');
    }
  }

  async create(data: CreatePontoAlimentacaoDTO): Promise<PontoAlimentacao> {
    try {
      const ref = await addDoc(this.col, {
        ...data,
      });
      const created = await getDoc(ref);
      return toPontoAlimentacao(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[PontoAlimentacaoRepository.create]', error);
      throw new Error('Erro ao criar PontoAlimentacao');
    }
  }

  async update(id: string, data: Partial<PontoAlimentacao>): Promise<PontoAlimentacao> {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data as Record<string, unknown>);
      const updated = await getDoc(ref);
      return toPontoAlimentacao(updated.id, (updated.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error(`[PontoAlimentacaoRepository.update] id=${id}`, error);
      throw new Error(`Erro ao atualizar PontoAlimentacao com id ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
      console.error(`[PontoAlimentacaoRepository.delete] id=${id}`, error);
      throw new Error(`Erro ao excluir PontoAlimentacao com id ${id}`);
    }
  }

  async findAtivos(): Promise<PontoAlimentacao[]> {
    try {
      const q = query(this.col, where('status', '==', StatusPonto.ATIVO));
      const snap = await getDocs(q);
      return snap.docs.map((d) => toPontoAlimentacao(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[PontoAlimentacaoRepository.findAtivos]', error);
      throw new Error('Erro ao buscar pontos ativos');
    }
  }
}
