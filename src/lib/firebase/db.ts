import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';
import type { UserInputData, EcoAction } from '../types';

export const saveCarbonInput = async (userId: string, data: UserInputData) => {
  const docRef = doc(db, 'carbonInputs', userId);
  await setDoc(docRef, {
    userId,
    data,
    updatedAt: serverTimestamp()
  });
};

export const getCarbonInput = async (userId: string): Promise<UserInputData | null> => {
  const docRef = doc(db, 'carbonInputs', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().data as UserInputData;
  }
  return null;
};

export const addEcoAction = async (userId: string, action: Omit<EcoAction, 'id'>) => {
  const actionsRef = collection(db, 'ecoActions');
  const docRef = await addDoc(actionsRef, {
    ...action,
    userId,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const getEcoActions = async (userId: string): Promise<EcoAction[]> => {
  const actionsRef = collection(db, 'ecoActions');
  const q = query(
    actionsRef, 
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  const actions: EcoAction[] = [];
  querySnapshot.forEach((document) => {
    const data = document.data();
    actions.push({
      id: document.id,
      name: data.name,
      co2SavedKg: data.co2SavedKg,
      date: data.date,
    } as EcoAction);
  });
  
  return actions;
};

/**
 * Deletes an eco action. Requires the userId for ownership verification at
 * the application layer (Firestore rules enforce this at the DB layer too).
 */
export const deleteEcoAction = async (actionId: string, userId: string): Promise<void> => {
  const docRef = doc(db, 'ecoActions', actionId);
  const snap = await getDoc(docRef);
  if (!snap.exists() || snap.data().userId !== userId) {
    throw new Error('Action not found or permission denied.');
  }
  await deleteDoc(docRef);
};
