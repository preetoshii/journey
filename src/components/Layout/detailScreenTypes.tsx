import React, { useState } from 'react';
// Removed: import { motion } from 'framer-motion'; // No longer needed here if layout is handled by DetailArea
import type { ZoomNode } from '../../types';
// Removed: import { useRef, useEffect } from 'react'; // Not used in this version of DetailScreenMoments
import styles from './detailScreenTypes.module.css';

// Progress Screen: Shows progress percentage and transformation phase
export const DetailScreenProgress: React.FC<{ goal: ZoomNode }> = ({ goal }) => {
  // Removed old phase logic based on recentActions

  const getPhaseInfo = (progress: number) => {
    if (progress <= 33.33) {
      return {
        name: 'DISCOVERY',
        color: '#A3B6FF', // Blueish
        description: 'exploring and understanding the core of your objective',
      };
    }
    if (progress <= 66.66) {
      return {
        name: 'GROUNDWORK',
        color: '#FFB74D', // Orangeish
        description: 'laying the foundation and building key skills',
      };
    }
    return {
      name: 'INTEGRATION',
      color: '#81C784', // Greenish
      description: 'applying your learnings and solidifying new habits',
    };
  };

  const phaseInfo = getPhaseInfo(goal.progress || 0);

  return (
    <div style={{ width: '100%' }}>
      <p style={{
        fontFamily: "'Sohne Buch', sans-serif", 
        fontSize: '18px',
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 1.8,
        margin: 0,
        maxWidth: '100%',
        textAlign: 'left',
        marginBottom: '1em',
      }}>
        This quest is in the{' '}
        <strong style={{ color: phaseInfo.color, fontWeight: 'bold' }}>
          {phaseInfo.name}
        </strong>
        {' '}phase of The BetterUp Process, focused on {phaseInfo.description}.
      </p>
      <p style={{
        fontFamily: "'Sohne Buch', sans-serif",
        fontSize: '18px',
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 1.8,
        margin: 0,
        maxWidth: '100%',
        textAlign: 'left',
        marginBottom: '1em',
      }}>
        Think of this as a structured program; while you may touch on various aspects, 
        the main emphasis aligns with your current stage. 
      </p>
      <p style={{
        fontFamily: "'Sohne Buch', sans-serif",
        fontSize: '18px',
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 1.8,
        margin: 0,
        maxWidth: '100%',
        textAlign: 'left',
      }}>
        By the end of this cycle, most people feel they've achieved their goal. 
        We'll then synthesize your progress and re-evaluate together.
      </p>
    </div>
  );
};

