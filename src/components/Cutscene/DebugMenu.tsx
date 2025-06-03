import React, { useState } from 'react';
import { useJourneyModeStore } from '../../store/useJourneyModeStore';
import type { Accomplishment } from '../../types/accomplishmentTypes';

const DebugMenu: React.FC = () => {
  const isDebugMode = useJourneyModeStore(s => s.isDebugMode);
  const nodes = useJourneyModeStore(s => s.nodes);
  const triggerCutscene = useJourneyModeStore(s => s.triggerCutscene);

  // Local state for debug accomplishments
  const [expanded, setExpanded] = useState(true);
  const [accomplishments, setAccomplishments] = useState<Accomplishment[]>([
    {
      id: 'debug-1',
      title: 'Debug Accomplishment',
      recap: 'This is a debug accomplishment. Edit me!',
      goals: nodes.filter(n => n.role === 'moon').slice(0, 1).map(moon => ({ goalId: moon.id, innerWorkAmount: 5 })),
    },
  ]);

  // Add a new accomplishment
  const addAccomplishment = () => {
    setAccomplishments(prev => [
      ...prev,
      {
        id: `debug-${Date.now()}`,
        title: 'New Accomplishment',
        recap: '',
        goals: [],
      },
    ]);
  };

  // Remove an accomplishment
  const removeAccomplishment = (id: string) => {
    setAccomplishments(prev => prev.filter(acc => acc.id !== id));
  };

  // Update accomplishment field
  const updateAccomplishment = (id: string, field: keyof Accomplishment, value: any) => {
    setAccomplishments(prev => prev.map(acc => acc.id === id ? { ...acc, [field]: value } : acc));
  };

  // Toggle goal mapping
  const toggleGoal = (accId: string, goalId: string) => {
    setAccomplishments(prev => prev.map(acc => {
      if (acc.id !== accId) return acc;
      const hasGoal = acc.goals.some(g => g.goalId === goalId);
      if (hasGoal) {
        return { ...acc, goals: acc.goals.filter(g => g.goalId !== goalId) };
      } else {
        return { ...acc, goals: [...acc.goals, { goalId, innerWorkAmount: 5 }] };
      }
    }));
  };

  // Update innerWorkAmount for a goal mapping
  const updateInnerWorkAmount = (accId: string, goalId: string, value: number) => {
    setAccomplishments(prev => prev.map(acc => {
      if (acc.id !== accId) return acc;
      return {
        ...acc,
        goals: acc.goals.map(g => g.goalId === goalId ? { ...g, innerWorkAmount: value } : g),
      };
    }));
  };

  // Only show in debug mode
  if (!isDebugMode) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 16,
      left: 16,
      zIndex: 20000,
      background: 'rgba(30,30,30,0.95)',
      color: 'white',
      borderRadius: 10,
      boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
      minWidth: 320,
      maxWidth: 400,
      fontFamily: 'Sohne, sans-serif',
      fontSize: 15,
      padding: expanded ? 18 : 8,
      transition: 'all 0.2s',
      userSelect: 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: expanded ? 12 : 0 }}>
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: 18,
            marginRight: 8,
            cursor: 'pointer',
            outline: 'none',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
          aria-label={expanded ? 'Collapse debug menu' : 'Expand debug menu'}
        >
          ▶
        </button>
        <span style={{ fontWeight: 700, letterSpacing: '0.08em' }}>Debug Menu</span>
        <button
          onClick={addAccomplishment}
          style={{
            marginLeft: 'auto',
            background: '#444',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            padding: '2px 10px',
            fontSize: 15,
            cursor: 'pointer',
          }}
        >+
        </button>
      </div>
      {expanded && (
        <div>
          {accomplishments.map((acc, i) => (
            <div key={acc.id} style={{
              background: 'rgba(255,255,255,0.07)',
              borderRadius: 7,
              marginBottom: 12,
              padding: 10,
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              position: 'relative',
            }}>
              <button
                onClick={() => removeAccomplishment(acc.id)}
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 8,
                  background: 'none',
                  border: 'none',
                  color: '#f77',
                  fontWeight: 700,
                  fontSize: 18,
                  cursor: 'pointer',
                  zIndex: 2,
                }}
                aria-label="Remove accomplishment"
              >×</button>
              <div style={{ marginBottom: 6 }}>
                <input
                  type="text"
                  value={acc.title}
                  onChange={e => updateAccomplishment(acc.id, 'title', e.target.value)}
                  placeholder="Title"
                  style={{
                    width: '100%',
                    fontSize: 15,
                    padding: '2px 6px',
                    borderRadius: 4,
                    border: '1px solid #444',
                    background: '#222',
                    color: 'white',
                    marginBottom: 4,
                  }}
                />
                <textarea
                  value={acc.recap}
                  onChange={e => updateAccomplishment(acc.id, 'recap', e.target.value)}
                  placeholder="Recap"
                  rows={2}
                  style={{
                    width: '100%',
                    fontSize: 14,
                    padding: '2px 6px',
                    borderRadius: 4,
                    border: '1px solid #444',
                    background: '#222',
                    color: 'white',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div style={{ marginBottom: 4, fontWeight: 600 }}>Goals:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {nodes.filter(n => n.role === 'moon').map(moon => {
                  const checked = acc.goals.some(g => g.goalId === moon.id);
                  const innerWorkAmount = acc.goals.find(g => g.goalId === moon.id)?.innerWorkAmount ?? 5;
                  return (
                    <label key={moon.id} style={{ display: 'flex', alignItems: 'center', gap: 3, background: checked ? moon.color : 'transparent', color: checked ? 'white' : '#ccc', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleGoal(acc.id, moon.id)}
                        style={{ marginRight: 3 }}
                      />
                      {moon.title}
                      {checked && (
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={innerWorkAmount}
                          onChange={e => updateInnerWorkAmount(acc.id, moon.id, Number(e.target.value))}
                          style={{ width: 36, marginLeft: 4, fontSize: 13, borderRadius: 3, border: '1px solid #888', background: '#111', color: 'white', padding: '1px 3px' }}
                        />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          <button
            onClick={() => triggerCutscene(accomplishments)}
            style={{
              width: '100%',
              background: 'linear-gradient(90deg, #a43e63 0%, #4a9063 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 7,
              padding: '10px 0',
              fontSize: 16,
              fontWeight: 700,
              marginTop: 8,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              letterSpacing: '0.04em',
            }}
          >Activate Cutscene</button>
        </div>
      )}
    </div>
  );
};

export default DebugMenu; 