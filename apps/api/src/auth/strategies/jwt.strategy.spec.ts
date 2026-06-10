import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy();
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
