import OverviewArea from './components/OverviewArea';
import DetailArea from './components/DetailArea';
import BackgroundLayer from './components/BackgroundLayer';

function App() {
  return (
    <>
      <BackgroundLayer />
      <div style={{ width: '100vw', height: '100vh', overflowY: 'auto', overflowX: 'hidden', position: 'relative', zIndex: 1 }}>
        <OverviewArea />
        <DetailArea />
      </div>
    </>
  );
}

export default App;
