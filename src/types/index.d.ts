/// <reference types="firebase" />

// This resolves the missing firebase types error
declare module "firebase" {
  export interface User {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
  }
}

declare module "firebase-admin" {
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