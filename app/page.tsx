'use client';

import React from 'react';
import ScheduleContainer from './components/ScheduleContainer';
import AuthWrapper from './components/AuthWrapper';

export default function Home() {
  return (
    <AuthWrapper>
      <ScheduleContainer />
    </AuthWrapper>
  );
}