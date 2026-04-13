"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import TemporalCommandCenter from '../../components/dashboard/views/TemporalCommandCenter';

export default function DashboardOverview() {
  const router = useRouter();

  return (
    <TemporalCommandCenter onCopilotClick={() => router.push('/dashboard/copilot')} />
  );
}
