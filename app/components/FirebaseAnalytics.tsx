'use client';

import { useEffect } from 'react';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getFirebasePublicConfig,
  isFirebasePublicConfigComplete,
} from '@/lib/firebase-public-config';

export default function FirebaseAnalytics() {
  useEffect(() => {
    const config = getFirebasePublicConfig();
    if (!isFirebasePublicConfigComplete(config)) return;

    const app = getApps().length ? getApp() : initializeApp(config);
    void isSupported().then((supported) => {
      if (supported) getAnalytics(app);
    });
  }, []);

  return null;
}