// Growth Screen: Shows the journey from discovery to action
export const DetailScreenGrowth: React.FC<{ goal: ZoomNode }> = ({ goal }) => {
  const [filter, setFilter] = useState<'last month' | 'last 6 months' | 'all time'>('last month');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Check if the click was on the toggle button itself
        // This prevents the dropdown from closing if the toggle button is clicked again
        // The toggle button's own onClick will handle opening/closing.
        const toggleButton = dropdownRef.current.previousSibling; // Assuming the toggle span is the direct previous sibling
        if (toggleButton && (toggleButton as HTMLElement).contains(event.target as Node)) {
          return;
        }
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const narrative = goal.growthNarrative?.[filter] || goal.subtitle;
  return (
    <div style={{ width: '100%' }}>
      <p style={{
        fontFamily: "'Sohne Buch', sans-serif",
        fontSize: '18px',
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 1.8,
        margin: 0,
        maxWidth: '80%',
      }}>
        {narrative}
      </p>
      <div style={{ height: 32 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 0, marginBottom: 0, minHeight: 32, position: 'relative' }}>
        {/* Placeholder icon: simple upward arrow bar chart */}
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 17V11M8 17V7M13 17V4M18 17V14" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span style={{ fontFamily: "'Sohne Buch', sans-serif", fontSize: 18, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 6 }}>
          Since
          <span
            style={{
              borderBottom: '2px solid rgba(255,255,255,0.7)',
              cursor: 'pointer',
              marginLeft: 6,
              paddingBottom: 1,
              color: '#fff',
              fontWeight: 500,
              position: 'relative',
              userSelect: 'none',
            }}
            onClick={() => setDropdownOpen((v) => !v)}
          >
            {filter}
            <svg style={{ marginLeft: 6, verticalAlign: 'middle' }} width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2L6 6L10 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {dropdownOpen && (
              <div ref={dropdownRef} style={{
                position: 'absolute',
                left: 0,
                top: 28,
                background: '#181818',
                border: '1px solid #333',
                borderRadius: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                zIndex: 10,
                minWidth: 140,
                padding: '6px 0',
              }}>
                {['last month', 'last 6 months', 'all time'].map(option => (
                  <div
                    key={option}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilter(option as any);
                      setDropdownOpen(false);
                    }}
                    style={{
                      padding: '8px 18px',
                      fontFamily: "'Sohne Buch', sans-serif",
                      fontSize: 16,
                      color: option === filter ? '#fff' : 'rgba(255,255,255,0.7)',
                      background: option === filter ? '#222' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      textTransform: 'lowercase',
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </span>
        </span>
      </div>
    </div>
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
  const actions = [...(goal.recentActions || [])].sort((a, b) => {
    // Parse as dates, fallback to string comparison if needed
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });
  const [showAll, setShowAll] = useState(false);

  if (actions.length === 0) {
    return (
      <p style={{
        fontFamily: "'Sohne Buch', sans-serif", 
        fontSize: '18px',
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 1.8,
        margin: 0,
        maxWidth: '80%',
      }}>
        No specific steps recorded for this goal yet.
      </p>
    );
  }

  const actionsToShow = showAll ? actions : actions.slice(0, 3);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {actionsToShow.map((action, index) => (
        <div
          key={index}
          className={styles['step-subcard']}
          style={{
            border: '1.5px solid #444',
            borderRadius: 24,
            padding: '32px 36px',
            minHeight: 90,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 36,
            marginBottom: 0,
          }}
        >
          {/* Star SVG */}
          <svg width={16} height={16} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <path d="M10.076 0.82951C10.6762 0.0381659 11.866 0.0381661 12.4662 0.82951L16.191 5.74027C16.2736 5.84917 16.3707 5.94628 16.4796 6.02888L21.3904 9.75372C22.1817 10.354 22.1817 11.5437 21.3904 12.1439L16.4796 15.8688C16.3707 15.9514 16.2736 16.0485 16.191 16.1574L12.4662 21.0681C11.866 21.8595 10.6762 21.8595 10.076 21.0681L6.35115 16.1574C6.26854 16.0485 6.17144 15.9514 6.06254 15.8688L1.15178 12.1439C0.360432 11.5437 0.360432 10.354 1.15178 9.75372L6.06254 6.02888C6.17144 5.94628 6.26854 5.84917 6.35115 5.74027L10.076 0.82951Z" fill="#DECBA4"/>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{
              fontFamily: "'Sohne Buch', sans-serif",
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 18,
              color: 'rgba(255,255,255,0.45)',
              marginBottom: 5,
              letterSpacing: 0.2,
            }}>{action.date}</span>
            <span style={{
              fontFamily: "'Sohne Buch', sans-serif",
              fontSize: 20,
              color: 'rgba(255,255,255,0.92)',
              lineHeight: 1.7,
              fontWeight: 400,
              margin: 0,
              textAlign: 'left',
            }}>{action.title}</span>
          </div>
        </div>
      ))}
      {actions.length > 3 && !showAll && (
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#A3B6FF',
            fontFamily: "'Sohne Buch', sans-serif",
            fontSize: 18,
            margin: '10px auto 0 auto',
            cursor: 'pointer',
            textDecoration: 'none',
            letterSpacing: 0.1,
            display: 'block',
          }}
          onClick={() => setShowAll(true)}
        >
          SHOW MORE
        </button>
      )}
    </div>
  );
};

// Config array for all detail screen types
export const detailScreenTypes = [
  {
    key: 'progress',
    label: 'The BetterUp Process',
    component: DetailScreenProgress,
  },
  {
    key: 'growth',
    label: "How you've grown",
    component: DetailScreenGrowth,
  },
  {
    key: 'moments',
    label: 'Accomplishments',
    component: DetailScreenMoments,
  },
]; 