import { LogAuditoriaRepository } from '../LogAuditoriaRepository';
import { getDoc, addDoc } from 'firebase/firestore';
import { CreateLogAuditoriaDTO } from '@/types/domain';

jest.mock('@/lib/firebase/config', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-ts'),
}));

describe('LogAuditoriaRepository', () => {
  let repo: LogAuditoriaRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new LogAuditoriaRepository();
  });

  it('should create log', async () => {
    (addDoc as jest.Mock).mockResolvedValue({ id: 'log1' });
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      id: 'log1',
      data: () => ({ entidade: 'Test', realizadoEm: { toDate: () => new Date() } }),
    });

    const result = await repo.create({ entidade: 'Test' } as unknown as CreateLogAuditoriaDTO);
    expect(result.id).toBe('log1');
  });
});
