import React from 'react';
import { motion } from 'framer-motion';
import type { ZoomNode } from './types';

// Progress Screen: Shows progress percentage and transformation phase
export const DetailScreenProgress: React.FC<{ goal: ZoomNode }> = ({ goal }) => {
  const recentActions = goal.recentActions || [];
  const discoveryActions = recentActions.filter(a => a.toLowerCase().includes('uncovered') || a.toLowerCase().includes('realized') || a.toLowerCase().includes('noticed'));
  const practiceActions = recentActions.filter(a => a.toLowerCase().includes('practiced') || a.toLowerCase().includes('tried') || a.toLowerCase().includes('set'));
  const actionActions = recentActions.filter(a => a.toLowerCase().includes('volunteered') || a.toLowerCase().includes('put') || a.toLowerCase().includes('held'));

  // Determine current phase based on action distribution
  const getCurrentPhase = () => {
    if (actionActions.length > 0) return 'Action';
    if (practiceActions.length > 0) return 'Practice';
    return 'Discovery';
  };

  const currentPhase = getCurrentPhase();

  return (
    <div style={{ padding: 48, background: 'rgba(80,200,120,0.08)', borderRadius: 24, minHeight: 400 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 48 }}>
        <div style={{ 
          width: 120, 
          height: 120, 
          borderRadius: '50%', 
          background: `conic-gradient(${goal.color} ${goal.progress}%, rgba(255,255,255,0.1) ${goal.progress}%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          fontWeight: 600,
          color: '#fff'
        }}>
          {goal.progress}%
        </div>
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 20, color: '#fff' }}>Current Phase: {currentPhase}</h3>
          <p style={{ margin: 0, color: '#aaa', fontSize: 16 }}>
            {currentPhase === 'Discovery' && 'Building awareness and understanding'}
            {currentPhase === 'Practice' && 'Developing skills and confidence'}
            {currentPhase === 'Action' && 'Applying skills in real situations'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div>
          <h4 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#fff' }}>Phase Progress</h4>
          <div style={{ 
            display: 'flex', 
            gap: 16,
            padding: 24,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 16
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ 
                height: 4, 
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 2,
                marginBottom: 8
              }}>
                <div style={{ 
                  width: `${(discoveryActions.length / recentActions.length) * 100}%`,
                  height: '100%',
                  background: goal.color,
                  borderRadius: 2
                }} />
              </div>
              <p style={{ margin: 0, color: '#ddd', fontSize: 14 }}>Discovery</p>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                height: 4, 
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 2,
                marginBottom: 8
              }}>
                <div style={{ 
                  width: `${(practiceActions.length / recentActions.length) * 100}%`,
                  height: '100%',
                  background: goal.color,
                  borderRadius: 2
                }} />
              </div>
              <p style={{ margin: 0, color: '#ddd', fontSize: 14 }}>Practice</p>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                height: 4, 
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 2,
                marginBottom: 8
              }}>
                <div style={{ 
                  width: `${(actionActions.length / recentActions.length) * 100}%`,
                  height: '100%',
                  background: goal.color,
                  borderRadius: 2
                }} />
              </div>
              <p style={{ margin: 0, color: '#ddd', fontSize: 14 }}>Action</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Growth Screen: Shows the journey from discovery to action
export const DetailScreenGrowth: React.FC<{ goal: ZoomNode }> = ({ goal }) => {
  const recentActions = goal.recentActions || [];
  const discoveryActions = recentActions.filter(a => a.toLowerCase().includes('uncovered') || a.toLowerCase().includes('realized') || a.toLowerCase().includes('noticed'));
  const practiceActions = recentActions.filter(a => a.toLowerCase().includes('practiced') || a.toLowerCase().includes('tried') || a.toLowerCase().includes('set'));
  const actionActions = recentActions.filter(a => a.toLowerCase().includes('volunteered') || a.toLowerCase().includes('put') || a.toLowerCase().includes('held'));

  return (
    <div style={{ padding: 48, background: 'rgba(120,120,200,0.08)', borderRadius: 24, minHeight: 400 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            color: '#fff'
          }}>
            1
          </div>
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 20, color: '#fff' }}>Discovery Phase</h3>
            <p style={{ margin: 0, color: '#aaa', fontSize: 16 }}>
              {discoveryActions[0] || 'Beginning to understand the challenge and its impact'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            color: '#fff'
          }}>
            2
          </div>
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 20, color: '#fff' }}>Practice Phase</h3>
            <p style={{ margin: 0, color: '#aaa', fontSize: 16 }}>
              {practiceActions[0] || 'Building skills and confidence through practice'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            color: '#fff'
          }}>
            3
          </div>
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 20, color: '#fff' }}>Action Phase</h3>
            <p style={{ margin: 0, color: '#aaa', fontSize: 16 }}>
              {actionActions[0] || 'Applying skills in real situations'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Connection Screen: Shows how this goal connects to the North Star
export const DetailScreenConnection: React.FC<{ goal: ZoomNode }> = ({ goal }) => {
  return (
    <div style={{ padding: 48, background: 'rgba(200,120,120,0.08)', borderRadius: 24, minHeight: 400 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 20, color: '#fff' }}>Connection to North Star</h3>
          <p style={{ margin: 0, color: '#ddd', fontSize: 16, lineHeight: 1.6 }}>
            This quest contributes to your overall growth by {goal.subtitle.toLowerCase()}
          </p>
        </div>
      </div>
    </div>
  );
};

// Moments Screen: Shows key moments and achievements
export const DetailScreenMoments: React.FC<{ goal: ZoomNode }> = ({ goal }) => {
  const recentActions = goal.recentActions || [];
  const discoveryMoments = recentActions.filter(a => a.toLowerCase().includes('uncovered') || a.toLowerCase().includes('realized') || a.toLowerCase().includes('noticed'));
  const practiceMoments = recentActions.filter(a => a.toLowerCase().includes('practiced') || a.toLowerCase().includes('tried') || a.toLowerCase().includes('set'));
  const actionMoments = recentActions.filter(a => a.toLowerCase().includes('volunteered') || a.toLowerCase().includes('put') || a.toLowerCase().includes('held'));

  return (
    <div style={{ padding: 48, background: 'rgba(120,200,200,0.08)', borderRadius: 24, minHeight: 400 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 20, color: '#fff' }}>Key Moments</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {discoveryMoments.map((moment, idx) => (
              <motion.div
                key={`discovery-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={{ 
                  padding: 20, 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: 16,
                  border: `1px solid ${goal.color}40`
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12,
                  marginBottom: 8
                }}>
                  <div style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    background: goal.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    color: '#fff'
                  }}>
                    {idx + 1}
                  </div>
                  <h4 style={{ margin: 0, fontSize: 18, color: '#fff' }}>Discovery</h4>
                </div>
                <p style={{ margin: 0, color: '#ddd', fontSize: 15 }}>{moment}</p>
              </motion.div>
            ))}

            {practiceMoments.map((moment, idx) => (
              <motion.div
                key={`practice-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={{ 
                  padding: 20, 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: 16,
                  border: `1px solid ${goal.color}40`
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12,
                  marginBottom: 8
                }}>
                  <div style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    color: '#fff'
                  }}>
                    {idx + 1}
                  </div>
                  <h4 style={{ margin: 0, fontSize: 18, color: '#fff' }}>Practice</h4>
                </div>
                <p style={{ margin: 0, color: '#ddd', fontSize: 15 }}>{moment}</p>
              </motion.div>
            ))}

            {actionMoments.map((moment, idx) => (
              <motion.div
                key={`action-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={{ 
                  padding: 20, 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: 16,
                  border: `1px solid ${goal.color}40`
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12,
                  marginBottom: 8
                }}>
                  <div style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    color: '#fff'
                  }}>
                    {idx + 1}
                  </div>
                  <h4 style={{ margin: 0, fontSize: 18, color: '#fff' }}>Action</h4>
                </div>
                <p style={{ margin: 0, color: '#ddd', fontSize: 15 }}>{moment}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
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
    key: 'connection',
    label: 'Connection',
    component: DetailScreenConnection,
  },
  {
    key: 'moments',
    label: 'Moments',
    component: DetailScreenMoments,
  },
]; 