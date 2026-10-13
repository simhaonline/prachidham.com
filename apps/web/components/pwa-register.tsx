'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !(location.protocol === 'https:' || location.hostname === 'localhost')) return;
    void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => { /* Optional offline shell; online use continues. */ });
  }, []);
  return null;
}
