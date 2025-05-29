import React from 'react';
import { motion } from 'framer-motion';
import type { ZoomNode } from '../../types';

// Progress Screen: Shows progress percentage and transformation phase
export const DetailScreenProgress: React.FC<{ goal: ZoomNode }> = ({ goal }) => {
  const recentActions = goal.recentActions || [];
  const discoveryActions = recentActions.filter((a: string) => a.toLowerCase().includes('uncovered') || a.toLowerCase().includes('realized') || a.toLowerCase().includes('noticed'));
  const practiceActions = recentActions.filter((a: string) => a.toLowerCase().includes('practiced') || a.toLowerCase().includes('tried') || a.toLowerCase().includes('set'));
  const actionActions = recentActions.filter((a: string) => a.toLowerCase().includes('volunteered') || a.toLowerCase().includes('put') || a.toLowerCase().includes('held'));

  // Determine current phase based on action distribution
  const getCurrentPhase = () => {
    if (actionActions.length > 0) return 'Action';
    if (practiceActions.length > 0) return 'Practice';
    return 'Discovery';
  };

  const currentPhase = getCurrentPhase();

  const progressText = `You are currently ${goal.progress}% towards ${goal.title.toLowerCase()}, focusing on the ${currentPhase} phase.`;

  return (
    <p style={{
      fontFamily: "'Sohne Buch', sans-serif", 
      fontSize: '18px',
      color: 'rgba(255, 255, 255, 0.8)',
      lineHeight: 1.8,
      margin: 0,
      maxWidth: '80%',
    }}>
      {progressText}
    </p>
  );
};

// Growth Screen: Shows the journey from discovery to action
export const DetailScreenGrowth: React.FC<{ goal: ZoomNode }> = ({ goal }) => {
  // const recentActions = goal.recentActions || [];
  // const discoveryActions = recentActions.filter(a => a.toLowerCase().includes('uncovered') || a.toLowerCase().includes('realized') || a.toLowerCase().includes('noticed'));
  // const practiceActions = recentActions.filter(a => a.toLowerCase().includes('practiced') || a.toLowerCase().includes('tried') || a.toLowerCase().includes('set'));
  // const actionActions = recentActions.filter(a => a.toLowerCase().includes('volunteered') || a.toLowerCase().includes('put') || a.toLowerCase().includes('held'));

  // TEMPORARILY USING SUBTITLE FOR GROWTH - AWAITING USER FEEDBACK
  return (
    <p style={{
      fontFamily: "'Sohne Buch', sans-serif", // Assuming 'Sohne Buch'
      fontSize: '18px',
      color: 'rgba(255, 255, 255, 0.8)',
      lineHeight: 1.8,
      margin: 0, // Remove default paragraph margin
      maxWidth: '80%', // Prevent text from becoming too wide
    }}>
      {/* Placeholder: Using goal.subtitle until data strategy for growth narrative is confirmed */}
      {goal.subtitle} 
    </p>
  );
};

// Connection Screen: Shows how this goal connects to the North Star
export const DetailScreenConnection: React.FC<{ goal: ZoomNode }> = ({ goal }) => {
  return (
    <p style={{
      fontFamily: "'Sohne Buch', sans-serif", // Assuming 'Sohne Buch'
      fontSize: '18px',
      color: 'rgba(255, 255, 255, 0.8)',
      lineHeight: 1.8,
      margin: 0, // Remove default paragraph margin
      maxWidth: '80%', // Prevent text from becoming too wide
    }}>
      {goal.subtitle}
    </p>
  );
};

// Moments Screen: Shows key moments and achievements
export const DetailScreenMoments: React.FC<{ goal: ZoomNode }> = ({ goal }) => {
  const recentActions = goal.recentActions || [];

  let momentsText = "Key steps on your journey include: " + recentActions.join(". ");
  // Add a period at the end if there are actions and the joined string doesn't end with one.
  if (recentActions.length > 0 && !momentsText.endsWith('.')) {
    momentsText += '.';
  }
  if (recentActions.length === 0) {
    momentsText = "No specific moments recorded for this goal yet."
  }

  return (
    <p style={{
      fontFamily: "'Sohne Buch', sans-serif", 
      fontSize: '18px',
      color: 'rgba(255, 255, 255, 0.8)',
      lineHeight: 1.8,
      margin: 0,
      maxWidth: '80%',
    }}>
      {momentsText}
    </p>
  );
};

// Config array for all detail screen types
export const detailScreenTypes = [
  {
    key: 'progress',
    label: 'Progress',
    component: DetailScreenProgress,
  },
  {
    key: 'growth',
    label: 'Growth',
    component: DetailScreenGrowth,
  },
  {
    key: 'moments',
    label: 'Moments',
    component: DetailScreenMoments,
  },
]; 