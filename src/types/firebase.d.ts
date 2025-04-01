// This is a placeholder declaration file to resolve Firebase type issues
declare module 'firebase-admin' {
  export interface App {}
  export interface Auth {}
  export interface DecodedIdToken {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
  }
  
  export function initializeApp(): App;
  export function getApp(): App;
  export function getAuth(app?: App): Auth;
}

declare module 'firebase' {
  export interface User {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
  }
}

declare module 'firebase/app' {
  export interface FirebaseApp {}
  export function initializeApp(config: any): FirebaseApp;
}

declare module 'firebase/auth' {
  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
  }

  export function getAuth(app?: any): any;
  export function signInWithPopup(auth: any, provider: any): Promise<any>;
  export function createUserWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function signInWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function signOut(auth: any): Promise<void>;
  export function onAuthStateChanged(auth: any, callback: (user: User | null) => void): () => void;
  
  export class GoogleAuthProvider {
    constructor();
  }
}

declare module 'firebase/firestore' {
  export function getFirestore(app?: any): any;
} 