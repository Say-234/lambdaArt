// services/userService.ts
import { User, getIdTokenResult } from 'firebase/auth';

export const getUserEtablissementId = async (user: User): Promise<string | null> => {
  try {
    const tokenResult = await getIdTokenResult(user);
    return tokenResult.claims.etablissementId as string || null;
  } catch (error) {
    console.error('Error getting user claims:', error);
    return null;
  }
};