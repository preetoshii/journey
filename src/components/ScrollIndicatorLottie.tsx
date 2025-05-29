import Lottie from "lottie-react";
import { motion, AnimatePresence } from 'framer-motion';
import animationData from '../assets/scroll-anim.json';
import { useJourneyModeStore } from '../store/useJourneyModeStore';

// Define a basic type for the store state used in this component
interface StoreState {
  mode: 'overview' | 'detail';
  isMoonHovered: boolean;
  // Add other state properties if accessed here, otherwise this is fine
}

const ScrollIndicatorLottie: React.FC = () => {
  const mode = useJourneyModeStore((state: StoreState) => state.mode);
  const isMoonHovered = useJourneyModeStore((state: StoreState) => state.isMoonHovered);

  return (
    <AnimatePresence>
      {mode === 'overview' && !isMoonHovered && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '45%',
            transform: 'translateX(-50%)',
            width: '250px',
            height: '250px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mixBlendMode: 'screen',
          }}
        >
          <Lottie 
            animationData={animationData} 
            loop={true} 
            style={{ width: '100%', height: '100%' }} // Ensure Lottie fills its parent
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollIndicatorLottie; 