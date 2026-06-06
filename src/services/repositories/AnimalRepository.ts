import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { IAnimalRepository } from '@/services/interfaces/IAnimalRepository';
import type { Animal, CreateAnimalDTO } from '@/types/domain';

const COLLECTION = 'animais';

function toAnimal(id: string, data: Record<string, unknown>): Animal {
  const { criadoEm, ...rest } = data;
  return {
    id,
    ...(rest as unknown as Omit<Animal, 'id' | 'criadoEm'>),
    criadoEm: (criadoEm as Timestamp).toDate(),
  };
}

export class AnimalRepository implements IAnimalRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<Animal | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toAnimal(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[AnimalRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar Animal com id ${id}`);
    }
  }

  async findAll(): Promise<Animal[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toAnimal(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[AnimalRepository.findAll]', error);
      throw new Error('Erro ao listar Animal');
    }
  }

  async create(data: CreateAnimalDTO): Promise<Animal> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
        criadoEm: serverTimestamp(),
      });
      const created = await getDoc(ref);
      return toAnimal(created.id, created.data() as Record<string, unknown>);
    } catch (error) {
      console.error('[AnimalRepository.create]', error);
      throw new Error('Erro ao criar Animal');
    }
  }

  async update(id: string, data: Partial<Animal>): Promise<Animal> {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data as Record<string, unknown>);
      const updated = await getDoc(ref);
      return toAnimal(updated.id, updated.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[AnimalRepository.update] id=${id}`, error);
      throw new Error(`Erro ao atualizar Animal com id ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
      console.error(`[AnimalRepository.delete] id=${id}`, error);
      throw new Error(`Erro ao excluir Animal com id ${id}`);
    }
  }
}
