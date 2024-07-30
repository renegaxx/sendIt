// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAMddp1YHbnrgBSVKYzUNanLtVxxWxs6EE",
    authDomain: "sendit-cc0c7.firebaseapp.com",
    projectId: "sendit-cc0c7",
    storageBucket: "sendit-cc0c7.appspot.com",
    messagingSenderId: "658225521625",
    appId: "1:658225521625:web:9228fccca96dbc96d06fc8"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);


export { auth, firestore };