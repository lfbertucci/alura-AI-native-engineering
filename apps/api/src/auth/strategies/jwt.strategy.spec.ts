import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

const mockConfig = { get: (key: string, fallback: string) => fallback } as unknown as ConfigService;

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy(mockConfig);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('validate() returns { userId, email } from payload', () => {
    const result = strategy.validate({
      sub: 'user-123',
      email: 'test@example.com',
    });
    expect(result).toEqual({ userId: 'user-123', email: 'test@example.com' });
  });
});
