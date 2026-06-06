import { UsuarioRepository } from '../UsuarioRepository';
import { getDoc, getDocs, query, updateDoc, deleteDoc } from 'firebase/firestore';

jest.mock('@/lib/firebase/config', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-timestamp'),
}));

describe('UsuarioRepository', () => {
  let repo: UsuarioRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new UsuarioRepository();
  });

  it('should find by email', async () => {
    (getDocs as jest.Mock).mockResolvedValue({
      empty: false,
      docs: [{
        id: '1',
        data: () => ({ email: 'test@test.com', criadoEm: { toDate: () => new Date() } }),
      }],
    });

    const result = await repo.findByEmail('test@test.com');
    expect(result?.email).toBe('test@test.com');
    expect(query).toHaveBeenCalled();
  });

  it('should find all', async () => {
    (getDocs as jest.Mock).mockResolvedValue({
      docs: [{ id: '1', data: () => ({ email: 'a@a.com', criadoEm: { toDate: () => new Date() } }) }],
    });
    const result = await repo.findAll();
    expect(result).toHaveLength(1);
  });

  it('should update', async () => {
    (updateDoc as jest.Mock).mockResolvedValue(undefined);
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      id: '1',
      data: () => ({ email: 'u@u.com', criadoEm: { toDate: () => new Date() } }),
    });
    const result = await repo.update('1', { nome: 'New' });
    expect(result.id).toBe('1');
  });

  it('should find by email without optional fields', async () => {
    (getDocs as jest.Mock).mockResolvedValue({
      empty: false,
      docs: [{
        id: '2',
        data: () => ({ email: 'b@b.com', criadoEm: { toDate: () => new Date() } }),
      }],
    });
    const result = await repo.findByEmail('b@b.com');
    expect(result?.ultimoLogin).toBeNull();
  });

  it('should return null if by email not found', async () => {
    (getDocs as jest.Mock).mockResolvedValue({ empty: true });
    const result = await repo.findByEmail('none@test.com');
    expect(result).toBeNull();
  });

  it('should find by reset token', async () => {
    (getDocs as jest.Mock).mockResolvedValue({
      empty: false,
      docs: [{
        id: '3',
        data: () => ({ email: 'c@c.com', resetToken: 'tok', criadoEm: { toDate: () => new Date() } }),
      }],
    });
    const result = await repo.findByResetToken('tok');
    expect(result?.id).toBe('3');
  });

  it('should return null if reset token not found', async () => {
    (getDocs as jest.Mock).mockResolvedValue({ empty: true });
    const result = await repo.findByResetToken('none');
    expect(result).toBeNull();
  });

  it('should find by convite token', async () => {
    (getDocs as jest.Mock).mockResolvedValue({
      empty: false,
      docs: [{
        id: '4',
        data: () => ({ email: 'd@d.com', conviteToken: 'ctok', criadoEm: { toDate: () => new Date() } }),
      }],
    });
    const result = await repo.findByConviteToken('ctok');
    expect(result?.id).toBe('4');
  });

  it('should return null if convite token not found', async () => {
    (getDocs as jest.Mock).mockResolvedValue({ empty: true });
    const result = await repo.findByConviteToken('none');
    expect(result).toBeNull();
  });

  it('should handle delete', async () => {
    await repo.delete('1');
    expect(deleteDoc).toHaveBeenCalled();
  });
});
