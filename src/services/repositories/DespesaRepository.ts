import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { IDespesaRepository } from '@/services/interfaces/IDespesaRepository';
import type { Despesa, CreateDespesaDTO } from '@/types/domain';

const COLLECTION = 'despesas';

function toDespesa(id: string, data: Record<string, unknown>): Despesa {
  return {
    id,
    prontuarioId: data.prontuarioId as string,
    contaId: data.contaId as string,
    categoriaId: data.categoriaId as string,
    valor: data.valor as number,
    data: (data.data as Timestamp).toDate(),
    descricao: data.descricao as string,
    registradoPorId: data.registradoPorId as string,
    registradoEm: (data.registradoEm as Timestamp).toDate(),
  };
}

export class DespesaRepository implements IDespesaRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<Despesa | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toDespesa(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[DespesaRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar Despesa com id ${id}`);
    }
  }

  async findAll(): Promise<Despesa[]> {
    try {
      const q = query(this.col, orderBy('registradoEm', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => toDespesa(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[DespesaRepository.findAll]', error);
      throw new Error('Erro ao listar Despesa');
    }
  }

  async create(data: CreateDespesaDTO): Promise<Despesa> {
    try {
      const ref = await addDoc(this.col, {
        ...data,
        registradoEm: serverTimestamp(),
      });
      const created = await getDoc(ref);
      return toDespesa(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[DespesaRepository.create]', error);
      throw new Error('Erro ao criar Despesa');
    }
  }

  async update(id: string, data: Partial<Despesa>): Promise<Despesa> {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data as Record<string, unknown>);
      const updated = await getDoc(ref);
      return toDespesa(updated.id, (updated.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error(`[DespesaRepository.update] id=${id}`, error);
      throw new Error(`Erro ao atualizar Despesa com id ${id}`);
    }
  }

  async findByPeriodo(inicio: Date, fim: Date): Promise<Despesa[]> {
    try {
      const q = query(
        this.col,
        where('data', '>=', Timestamp.fromDate(inicio)),
        where('data', '<=', Timestamp.fromDate(fim)),
        orderBy('data', 'asc')
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => toDespesa(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error(`[DespesaRepository.findByPeriodo]`, error);
      throw new Error('Erro ao buscar despesas por período');
    }
  }

  async findByAnimal(animalId: string): Promise<Despesa[]> {
    try {
      const q = query(this.col, where('prontuarioId', '==', animalId), orderBy('data', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => toDespesa(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error(`[DespesaRepository.findByAnimal] animalId=${animalId}`, error);
      throw new Error('Erro ao buscar despesas por animal');
    }
  }
}
