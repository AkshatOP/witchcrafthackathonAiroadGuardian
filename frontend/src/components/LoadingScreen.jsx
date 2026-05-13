import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-[400] flex flex-col items-center justify-center gap-6"
      style={{ background: '#0a0f1e' }}
    >
      {/* Radar pulse */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="radar-ring absolute inset-0 rounded-full"
            style={{
              border: '2px solid #00d4ff',
              opacity: 0.8 - i * 0.2,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
        {/* Center dot */}
        <div
          className="w-8 h-8 rounded-full"
          style={{ background: '#00d4ff', boxShadow: '0 0 16px #00d4ff' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h1
          className="text-accent-cyan font-bold text-xl mb-1"
          style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em' }}
        >
          AI ROAD GUARDIAN
        </h1>
        <p className="text-text-muted text-sm">Loading road data...</p>
      </motion.div>
    </div>
  );
}
