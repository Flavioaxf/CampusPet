import { AnimalRepository } from '../AnimalRepository';
import { getDoc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { StatusAnimal, EspecieAnimal, SexoAnimal } from '@/types/enums';
import { CreateAnimalDTO } from '@/types/domain';

jest.mock('@/lib/firebase/config', () => ({
  db: {},
}));

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
  serverTimestamp: jest.fn(() => 'mock-timestamp'),
  Timestamp: {
    fromDate: jest.fn(),
  },
}));

describe('AnimalRepository', () => {
  let repo: AnimalRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new AnimalRepository();
  });

  const mockAnimalData = {
    nome: 'Rex',
    especie: EspecieAnimal.CAO,
    pelagem: 'Marrom',
    sexo: SexoAnimal.MACHO,
    idadeEstimada: '2 anos',
    status: StatusAnimal.EM_CUIDADO,
    aptoParaAdocao: false,
    fotoUrl: 'http://photo.com',
    criadoEm: { toDate: () => new Date() },
  };

  it('should find by id', async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      id: '1',
      data: () => mockAnimalData,
    });

    const result = await repo.findById('1');

    expect(result?.nome).toBe('Rex');
    expect(getDoc).toHaveBeenCalled();
  });

  it('should create animal', async () => {
    (addDoc as jest.Mock).mockResolvedValue({ id: 'new-id' });
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      id: 'new-id',
      data: () => mockAnimalData,
    });

    const result = await repo.create(mockAnimalData as unknown as CreateAnimalDTO);

    expect(result.id).toBe('new-id');
    expect(addDoc).toHaveBeenCalled();
  });

  it('should find all', async () => {
    (getDocs as jest.Mock).mockResolvedValue({
      docs: [{ id: '1', data: () => mockAnimalData }],
    });
    const result = await repo.findAll();
    expect(result).toHaveLength(1);
  });

  it('should update animal', async () => {
    (updateDoc as jest.Mock).mockResolvedValue(undefined);
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      id: '1',
      data: () => mockAnimalData,
    });
    const result = await repo.update('1', { nome: 'Updated' });
    expect(result.nome).toBe('Rex'); // toAnimal converts the data
    expect(updateDoc).toHaveBeenCalled();
  });

  it('should delete animal', async () => {
    await repo.delete('1');
    expect(deleteDoc).toHaveBeenCalled();
  });
});
