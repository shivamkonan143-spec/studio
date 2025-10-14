
'use client';
import {
  Auth, 
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  AuthError,
  User,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  sendPasswordResetEmail,
} from 'firebase/auth';

type AuthCallback = (user: User | null, error: AuthError | null) => void;
type PhoneAuthCallback = (confirmationResult: ConfirmationResult | null, error: AuthError | null) => void;
type PasswordResetCallback = (success: boolean, error: AuthError | null) => void;


/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth, callback?: AuthCallback): void {
  signInAnonymously(authInstance)
    .then((userCredential) => callback && callback(userCredential.user, null))
    .catch((error) => callback && callback(null, error));
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, callback?: AuthCallback): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then((userCredential) => callback && callback(userCredential.user, null))
    .catch((error) => callback && callback(null, error));
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string, callback?: AuthCallback): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .then((userCredential) => callback && callback(userCredential.user, null))
    .catch((error) => callback && callback(null, error));
}

/** Initiate Google sign-in (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth, callback?: AuthCallback): void {
    const provider = new GoogleAuthProvider();
    signInWithPopup(authInstance, provider)
      .then((userCredential) => callback && callback(userCredential.user, null))
      .catch((error) => callback && callback(null, error));
}

/** Initiate Phone number sign-in (non-blocking). */
export function initiatePhoneSignIn(authInstance: Auth, phoneNumber: string, verifier: RecaptchaVerifier, callback: PhoneAuthCallback): void {
  signInWithPhoneNumber(authInstance, phoneNumber, verifier)
    .then((confirmationResult) => {
      callback(confirmationResult, null);
    })
    .catch((error) => {
      callback(null, error);
    });
}

/** Verify OTP (non-blocking). */
export function verifyOtp(confirmationResult: ConfirmationResult, otp: string, callback: AuthCallback): void {
    confirmationResult.confirm(otp)
        .then((result) => {
            callback(result.user, null);
        })
        .catch((error) => {
            callback(null, error);
        });
}

/** Initiate password reset email (non-blocking). */
export function initiatePasswordReset(authInstance: Auth, email: string, callback?: PasswordResetCallback): void {
    sendPasswordResetEmail(authInstance, email)
        .then(() => callback && callback(true, null))
        .catch((error) => callback && callback(false, error));
}
    
