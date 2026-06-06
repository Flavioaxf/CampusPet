import { ProntuarioRepository } from '../ProntuarioRepository';
import { VacinaRepository } from '../VacinaRepository';
import { PesagemRepository } from '../PesagemRepository';
import { TratamentoRepository } from '../TratamentoRepository';
import { StatusCastracaoRepository } from '../StatusCastracaoRepository';
import { RegistroObitoRepository } from '../RegistroObitoRepository';
import { FollowUpPosAdocaoRepository } from '../FollowUpPosAdocaoRepository';
import { AnexoFollowUpRepository } from '../AnexoFollowUpRepository';
import { NotificacaoRepository } from '../NotificacaoRepository';
import { getDoc, addDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';

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
  { name: 'ProntuarioRepository', instance: new ProntuarioRepository() as unknown as BaseRepo },
  { name: 'VacinaRepository', instance: new VacinaRepository() as unknown as BaseRepo },
  { name: 'PesagemRepository', instance: new PesagemRepository() as unknown as BaseRepo },
  { name: 'TratamentoRepository', instance: new TratamentoRepository() as unknown as BaseRepo },
  { name: 'StatusCastracaoRepository', instance: new StatusCastracaoRepository() as unknown as BaseRepo },
  { name: 'RegistroObitoRepository', instance: new RegistroObitoRepository() as unknown as BaseRepo },
  { name: 'FollowUpPosAdocaoRepository', instance: new FollowUpPosAdocaoRepository() as unknown as BaseRepo },
  { name: 'AnexoFollowUpRepository', instance: new AnexoFollowUpRepository() as unknown as BaseRepo },
  { name: 'NotificacaoRepository', instance: new NotificacaoRepository() as unknown as BaseRepo },
];

describe('Bulk Repository Tests', () => {
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
            criadoEm: { toDate: () => new Date() }, 
            submetidoEm: { toDate: () => new Date() }, 
            registradoEm: { toDate: () => new Date() }, 
            data: { toDate: () => new Date() }, 
            dataAplicacao: { toDate: () => new Date() }, 
            dataHora: { toDate: () => new Date() }, 
            dataObito: { toDate: () => new Date() }, 
            enviadaEm: { toDate: () => new Date() } 
          }),
        });
        const result = await instance.findById('1');
        expect(result).toBeDefined();
      });

      it('should find by id without optional fields', async () => {
        (getDoc as jest.Mock).mockResolvedValue({
          exists: () => true,
          id: '2',
          data: () => ({}),
        });
        const result = await instance.findById('2');
        expect(result).toBeDefined();
      });

      it('should find all', async () => {
        (getDocs as jest.Mock).mockResolvedValue({
          docs: [{ 
            id: '1', 
            data: () => ({ 
              criadoEm: { toDate: () => new Date() }, 
              registradoEm: { toDate: () => new Date() }, 
              data: { toDate: () => new Date() }, 
              dataAplicacao: { toDate: () => new Date() }, 
              enviadaEm: { toDate: () => new Date() } 
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
              criadoEm: { toDate: () => new Date() }, 
              registradoEm: { toDate: () => new Date() }, 
              data: { toDate: () => new Date() }, 
              dataAplicacao: { toDate: () => new Date() }, 
              enviadaEm: { toDate: () => new Date() } 
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
            data: () => ({ criadoEm: { toDate: () => new Date() } }),
          });
          const result = await instance.update('1', {});
          expect(result.id).toBe('1');
          expect(updateDoc).toHaveBeenCalled();
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
});
