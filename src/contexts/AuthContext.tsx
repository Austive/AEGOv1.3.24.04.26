import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthContextType {
  user: User | null;
  role: 'client' | 'company' | 'personnel' | 'admin' | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, role: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'client' | 'company' | 'personnel' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Check if user exists in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const fetchedRole = userSnap.data().role;
          if (currentUser.email === "nhlakaaushlubi@gmail.com" && fetchedRole !== 'admin') {
            await setDoc(userRef, { role: 'admin' }, { merge: true });
            setRole('admin');
          } else if (currentUser.email === "nhlakaaushlubi@gmail.com") {
            setRole('admin');
          } else {
            setRole(fetchedRole);
          }
        } else {
          // Create new user as client by default (unless admin email)
          const defaultRole = currentUser.email === "nhlakaaushlubi@gmail.com" ? 'admin' : 'client';
          await setDoc(userRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || 'New User',
            role: defaultRole,
            createdAt: serverTimestamp()
          });
          setRole(defaultRole);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
