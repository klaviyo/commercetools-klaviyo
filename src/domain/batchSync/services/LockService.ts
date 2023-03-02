export interface LockService {
    acquireLock(key: string): void;
    releaseLock(key: string): void;
}
