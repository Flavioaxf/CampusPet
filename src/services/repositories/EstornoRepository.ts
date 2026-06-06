import { collection, doc, getDoc, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { IEstornoRepository } from '@/services/interfaces/IEstornoRepository';
import type { Estorno, CreateEstornoDTO } from '@/types/domain';

const COLLECTION = 'estornos';

function toEstorno(id: string, data: Record<string, unknown>): Estorno {
  const { realizadoEm, ...rest } = data;
  return {
    id,
    ...(rest as unknown as Omit<Estorno, 'id' | 'realizadoEm'>),
    realizadoEm: realizadoEm ? (realizadoEm as Timestamp).toDate() : new Date(),
  };
}

export class EstornoRepository implements IEstornoRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<Estorno | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toEstorno(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[EstornoRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar Estorno com id ${id}`);
    }
  }

  async findAll(): Promise<Estorno[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toEstorno(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[EstornoRepository.findAll]', error);
      throw new Error('Erro ao listar Estorno');
    }
  }

  async create(data: CreateEstornoDTO): Promise<Estorno> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
      });
      const created = await getDoc(ref);
      return toEstorno(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[EstornoRepository.create]', error);
      throw new Error('Erro ao criar Estorno');
    }
  }

}
