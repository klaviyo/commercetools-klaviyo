export interface LockService {
    acquireLock(key: string): Promise<void> | void;
    releaseLock(key: string): Promise<void> | void;
    checkLock(key: string): Promise<void> | void;
}
