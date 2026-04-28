import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface Settings {
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  announcement: string;
}

const defaultSettings: Settings = {
  address: 'Banjara Hills, Road No 12, Hyderabad, TS 500034',
  phone: '9848098718',
  whatsapp: '9848098718',
  email: 'hello@kprkitchen.com',
  announcement: 'New Arrivals: Professional Cookware Collection!'
};

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'settings'), (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setSettings({
          address: data.address || defaultSettings.address,
          phone: data.phone || defaultSettings.phone,
          whatsapp: data.whatsapp || defaultSettings.whatsapp,
          email: data.email || defaultSettings.email,
          announcement: data.announcement || defaultSettings.announcement
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching settings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
