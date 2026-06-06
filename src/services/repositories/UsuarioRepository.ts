import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { IUsuarioRepository } from '@/services/interfaces/IUsuarioRepository';
import type { Usuario, CreateUsuarioDTO } from '@/types/domain';

const COLLECTION = 'usuarios';

function toUsuario(id: string, data: Record<string, unknown>): Usuario {
  return {
    id,
    ...(data as unknown as Omit<Usuario, 'id' | 'criadoEm' | 'ultimoLogin' | 'bloqueadoAte' | 'resetExpires' | 'conviteExpires'>),
    criadoEm: data.criadoEm ? (data.criadoEm as Timestamp).toDate() : new Date(),
    ultimoLogin: data.ultimoLogin ? (data.ultimoLogin as Timestamp).toDate() : null,
    bloqueadoAte: data.bloqueadoAte ? (data.bloqueadoAte as Timestamp).toDate() : null,
    resetExpires: data.resetExpires ? (data.resetExpires as Timestamp).toDate() : null,
    conviteExpires: data.conviteExpires ? (data.conviteExpires as Timestamp).toDate() : null,
  };
}

export class UsuarioRepository implements IUsuarioRepository {
  private col = collection(db, COLLECTION);

  async findById(id: string): Promise<Usuario | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      return toUsuario(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[UsuarioRepository.findById] id=${id}`, error);
      throw new Error(`Erro ao buscar Usuario com id ${id}`);
    }
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    try {
      const q = query(this.col, where('email', '==', email), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      const d = snap.docs[0];
      return toUsuario(d.id, d.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[UsuarioRepository.findByEmail] email=${email}`, error);
      throw new Error(`Erro ao buscar Usuario com email ${email}`);
    }
  }

  async findByResetToken(token: string): Promise<Usuario | null> {
    try {
      const q = query(this.col, where('resetToken', '==', token), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      const d = snap.docs[0];
      return toUsuario(d.id, d.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[UsuarioRepository.findByResetToken] token=${token}`, error);
      throw new Error(`Erro ao buscar Usuario com resetToken ${token}`);
    }
  }

  async findByConviteToken(token: string): Promise<Usuario | null> {
    try {
      const q = query(this.col, where('conviteToken', '==', token), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      const d = snap.docs[0];
      return toUsuario(d.id, d.data() as Record<string, unknown>);
    } catch (error) {
      console.error(`[UsuarioRepository.findByConviteToken] token=${token}`, error);
      throw new Error(`Erro ao buscar Usuario com conviteToken ${token}`);
    }
  }

  async findAll(): Promise<Usuario[]> {
    try {
      const snap = await getDocs(this.col);
      return snap.docs.map((d) => toUsuario(d.id, d.data() as Record<string, unknown>));
    } catch (error) {
      console.error('[UsuarioRepository.findAll]', error);
      throw new Error('Erro ao listar Usuario');
    }
  }

  async create(data: CreateUsuarioDTO): Promise<Usuario> {
    try {
      const payload = { ...data };
      const ref = await addDoc(this.col, {
        ...payload,
        criadoEm: serverTimestamp(),
      });
      const created = await getDoc(ref);
      return toUsuario(created.id, (created.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error('[UsuarioRepository.create]', error);
      throw new Error('Erro ao criar Usuario');
    }
  }

  async update(id: string, data: Partial<Usuario>): Promise<Usuario> {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data as Record<string, unknown>);
      const updated = await getDoc(ref);
      return toUsuario(updated.id, (updated.data() as Record<string, unknown>) || {});
    } catch (error) {
      console.error(`[UsuarioRepository.update] id=${id}`, error);
      throw new Error(`Erro ao atualizar Usuario com id ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
      console.error(`[UsuarioRepository.delete] id=${id}`, error);
      throw new Error(`Erro ao excluir Usuario com id ${id}`);
    }
  }
}
