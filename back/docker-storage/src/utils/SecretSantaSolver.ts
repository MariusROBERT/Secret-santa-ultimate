import {SecretSantaEntity} from "../database/entities/secretsanta.entity";
import {UserEntity} from "../database/entities/user.entity";

export function solve(secretSanta: SecretSantaEntity, iteration: number = 0) {
  if (iteration > 10000) {
    // If we can't find a solution after 10000 iterations, give up
    return null;
  }
  const remainingGiftees = [...secretSanta.users];
  const secretSantaMap: Map<UserEntity, UserEntity> = new Map();

  for (const user of secretSanta.users) {
    const availableGiftees = remainingGiftees.filter(
        giftee => giftee.id !== user.id &&
            (!user.forbidden || !user.forbidden.includes(giftee.id)) &&
            secretSantaMap.get(giftee) !== user
    );

    if (availableGiftees.length === 0) {
      // If there are no suitable giftees, start over
      return solve(secretSanta, iteration + 1);
    }

    const randomIndex = Math.floor(Math.random() * availableGiftees.length);
    const selectedGiftee = availableGiftees[randomIndex];

    secretSantaMap.set(user, selectedGiftee);
    remainingGiftees.splice(remainingGiftees.indexOf(selectedGiftee), 1);
  }

  return secretSantaMap;
}