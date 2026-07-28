import { db } from "@/lib/db";

export function getTwoFactorState(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: { twoFactorEnabled: true, twoFactorSecret: true, twoFactorBackupCodes: true, passwordHash: true },
  });
}

export function setPendingTwoFactorSecret(userId: string, secret: string) {
  return db.user.update({ where: { id: userId }, data: { twoFactorSecret: secret, twoFactorEnabled: false } });
}

export function activateTwoFactor(userId: string, hashedBackupCodes: string[]) {
  return db.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: true, twoFactorBackupCodes: hashedBackupCodes },
  });
}

export function disableTwoFactor(userId: string) {
  return db.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: false, twoFactorSecret: null, twoFactorBackupCodes: [] },
  });
}

export function consumeBackupCode(userId: string, remainingHashes: string[]) {
  return db.user.update({ where: { id: userId }, data: { twoFactorBackupCodes: remainingHashes } });
}
