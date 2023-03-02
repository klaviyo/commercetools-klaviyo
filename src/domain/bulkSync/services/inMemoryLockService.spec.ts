import { InMemoryLockService } from "./InMemoryLockService";

describe('inMemoryLockService', () => {
  it('should acquire the lock and reject any subsequent request to lock', async () => {
    const lockService = new InMemoryLockService();
    const lockKey = "some-key"
    lockService.acquireLock(lockKey);
    expect(() => lockService.acquireLock(lockKey)).toThrow(Error)
  });

  it('should allow to acquire the lock when released', async () => {
    const lockService = new InMemoryLockService();
    const lockKey = "some-key"
    lockService.acquireLock(lockKey);
    lockService.releaseLock(lockKey);
    lockService.acquireLock(lockKey);
    expect(() => lockService.acquireLock(lockKey)).toThrow(Error)
  });
});
