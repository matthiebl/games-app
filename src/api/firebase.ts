// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyAKFoDYeACRB0JZihgj1_cyDdCGXHgbM3M',
    authDomain: 'mhiebl-games.firebaseapp.com',
    projectId: 'mhiebl-games',
    storageBucket: 'mhiebl-games.appspot.com',
    messagingSenderId: '107986729892',
    appId: '1:107986729892:web:cb3d7a317c5e312f451f31',
    measurementId: 'G-FYBLYRM5CQ',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const database = getFirestore(app)

export type GameDB = 'connect'
