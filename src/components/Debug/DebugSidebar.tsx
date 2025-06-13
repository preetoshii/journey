import React, { useState } from 'react';
import { useJourneyModeStore } from '../../store/useJourneyModeStore';
import ExpandableCard from './ExpandableCard';
import styles from './DebugSidebar.module.css';

// Dummy data for accomplishments
const defaultAccomplishments = [
  {
    id: 'accomplishment1',
    title: 'Mastered Mindfulness',
    recap: 'After weeks of practice, you can now stay present and focused for extended periods, significantly reducing daily stress.',
    goals: [
      { goalId: 'moon1', innerWorkAmount: 10 },
      { goalId: 'moon2', innerWorkAmount: 5 },
    ],
  },
  {
    id: 'accomplishment2',
    title: 'Effective Communication Breakthrough',
    recap: 'You successfully navigated a series of tough conversations, leading to better team collaboration and understanding.',
    goals: [{ goalId: 'moon3', innerWorkAmount: 8 }],
  },
  {
    id: 'accomplishment3',
    title: 'Project Phoenix Completed',
    recap: 'Successfully launched Project Phoenix ahead of schedule, showcasing strong leadership and execution.',
    goals: [{ goalId: 'moon1', innerWorkAmount: 7 }],
  },
];

/**
 * A safe version of JSON.stringify that handles circular references, functions,
 * and DOM elements by replacing them with a placeholder string. This is useful
 * for displaying the raw Zustand state, which may contain non-serializable values.
 */
function safeStringify(obj: any) {
  return JSON.stringify(obj, (key, value) => {
    if (
      typeof value === 'function' ||
      (typeof window !== 'undefined' && value instanceof window.HTMLElement)
    ) {
      return '[Non-Serializable]';
    }
    return value;
  }, 2);
}

/**
 * @component DebugSidebar
 * @description A slide-out sidebar component that provides a suite of debugging and testing tools
 * for developers. It is toggled by the gear icon in the main App.
 *
 * It is divided into three main sections, each within an `ExpandableCard`:
 *
 * 1.  **State Inspection:** Displays a live, formatted view of the entire Zustand store's state.
 *     It uses a `safeStringify` function to prevent crashes from non-serializable values like
 *     functions or DOM elements in the state.
 *
 * 2.  **Cutscene Control:** This is the most complex section. It allows for the dynamic creation,
 *     editing, and triggering of "accomplishment" data.
 *     - It uses local `useState` to manage a list of accomplishment objects.
 *     - Developers can add/remove accomplishments, edit their titles/recaps, and associate them
 *       with specific moons and "inner work" amounts.
 *     - The "Fire" button triggers the `triggerCutscene` action in the global store with the
 *       locally constructed accomplishment data.
 *
 * 3.  **Experiment Toggles:** Provides checkboxes to toggle experimental or optional features
 *     like "Scroll Snap" and "Click-to-Center," allowing for easy A/B testing during development.
 */
