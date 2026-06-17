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
    where("userId", "==", userId)
  );
  
  const querySnapshot = await getDocs(q);
  const actions: (EcoAction & { createdAt: number })[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    actions.push({
      id: doc.id,
      name: data.name,
      co2SavedKg: data.co2SavedKg,
      date: data.date,
      createdAt: data.createdAt?.toMillis() || Date.now()
    } as EcoAction & { createdAt: number });
  });
  
  return actions.sort((a, b) => b.createdAt - a.createdAt);
};

export const deleteEcoAction = async (actionId: string) => {
  await deleteDoc(doc(db, 'ecoActions', actionId));
};
