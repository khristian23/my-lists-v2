import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyA2EfzkNysLCoZ9KcUgJ8Rb7HT-j_XWbMk',
  authDomain: 'my-lists-2c9dd.firebaseapp.com',
  databaseURL: 'https://my-lists-2c9dd.firebaseio.com',
  projectId: 'my-lists-2c9dd',
  storageBucket: 'my-lists-2c9dd.appspot.com',
  messagingSenderId: '108046000528',
  appId: '1:108046000528:web:fab76349e86d51ad74d315',
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const firebaseAuth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const firebaseStorage = getStorage(firebaseApp);

if (window.location.hostname.includes('localhost')) {
  connectAuthEmulator(firebaseAuth, 'http://localhost:9099/');
  connectFirestoreEmulator(firestore, 'localhost', 8080);
}

export { firebaseAuth, firestore, firebaseStorage };
