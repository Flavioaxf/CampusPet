import { AlteracaoPendenteRepository } from '../AlteracaoPendenteRepository';
import { getDoc, updateDoc } from 'firebase/firestore';
import { CreateAlteracaoPendenteDTO } from '@/types/domain';

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
  serverTimestamp: jest.fn(() => 'mock-ts'),
}));

describe('AlteracaoPendenteRepository', () => {
  let repo: AlteracaoPendenteRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new AlteracaoPendenteRepository();
  });

  it('should find by id', async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      id: '1',
      data: () => ({ entidade: 'Animal', submetidoEm: { toDate: () => new Date() } }),
    });
    const result = await repo.findById('1');
    expect(result?.id).toBe('1');
  });

  it('should update', async () => {
    (updateDoc as jest.Mock).mockResolvedValue(undefined);
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      id: '1',
      data: () => ({ status: 'APROVADO', submetidoEm: { toDate: () => new Date() } }),
    });
    const result = await repo.update('1', { status: 'APROVADO' } as CreateAlteracaoPendenteDTO);
    expect(updateDoc).toHaveBeenCalled();
    expect(result.id).toBe('1');
  });
});
