/** Jest mock for firebase/firestore */
export const getFirestore = jest.fn(() => ({}));
export const collection = jest.fn();
export const doc = jest.fn();
export const setDoc = jest.fn(() => Promise.resolve());
export const getDoc = jest.fn(() => Promise.resolve({ exists: () => false, data: () => null }));
export const getDocs = jest.fn(() => Promise.resolve({ forEach: jest.fn() }));
export const addDoc = jest.fn(() => Promise.resolve({ id: 'mock-doc-id' }));
export const deleteDoc = jest.fn(() => Promise.resolve());
export const query = jest.fn();
export const where = jest.fn();
export const orderBy = jest.fn();
export const serverTimestamp = jest.fn(() => new Date());
