// providers/AuthProvider.tsx
"use client";

import {createContext, useContext, useState, ReactNode} from "react";

interface AuthContextType {
  sessionToken?: string;
  setSessionToken: (token?: string) => void;
}

const AuthContext = createContext<AuthContextType>({setSessionToken: () => {}});

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [sessionToken, setSessionToken] = useState<string | undefined>(
    undefined
  );
  return (
    <AuthContext.Provider value={{sessionToken, setSessionToken}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
