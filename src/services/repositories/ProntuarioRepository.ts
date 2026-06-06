import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { IProntuarioRepository } from '@/services/interfaces/IProntuarioRepository';
import type { Prontuario, CreateProntuarioDTO } from '@/types/domain';

const COLLECTION = 'prontuarios';

function toProntuario(id: string, data: Record<string, unknown>): Prontuario {
  return {
    id,
    ...(data as unknown as Omit<Prontuario, 'id'>),
  };
}

export class ProntuarioRepository implements IProntuarioRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<Prontuario | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toProntuario(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[ProntuarioRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar Prontuario com id ${id}`);
    }
  }

  async findAll(): Promise<Prontuario[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toProntuario(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[ProntuarioRepository.findAll]', error);
      throw new Error('Erro ao listar Prontuario');
    }
  }

  async create(data: CreateProntuarioDTO): Promise<Prontuario> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
      });
      const created = await getDoc(ref);
      return toProntuario(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[ProntuarioRepository.create]', error);
      throw new Error('Erro ao criar Prontuario');
    }
  }

  async update(id: string, data: Partial<Prontuario>): Promise<Prontuario> {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data as Record<string, unknown>);
      const updated = await getDoc(ref);
      return toProntuario(updated.id, (updated.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error(`[ProntuarioRepository.update] id=${id}`, error);
      throw new Error(`Erro ao atualizar Prontuario com id ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
      console.error(`[ProntuarioRepository.delete] id=${id}`, error);
      throw new Error(`Erro ao excluir Prontuario com id ${id}`);
    }
  }
}