const DebugSidebar: React.FC = () => {
  const isOpen = useJourneyModeStore((s) => s.isDebugSidebarOpen);
  const state = useJourneyModeStore();
  const triggerCutscene = useJourneyModeStore((s) => s.triggerCutscene);
  const isScrollSnapEnabled = useJourneyModeStore((s) => s.isScrollSnapEnabled);
  const isClickToCenterEnabled = useJourneyModeStore((s) => s.isClickToCenterEnabled);
  const toggleScrollSnap = useJourneyModeStore((s) => s.toggleScrollSnap);
  const toggleClickToCenter = useJourneyModeStore((s) => s.toggleClickToCenter);
  const nodes = useJourneyModeStore((s) => s.nodes);
  const moonNodes = nodes.filter((n) => n.role === 'moon');
  const closeDebugSidebar = useJourneyModeStore((s) => s.closeDebugSidebar);

  // Local state for accomplishments
  const [accomplishments, setAccomplishments] = useState(defaultAccomplishments);

  // Handler for Quick Fire
  const handleQuickFire = () => {
    triggerCutscene(accomplishments);
    closeDebugSidebar();
  };

  // Handlers for editing accomplishments
  const handleAccChange = (idx: number, field: string, value: string) => {
    setAccomplishments(accs => {
      const updated = [...accs];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };
  const handleGoalChange = (accIdx: number, goalIdx: number, field: string, value: string | number) => {
    setAccomplishments(accs => {
      const updated = [...accs];
      const goals = [...updated[accIdx].goals];
      goals[goalIdx] = { ...goals[goalIdx], [field]: value };
      updated[accIdx] = { ...updated[accIdx], goals };
      return updated;
    });
  };

  // Handler to add a new accomplishment
  const handleAddAccomplishment = () => {
    setAccomplishments(accs => [
      ...accs,
      {
        id: `accomplishment${Date.now()}`,
        title: '',
        recap: '',
        goals: [{ goalId: '', innerWorkAmount: 1 }],
      },
    ]);
  };

  // Handler to remove an accomplishment
  const handleRemoveAccomplishment = (idx: number) => {
    setAccomplishments(accs => accs.filter((_, i) => i !== idx));
  };

  return (
    <aside
      className={isOpen ? styles.debugSidebar : `${styles.debugSidebar} ${styles['debugSidebar--hidden']}`}
    >
      <h2 className={styles.debugTitle}>Debug Menu</h2>
      <ExpandableCard title="State Inspection" defaultOpen={false}>
        <pre style={{
          background: '#23293A',
          color: '#fff',
          borderRadius: 8,
          padding: 12,
          fontSize: 13,
          maxHeight: 180,
          overflow: 'auto',
        }}>{safeStringify(state)}</pre>
      </ExpandableCard>
      <ExpandableCard
        title="Cutscene"
        headerAction={
          <button
            onClick={e => { e.stopPropagation(); handleQuickFire(); }}
            style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: 'none', letterSpacing: 0.5 }}
          >
            Fire
          </button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {accomplishments.map((acc, accIdx) => (
            <div key={acc.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '32px 32px', marginBottom: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', position: 'relative' }}>
              <button
                onClick={() => handleRemoveAccomplishment(accIdx)}
                style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: '#aaa', fontSize: 16, cursor: 'pointer', padding: 2, borderRadius: 4, transition: 'background 0.15s' }}
                title="Remove accomplishment"
              >
                ×
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600, marginBottom: 1, letterSpacing: 0.2 }}>Goal Title</div>
                <input
                  type="text"
                  value={acc.title}
                  onChange={e => handleAccChange(accIdx, 'title', e.target.value)}
                  style={{ fontFamily: 'Sohne, sans-serif', fontSize: 13, fontWeight: 400, padding: '7px 10px', borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.03)', color: '#fff', marginBottom: 0 }}
                />
                <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600, marginBottom: 1, marginTop: 16, letterSpacing: 0.2 }}>Recap</div>
                <textarea
                  value={acc.recap}
                  onChange={e => handleAccChange(accIdx, 'recap', e.target.value)}
                  style={{ fontFamily: 'Sohne, sans-serif', fontSize: 13, fontWeight: 400, padding: '7px 10px', borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.03)', color: '#fff', resize: 'vertical', minHeight: 40, overflow: 'hidden', marginBottom: 0 }}
                />
                <div style={{ marginTop: 16, marginBottom: 1, color: '#aaa', fontSize: 11, fontWeight: 600 }}>Tracks it ties to</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {moonNodes.map((moon) => {
                    const goalIdx = acc.goals.findIndex((g) => g.goalId === moon.id);
                    const isChecked = goalIdx !== -1;
                    return (
                      <div key={moon.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#fff', fontWeight: 500, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => {
                              setAccomplishments(accs => {
                                const updated = [...accs];
                                const goals = [...updated[accIdx].goals];
                                if (e.target.checked) {
                                  // Add this moon as a goal
                                  goals.push({ goalId: moon.id, innerWorkAmount: 1 });
                                } else {
                                  // Remove this moon from goals
                                  return updated.map((a, i) => i === accIdx ? { ...a, goals: goals.filter(g => g.goalId !== moon.id) } : a);
                                }
                                updated[accIdx] = { ...updated[accIdx], goals };
                                return updated;
                              });
                            }}
                          />
                          {moon.title}
                        </label>
                        {isChecked && (
                          <input
                            type="number"
                            value={acc.goals[goalIdx].innerWorkAmount}
                            min={1}
                            max={20}
                            onChange={e => handleGoalChange(accIdx, goalIdx, 'innerWorkAmount', Number(e.target.value))}
                            style={{ fontFamily: 'Sohne, sans-serif', fontSize: 13, fontWeight: 400, padding: '6px 8px', borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.03)', color: '#fff', width: 70 }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={handleAddAccomplishment}
            style={{ marginTop: 8, background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontWeight: 500, fontSize: 14, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
          >
            + Add Goal
          </button>
        </div>
      </ExpandableCard>
      <ExpandableCard title="Experiment Toggles">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, color: '#fff', fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={isScrollSnapEnabled}
              onChange={toggleScrollSnap}
              style={{ accentColor: '#4B9BFF', width: 20, height: 20 }}
            />
            Scroll Snap
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, color: '#fff', fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={isClickToCenterEnabled}
              onChange={toggleClickToCenter}
              style={{ accentColor: '#4B9BFF', width: 20, height: 20 }}
            />
            Click-to-Center
          </label>
        </div>
      </ExpandableCard>
    </aside>
  );
};

export default DebugSidebar; 