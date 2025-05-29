import React from 'react';
import { useJourneyModeStore } from '../store/useJourneyModeStore';
import { detailScreenTypes } from '../detailScreenTypes';
import { nodes as moonNodes } from './ZoomWorld/MoonVisualizer';
import type { ZoomNode } from '../types';

const DetailArea: React.FC = () => {
  const mode = useJourneyModeStore((s) => s.mode);
  return (
    <div
      style={{
        height: '100vh',
        marginTop: '100vh',
        display: 'flex',
        flexDirection: 'row',
        color: 'white',
        fontSize: 32,
        position: 'relative',
      }}
    >
      {/* Left half (reserved for moon focus column) */}
      <div style={{ width: '50vw', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
      {/* Right half (content column) */}
      <div style={{ width: '50vw', height: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 120 }}>
        <div style={{ width: 600, display: 'flex', flexDirection: 'column', gap: 64 }}>
          {moonNodes.filter((g: ZoomNode) => g.role === 'moon').map((goal: ZoomNode) => (
            <div key={goal.id} style={{ marginBottom: 64 }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 18, letterSpacing: '0.03em' }}>{goal.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
                {detailScreenTypes.map((screen) => (
                  <div key={screen.key} style={{ border: '1px solid #333', borderRadius: 16, background: '#181a1e', marginBottom: 24 }}>
                    <div style={{ padding: '16px 32px', fontSize: 22, fontWeight: 600, color: '#aef', borderBottom: '1px solid #222' }}>{screen.label}</div>
                    <screen.component goal={goal} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailArea; 