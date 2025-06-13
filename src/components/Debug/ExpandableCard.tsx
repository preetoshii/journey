import React, { useState } from 'react';
import styles from './DebugSidebar.module.css';

interface ExpandableCardProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

/**
 * @component ExpandableCard
 * @description A simple, reusable UI component that displays a card with a header.
 * The header can be clicked to expand or collapse the card's content.
 *
 * @param {string} title - The text to display in the card's header.
 * @param {boolean} [defaultOpen=false] - Whether the card should be open by default.
 * @param {React.ReactNode} children - The content to be displayed inside the card when it is open.
 * @param {React.ReactNode} [headerAction] - An optional React node (e.g., a button) to be
 *   displayed on the right side of the header.
 */
const ExpandableCard: React.FC<ExpandableCardProps> = ({ title, defaultOpen = false, children, headerAction }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => setOpen((v) => !v)}
          className={styles.cardHeader}
          aria-expanded={open}
          style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', padding: 0, color: 'inherit', font: 'inherit', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <span>{title}</span>
          {headerAction && <div style={{ marginLeft: 16 }}>{headerAction}</div>}
          <span style={{ marginLeft: 'auto' }} className={open ? `${styles.chevron} ${styles['chevron--open']}` : `${styles.chevron} ${styles['chevron--closed']}`}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 7L9 10L12 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </button>
      </div>
      <div className={open ? styles.cardContent : `${styles.cardContent} ${styles['cardContent--collapsed']}`}>
        {children}
      </div>
    </div>
  );
};

export default ExpandableCard; 