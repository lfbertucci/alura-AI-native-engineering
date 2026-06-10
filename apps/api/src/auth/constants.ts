export const jwtConstants = {
  secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
  expiresIn: '1h',
} as const;
