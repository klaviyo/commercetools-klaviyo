import { LockService } from "./LockService";
import { ErrorCodes, StatusError } from "../../../types/errors/StatusError";

/**
 * This is a very simple implementation of the lock service. This solution will not work when multiple instances of this plugin are running.
 * In that case the lock should be stored in a shared location (e.g. file in a bucket, document in a database...).
 * Write your custom implementation of the LockService based on your requirements.
 */
export class InMemoryLockService implements LockService {
    private locks: string[] = [];
    acquireLock(key: string): void {
        if (this.locks.includes(key)) {
            throw new StatusError(409, 'Cannot acquire lock', ErrorCodes.LOCKED);
        }
        this.locks.push(key);
    }

    releaseLock(key: string): void {
        const index = this.locks.indexOf(key, 0);
        if (index > -1) {
            this.locks.splice(index, 1);
        }
    }
}
