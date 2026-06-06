import { collection, doc, getDoc, getDocs, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { IRegistroObitoRepository } from '@/services/interfaces/IRegistroObitoRepository';
import type { RegistroObito, CreateRegistroObitoDTO } from '@/types/domain';

const COLLECTION = 'registros_obito';

function toRegistroObito(id: string, data: Record<string, unknown>): RegistroObito {
  return {
    id,
    ...(data as unknown as Omit<RegistroObito, 'id' | 'dataObito' | 'registradoEm'>),
    dataObito: data.dataObito ? (data.dataObito as Timestamp).toDate() : new Date(),
    registradoEm: data.registradoEm ? (data.registradoEm as Timestamp).toDate() : new Date(),
  };
}

export class RegistroObitoRepository implements IRegistroObitoRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<RegistroObito | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toRegistroObito(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[RegistroObitoRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar RegistroObito com id ${id}`);
    }
  }

  async findAll(): Promise<RegistroObito[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toRegistroObito(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[RegistroObitoRepository.findAll]', error);
      throw new Error('Erro ao listar RegistroObito');
    }
  }

  async create(data: CreateRegistroObitoDTO): Promise<RegistroObito> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
        registradoEm: serverTimestamp(),
      });
      const created = await getDoc(ref);
      return toRegistroObito(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[RegistroObitoRepository.create]', error);
      throw new Error('Erro ao criar RegistroObito');
    }
  }

}
