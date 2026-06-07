import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/services/AuthService.ts',
    'src/services/UserService.ts',
    'src/services/AnimalService.ts',
    'src/services/ProntuarioService.ts',
    'src/services/ApprovalService.ts',
    'src/services/FinanceiroService.ts',
    'src/services/repositories/UsuarioRepository.ts',
    'src/services/repositories/AnimalRepository.ts',
    'src/services/repositories/ProntuarioRepository.ts',
    'src/services/repositories/VacinaRepository.ts',
    'src/services/repositories/PesagemRepository.ts',
    'src/services/repositories/TratamentoRepository.ts',
    'src/services/repositories/StatusCastracaoRepository.ts',
    'src/services/repositories/RegistroObitoRepository.ts',
    'src/services/repositories/FollowUpPosAdocaoRepository.ts',
    'src/services/repositories/AnexoFollowUpRepository.ts',
    'src/services/repositories/AlteracaoPendenteRepository.ts',
    'src/services/repositories/LogAuditoriaRepository.ts',
    'src/services/repositories/NotificacaoRepository.ts',
    'src/services/repositories/DoacaoRepository.ts',
    'src/services/repositories/DespesaRepository.ts',
    'src/services/repositories/EstornoRepository.ts',
    'src/services/repositories/ContaFinanceiraRepository.ts',
    'src/services/repositories/CategoriaFinanceiraRepository.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

export default config;
