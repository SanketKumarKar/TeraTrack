/** Jest mock for firebase/auth */
export const getAuth = jest.fn(() => ({}));
export const onAuthStateChanged = jest.fn((_auth: unknown, callback: (user: null) => void) => {
  callback(null);
  return jest.fn(); // unsubscribe
});
export const signInAnonymously = jest.fn(() => Promise.resolve({ user: { uid: 'anon-test-uid', isAnonymous: true } }));
export const signInWithPopup = jest.fn(() => Promise.resolve({ user: { uid: 'google-test-uid', isAnonymous: false } }));
export const GoogleAuthProvider = jest.fn(() => ({}));
export const signOut = jest.fn(() => Promise.resolve());
