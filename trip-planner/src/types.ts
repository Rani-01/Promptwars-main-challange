import React from 'react';

export type ItineraryItem = {
  id: string;
  time: string;
  title: string;
  description: string;
  tags: string[];
  alert?: string;
  icon: React.ReactNode;
  location?: string;
};

export type ToastMessage = {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  desc: string;
};
