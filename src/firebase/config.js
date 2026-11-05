import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Comprueba si el usuario ya colocó una API Key real de Firebase (empiezan con "AIza")
export const firebaseListo = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'valor_de_apiKey' &&
  firebaseConfig.apiKey.startsWith('AIza')
);

let app = null;
let dbInstance = null;
let authInstance = null;

if (firebaseListo) {
  try {
    app = initializeApp(firebaseConfig);
    dbInstance = getFirestore(app);
    authInstance = getAuth(app);
  } catch (error) {
    console.error('Error al inicializar Firebase:', error);
  }
}

export const db = dbInstance;
export const auth = authInstance;