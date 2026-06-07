import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { IDoacaoRepository } from '@/services/interfaces/IDoacaoRepository';
import type { Doacao, CreateDoacaoDTO } from '@/types/domain';
import { StatusDoacao, TipoDoacao, MetodoDoacao, OrigemDoacao } from '@/types/enums';

const COLLECTION = 'doacoes';

function toDoacao(id: string, data: Record<string, unknown>): Doacao {
  return {
    id,
    transactionId: data.transactionId as string | null,
    tipo: data.tipo as TipoDoacao,
    valor: data.valor as number,
    data: (data.data as Timestamp).toDate(),
    nomeDoador: data.nomeDoador as string | null,
    metodo: data.metodo as MetodoDoacao,
    status: data.status as StatusDoacao,
    origem: data.origem as OrigemDoacao,
    contaId: data.contaId as string,
    categoriaId: data.categoriaId as string,
    registradoPorId: data.registradoPorId as string | null,
    registradoEm: (data.registradoEm as Timestamp).toDate(),
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
      const q = query(this.col, orderBy('registradoEm', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => toDoacao(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[DoacaoRepository.findAll]', error);
      throw new Error('Erro ao listar Doacao');
    }
  }

  async create(data: CreateDoacaoDTO): Promise<Doacao> {
    try {
      const ref = await addDoc(this.col, {
        ...data,
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

  async findByStatus(status: StatusDoacao): Promise<Doacao[]> {
    try {
      const q = query(this.col, where('status', '==', status), orderBy('registradoEm', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => toDoacao(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error(`[DoacaoRepository.findByStatus] status=${status}`, error);
      throw new Error('Erro ao buscar doaÃ§Ãµes por status');
    }
  }

  async findByPeriodo(inicio: Date, fim: Date): Promise<Doacao[]> {
    try {
      const q = query(
        this.col,
        where('data', '>=', Timestamp.fromDate(inicio)),
        where('data', '<=', Timestamp.fromDate(fim)),
        orderBy('data', 'asc')
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => toDoacao(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error(`[DoacaoRepository.findByPeriodo]`, error);
      throw new Error('Erro ao buscar doaÃ§Ãµes por perÃ­odo');
    }
  }
}
