'use client';

import { useEffect } from 'react';
import { useNotify } from '@/providers/Notification.provider';

type Props = {
  error?: string;
};

export default function DashboardNotifier({ error }: Props) {
  const notify = useNotify();

  useEffect(() => {
    if (error) {
      notify({ type: 'errorUnexpected', label: error });
    }
  }, [error, notify]);

  return (null);
}