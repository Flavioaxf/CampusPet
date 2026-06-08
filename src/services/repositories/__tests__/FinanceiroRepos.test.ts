import { DoacaoRepository } from '../DoacaoRepository';
import { DespesaRepository } from '../DespesaRepository';
import { EstornoRepository } from '../EstornoRepository';
import { ContaFinanceiraRepository } from '../ContaFinanceiraRepository';
import { CategoriaFinanceiraRepository } from '../CategoriaFinanceiraRepository';
import { getDoc, addDoc, getDocs, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { StatusDoacao } from '@/types/enums';

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
  Timestamp: {
    fromDate: jest.fn((date) => ({ toDate: () => date })),
  },
}));

interface BaseRepo {
  findById(id: string): Promise<unknown>;
  findAll(): Promise<unknown[]>;
  create?(data: unknown): Promise<{ id: string }>;
  update?(id: string, data: unknown): Promise<{ id: string }>;
  delete?(id: string): Promise<void>;
  hasMovimentacoes?(id: string): Promise<boolean>;
}

const repos: { name: string; instance: BaseRepo }[] = [
  { name: 'DoacaoRepository', instance: new DoacaoRepository() as unknown as BaseRepo },
  { name: 'DespesaRepository', instance: new DespesaRepository() as unknown as BaseRepo },
  { name: 'EstornoRepository', instance: new EstornoRepository() as unknown as BaseRepo },
  { name: 'ContaFinanceiraRepository', instance: new ContaFinanceiraRepository() as unknown as BaseRepo },
  { name: 'CategoriaFinanceiraRepository', instance: new CategoriaFinanceiraRepository() as unknown as BaseRepo },
];

describe('Financeiro Repository Tests', () => {
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
            registradoEm: { toDate: () => new Date() }, 
            data: { toDate: () => new Date() },
            realizadoEm: { toDate: () => new Date() }
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
              registradoEm: { toDate: () => new Date() }, 
              data: { toDate: () => new Date() },
              realizadoEm: { toDate: () => new Date() }
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
              registradoEm: { toDate: () => new Date() }, 
              data: { toDate: () => new Date() },
              realizadoEm: { toDate: () => new Date() }
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
            data: () => ({ registradoEm: { toDate: () => new Date() }, data: { toDate: () => new Date() } }),
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
    it('ContaFinanceiraRepository.hasMovimentacoes should return true if has despesas', async () => {
      const repo = new ContaFinanceiraRepository();
      (getDocs as jest.Mock).mockResolvedValueOnce({ empty: false }); // despesas
      const result = await repo.hasMovimentacoes('1');
      expect(result).toBe(true);
    });

    it('ContaFinanceiraRepository.hasMovimentacoes should return true if has doacoes', async () => {
      const repo = new ContaFinanceiraRepository();
      (getDocs as jest.Mock)
        .mockResolvedValueOnce({ empty: true }) // despesas
        .mockResolvedValueOnce({ empty: false }); // doacoes
      const result = await repo.hasMovimentacoes('1');
      expect(result).toBe(true);
    });

    it('CategoriaFinanceiraRepository.hasMovimentacoes should return true if has despesas', async () => {
      const repo = new CategoriaFinanceiraRepository();
      (getDocs as jest.Mock).mockResolvedValueOnce({ empty: false }); // despesas
      const result = await repo.hasMovimentacoes('1');
      expect(result).toBe(true);
    });

    it('DoacaoRepository.findByStatus should call query with status', async () => {
      const repo = new DoacaoRepository();
      (getDocs as jest.Mock).mockResolvedValue({ docs: [] });
      await repo.findByStatus(StatusDoacao.PENDENTE);
      expect(where).toHaveBeenCalledWith('status', '==', StatusDoacao.PENDENTE);
    });

    it('DoacaoRepository.findByPeriodo should call query with dates', async () => {
      const repo = new DoacaoRepository();
      (getDocs as jest.Mock).mockResolvedValue({ docs: [] });
      await repo.findByPeriodo(new Date(), new Date());
      expect(where).toHaveBeenCalledWith('data', '>=', expect.anything());
    });

    it('DespesaRepository.findByPeriodo should call query with dates', async () => {
      const repo = new DespesaRepository();
      (getDocs as jest.Mock).mockResolvedValue({ docs: [] });
      await repo.findByPeriodo(new Date(), new Date());
      expect(where).toHaveBeenCalledWith('data', '>=', expect.anything());
    });

    it('DespesaRepository.findByAnimal should call query with animalId', async () => {
      const repo = new DespesaRepository();
      (getDocs as jest.Mock).mockResolvedValue({ docs: [] });
      await repo.findByAnimal('animal-1');
      expect(where).toHaveBeenCalledWith('prontuarioId', '==', 'animal-1');
    });
  });
});
