import { PontoAlimentacaoRepository } from '../PontoAlimentacaoRepository';
import { VistoriaPontoAlimentacaoRepository } from '../VistoriaPontoAlimentacaoRepository';
import { getDoc, addDoc, getDocs, updateDoc, deleteDoc, where } from 'firebase/firestore';

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
  serverTimestamp: jest.fn(() => 'mock-ts'),
}));

interface BaseRepo {
  findById(id: string): Promise<unknown>;
  findAll(): Promise<unknown[]>;
  create?(data: unknown): Promise<{ id: string }>;
  update?(id: string, data: unknown): Promise<{ id: string }>;
  delete?(id: string): Promise<void>;
}

const repos: { name: string; instance: BaseRepo }[] = [
  { name: 'PontoAlimentacaoRepository', instance: new PontoAlimentacaoRepository() as unknown as BaseRepo },
  { name: 'VistoriaPontoAlimentacaoRepository', instance: new VistoriaPontoAlimentacaoRepository() as unknown as BaseRepo },
];

describe('Campo Repository Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  repos.forEach(({ name, instance }) => {
    describe(name, () => {
      it('should find by id', async () => {
        (getDoc as jest.Mock).mockResolvedValue({
          exists: () => true,
          id: '1',
          data: () => ({ 
            dataHora: { toDate: () => new Date() } 
          }),
        });
        const result = await instance.findById('1');
        expect(result).toBeDefined();
      });

      it('should find all', async () => {
        (getDocs as jest.Mock).mockResolvedValue({
          docs: [{ 
            id: '1', 
            data: () => ({ 
              dataHora: { toDate: () => new Date() } 
            }) 
          }],
        });
        const result = await instance.findAll();
        expect(result).toHaveLength(1);
      });

      it('should create', async () => {
        if (instance.create) {
          (addDoc as jest.Mock).mockResolvedValue({ id: 'new' });
          (getDoc as jest.Mock).mockResolvedValue({
            exists: () => true,
            id: 'new',
            data: () => ({ 
              dataHora: { toDate: () => new Date() } 
            }),
          });
          const result = await instance.create({});
          expect(result.id).toBe('new');
        }
      });
      
      it('should update', async () => {
        if (instance.update) {
          (updateDoc as jest.Mock).mockResolvedValue(undefined);
          (getDoc as jest.Mock).mockResolvedValue({
            exists: () => true,
            id: '1',
            data: () => ({ 
              dataHora: { toDate: () => new Date() } 
            }),
          });
          const result = await instance.update('1', {});
          expect(result.id).toBe('1');
        }
      });

      it('should delete', async () => {
        if (instance.delete) {
          await instance.delete('1');
          expect(deleteDoc).toHaveBeenCalled();
        }
      });
    });
  });

  describe('Specific Methods', () => {
    it('PontoAlimentacaoRepository.findAtivos should call query with status ATIVO', async () => {
      const repo = new PontoAlimentacaoRepository();
      (getDocs as jest.Mock).mockResolvedValue({ docs: [] });
      await repo.findAtivos();
      expect(where).toHaveBeenCalledWith('status', '==', 'ATIVO');
    });

    it('VistoriaPontoAlimentacaoRepository.findUltimaVistoria should call query with pontoId', async () => {
      const repo = new VistoriaPontoAlimentacaoRepository();
      (getDocs as jest.Mock).mockResolvedValue({ docs: [], empty: true });
      await repo.findUltimaVistoria('p1');
      expect(where).toHaveBeenCalledWith('pontoId', '==', 'p1');
    });
  });
});
