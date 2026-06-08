import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { IContaFinanceiraRepository } from '@/services/interfaces/IContaFinanceiraRepository';
import type { ContaFinanceira, CreateContaFinanceiraDTO } from '@/types/domain';

const COLLECTION = 'contas_financeiras';

function toContaFinanceira(id: string, data: Record<string, unknown>): ContaFinanceira {
  return {
    id,
    nome: data.nome as string,
    tipo: data.tipo as string,
    ativo: data.ativo as boolean,
  };
}

export class ContaFinanceiraRepository implements IContaFinanceiraRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<ContaFinanceira | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toContaFinanceira(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[ContaFinanceiraRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar ContaFinanceira com id ${id}`);
    }
  }

  async findAll(): Promise<ContaFinanceira[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toContaFinanceira(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[ContaFinanceiraRepository.findAll]', error);
      throw new Error('Erro ao listar ContaFinanceira');
    }
  }

  async create(data: CreateContaFinanceiraDTO): Promise<ContaFinanceira> {
    try {
      const ref = await addDoc(this.col, {
        ...data,
      });
      const created = await getDoc(ref);
      return toContaFinanceira(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[ContaFinanceiraRepository.create]', error);
      throw new Error('Erro ao criar ContaFinanceira');
    }
  }

  async update(id: string, data: Partial<ContaFinanceira>): Promise<ContaFinanceira> {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data as Record<string, unknown>);
      const updated = await getDoc(ref);
      return toContaFinanceira(updated.id, (updated.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error(`[ContaFinanceiraRepository.update] id=${id}`, error);
      throw new Error(`Erro ao atualizar ContaFinanceira com id ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
      console.error(`[ContaFinanceiraRepository.delete] id=${id}`, error);
      throw new Error(`Erro ao excluir ContaFinanceira com id ${id}`);
    }
  }

  async hasMovimentacoes(id: string): Promise<boolean> {
    try {
      const qDespesas = query(
        collection(db, 'despesas'),
        where('contaId', '==', id),
        limit(1),
      );
      const snapDespesas = await getDocs(qDespesas);
      if (!snapDespesas.empty) return true;

      const qDoacoes = query(
        collection(db, 'doacoes'),
        where('contaId', '==', id),
        limit(1),
      );
      const snapDoacoes = await getDocs(qDoacoes);
      return !snapDoacoes.empty;
    } catch (error) {
      console.error(`[ContaFinanceiraRepository.hasMovimentacoes] id=${id}`, error);
      throw new Error('Erro ao verificar movimentações da conta');
    }
  }
}
