import React, { useState, useEffect } from 'react';
import {
  Activity,
  ArrowLeft,
  Award,
  BarChart3,
  Brain,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Crown,
  Dumbbell,
  Flame,
  Gauge,
  Heart,
  Info,
  Layers,
  MessageCircle,
  MoreHorizontal,
  NotebookText,
  PlayCircle,
  Repeat,
  Send,
  Settings,
  Share2,
  Sparkles,
  Target,
  Timer,
  Trophy,
  User,
  UserCircle,
  Waves,
  X,
  Zap
} from 'lucide-react';

export default function WorkoutGenerator() {
  const [settings, setSettings] = useState({
    goal: 'build-muscle',
    experience: 'intermediate',
    equipment: 'full-gym',
    focus: 'chest-back',
    duration: '45m',
    workoutStyle: 'paired',
    conditioningType: 'cardio'
  });
  
  const [workout, setWorkout] = useState(null);
  const [showWorkout, setShowWorkout] = useState(false);
  const [showTempoInfo, setShowTempoInfo] = useState(null);
  const [showExerciseDemo, setShowExerciseDemo] = useState(null);
  const [isWorkoutSessionActive, setIsWorkoutSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [setLogs, setSetLogs] = useState({});
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(null);
  const [showFinishSummary, setShowFinishSummary] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [activeTab, setActiveTab] = useState('workout');
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [activeSessionSummary, setActiveSessionSummary] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('Ask ForgeAI Coach for a training adjustment, weakness fix, or progression idea. Your response will appear here.');
  const [aiMode, setAiMode] = useState('demo');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [proStep, setProStep] = useState(1);
  const [proConfig, setProConfig] = useState({
    sport: null,
    schedule: null,
    durationWeeks: null,
    overloadCurve: null,
    goals: {
      squat: { current: 150, target: null },
      bench: { current: 150, target: null },
      deadlift: { current: 200, target: null }
    }
  });
  const [proGeneratedProgram, setProGeneratedProgram] = useState(null);
  const [proUnlocked, setProUnlocked] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);

  useEffect(() => {
    if (!isWorkoutSessionActive || !sessionStartTime) return undefined;

    const updateElapsed = () => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - sessionStartTime) / 1000)));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [isWorkoutSessionActive, sessionStartTime]);

  // Plyometric exercises for Power workouts (always first, max 1 per workout)
  const plyometricExercises = [
    'Box Jumps',
    'Depth to Box Jumps',
    'Stiff-Leg Depth Jump',
    'Pogo Jumps',
    'Seated Box Jumps',
    'Hurdles Jumps',
    'Hurdle Jump to Box',
    'Squat Jumps',
    'Medicine Ball Slam',
    'Medicine Ball Chest Pass'
  ];

  // Build Muscle Tempos - randomly assigned regardless of set/rep scheme
  const buildMuscleTempos = ['4010', '3010', '20X0', '5010', '31X0', '3210'];
  const getRandomBuildMuscleTempo = () => buildMuscleTempos[Math.floor(Math.random() * buildMuscleTempos.length)];
  
  const buildMuscleTempoExplanations = {
    '4010': 'Hypertrophy (Eccentric focused)',
    '3010': 'Heavy Hypertrophy (Concentric focused)',
    '20X0': 'Heavy Hypertrophy (Concentric focused)',
    '5010': 'Hypertrophy (Eccentric focused)',
    '31X0': 'Paused contraction (Concentric focused)',
    '3210': 'Paused contraction (Isometric focused)',
    '1010': 'Controlled tempo (DB Lunges specific)'
  };

  // Build Muscle Set/Rep Schemes
  // Tempo guide: 4010/5010 = Eccentric/hypertrophy, 30X0 = Strength+power, 20X0 = Pure explosiveness
  // Advanced only: 6010, 8010, 10010 = Extended eccentric for hypertrophy
  const buildMuscleSchemes = {
    'classic-hypertrophy': {
      name: 'Classic Hypertrophy',
      setsReps: '3-5 × 8-12',
      tempo: 'random',
      rest: '60-90 sec',
      type: 'secondary',
      description: 'Standard hypertrophy range, great for all exercises'
    },
    'heavy-hypertrophy': {
      name: 'Heavy Hypertrophy',
      setsReps: '4-6 × 5-8',
      tempo: 'random',
      rest: '90-120 sec',
      type: 'secondary',
      description: 'Heavier loading for strength-focused muscle building'
    },
    'dropsets': {
      name: 'Dropsets (4×8-12)',
      setsReps: '4 × 8-12 (drop)',
      tempo: 'random',
      rest: '60 sec',
      type: 'main',
      description: 'Reduce weight each set to extend time under tension',
      example: 'Set 1: 145×12, Set 2: 140×10, Set 3: 135×11, Set 4: 130×9'
    },
    'gvt': {
      name: 'German Volume Training',
      setsReps: '10 × 10',
      tempo: 'random',
      rest: '75 sec',
      type: 'main',
      description: '100 total reps per exercise - extreme volume',
      example: 'A1. Incline DB Press 10×10, A2. Chin-Up 10×10'
    },
    'gvt-advanced': {
      name: 'Advanced GVT',
      setsReps: '10 × 5',
      tempo: '5010',
      rest: '75 sec',
      type: 'main',
      description: 'Heavier variation of GVT for advanced lifters',
      advancedOnly: true
    },
    'post-exhaustion': {
      name: 'Post Exhaustion Method',
      setsReps: '4×4-6 + 4×6-8',
      tempo: 'random',
      rest: '10s / 180s',
      type: 'main',
      description: 'Compound exercise followed immediately by isolation',
      example: 'A1. Close-Grip Chin-up 4×4-6 (rest 10s), A2. Incline Curl 4×6-8 (rest 180s)'
    },
    'wave-loading': {
      name: 'Wave Loading',
      setsReps: '3 × 10/8/6',
      tempo: 'random',
      rest: '90 sec',
      type: 'main',
      description: 'Progressive overload within the session'
    },
    'wave-pump': {
      name: 'Wave + Pump',
      setsReps: '4 × 10/8/6/15',
      tempo: 'random',
      rest: '90 sec',
      type: 'main',
      description: 'Wave loading followed by high-rep pump set',
      example: 'Set 1: 10 reps, Set 2: 8 reps (heavier), Set 3: 6 reps (heaviest), Set 4: 15 reps (light pump)'
    },
    'eight-by-eight': {
      name: '8×8',
      setsReps: '8 × 8',
      tempo: 'random',
      rest: '60-90 sec',
      type: 'main',
      description: 'High volume, great for muscle hypertrophy, endurance, and work capacity'
    },
    'cluster-hypertrophy': {
      name: '5 to 8 Method',
      setsReps: '2-3 × 5+(1+1+1)',
      tempo: 'random',
      rest: '10-15s between singles',
      type: 'main',
      description: 'Perform 5 reps, rest 10-15s, then 3 singles with 10-15s rest between',
      example: '5 reps → rest 15s → 1 rep → rest 15s → 1 rep → rest 15s → 1 rep'
    },
    'extended-eccentric': {
      name: 'Extended Eccentric',
      setsReps: '3-4 × 6-8',
      tempo: 'random',
      rest: '120 sec',
      type: 'main',
      description: '6 second eccentric for maximum muscle damage and growth',
      advancedOnly: true
    },
    'super-slow-eccentric': {
      name: 'Super Slow Eccentric',
      setsReps: '3 × 4-6',
      tempo: 'random',
      rest: '150 sec',
      type: 'main',
      description: '8 second eccentric - extreme time under tension',
      advancedOnly: true
    },
    'extreme-eccentric': {
      name: 'Extreme Eccentric',
      setsReps: '2-3 × 3-5',
      tempo: 'random',
      rest: '180 sec',
      type: 'main',
      description: '10 second eccentric - maximum hypertrophy stimulus',
      advancedOnly: true
    }
  };

  // Strength Set/Rep Schemes
  // Tempo guide: 
  // 4010 = Pure strength (Eccentric focus)
  // 30X0 = Strength + power (Explosive concentric)
  // 20X0 = Strength speed (Concentric)
  // 32X1 = Pause + explosive concentric (Isometric paused)
  // 43X0 = Contraction to explosion (Isometric paused)
  
  const strengthTempos = ['4010', '30X0', '20X0', '32X1', '43X0'];
  const getRandomStrengthTempo = () => strengthTempos[Math.floor(Math.random() * strengthTempos.length)];
  
  const tempoExplanations = {
    '4010': 'Pure strength (Eccentric focus)',
    '30X0': 'Strength + power (Explosive concentric)',
    '20X0': 'Strength speed (Concentric)',
    '32X1': 'Pause + explosive concentric (Isometric paused)',
    '43X0': 'Contraction to explosion (Isometric paused)',
    '1010': 'Controlled tempo (DB Lunges specific)'
  };
  
  const strengthSchemes = {
    // Secondary exercise schemes
    'basic-assistance': {
      name: 'Basic Assistance Work',
      setsReps: '3-5 × 5-8',
      tempo: 'random',
      rest: '90-120 sec',
      type: 'secondary',
      description: 'Supporting work to build strength foundation'
    },
    // Main exercise schemes
    'one-six-method': {
      name: 'The 1-6 Method',
      setsReps: '6 × (1,6,1,6,1,6)',
      tempo: 'random',
      rest: '120 sec',
      type: 'main',
      description: 'Alternate heavy singles with sets of 6 to tap into high-threshold motor units',
      example: 'A1. Back Squat (1,6,1,6,1,6) - perform one heavy single, then lighter set of 6, and repeat'
    },
    'five-four-three-two-one': {
      name: '5,4,3,2,1 Method',
      setsReps: '5 × (5,4,3,2,1)',
      tempo: 'random',
      rest: '180 sec',
      type: 'main',
      description: 'Perform 5 reps, next set add weight perform 4 reps, add weight perform 3 reps, add weight perform 2 reps, add weight perform 1 rep',
      example: 'Set 1: 100kg × 5 → Set 2: 105kg × 4 → Set 3: 110kg × 3 → Set 4: 115kg × 2 → Set 5: 120kg × 1'
    },
    'cluster-strength': {
      name: 'Cluster Training',
      setsReps: '3-5 × (5×1)',
      tempo: 'random',
      rest: '10s between reps, 120s between sets',
      type: 'main',
      description: '5 singles per cluster with short intra-set rest for maximal strength',
      example: 'A1. Close-Grip Bench Press, 3-5 clusters (5×1), rest 10s between reps'
    },
    'basic-strength': {
      name: 'Basic Strength',
      setsReps: '3-5 × 3-5',
      tempo: 'random',
      rest: '180 sec',
      type: 'main',
      description: 'Classic strength building with heavy loads and low reps'
    },
    'five-by-five': {
      name: '5×5 Strength',
      setsReps: '5 × 5',
      tempo: 'random',
      rest: '180 sec',
      type: 'main',
      description: 'Classic 5×5 protocol for building raw strength'
    },
    'six-by-three': {
      name: '6×3 Heavy',
      setsReps: '6 × 3',
      tempo: 'random',
      rest: '180-240 sec',
      type: 'main',
      description: 'Heavy triples for maximal strength development'
    },
    'wave-531': {
      name: 'Wave Loading 5/3/1',
      setsReps: '2-3 × 5/3/1',
      tempo: 'random',
      rest: '180 sec',
      type: 'main',
      description: 'Perform 5 reps, increase weight → 3 reps, increase weight → 1 rep. Start next wave with +2.5-5kg',
      example: 'Wave 1: 100kg×5, 105kg×3, 110kg×1 → Wave 2: 102.5kg×5, 107.5kg×3, 112.5kg×1'
    },
    'wave-321': {
      name: 'Wave Loading 3/2/1',
      setsReps: '2-3 × 3/2/1',
      tempo: 'random',
      rest: '180-240 sec',
      type: 'main',
      description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg',
      example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1'
    }
  };

  // Power Set/Rep Schemes (for athletic performance/power goal)
  const powerSchemes = {
    'explosive-power': {
      name: 'Explosive Power',
      setsReps: '4-6 × 3-5',
      tempo: '20X0',
      rest: '120-180 sec',
      type: 'main',
      description: 'Fast, explosive movements for maximum power output'
    },
    'power-assistance': {
      name: 'Power Assistance',
      setsReps: '3-4 × 6-8',
      tempo: '30X0',
      rest: '90-120 sec',
      type: 'secondary',
      description: 'Supporting work for power development'
    }
  };

  // Exercise-specific sets/reps for Power workouts (Legs + Full Body + others)
  const powerExerciseSchemes = {
    // Power A (Plyometric)
    'Box Jumps': [
      { setsReps: '3 × 3', tempo: 'X0X3', rest: '60-90 sec' }
    ],
    'Depth to Box Jumps': [
      { setsReps: '3 × 3', tempo: 'X0X3', rest: '60-90 sec' }
    ],
    'Stiff-Leg Depth Jump': [
      { setsReps: '3 × 3', tempo: 'X0X3', rest: '60-90 sec' }
    ],
    'Pogo Jumps': [
      { setsReps: '3 × 10', tempo: 'X0X0', rest: '60-90 sec' }
    ],
    'Seated Box Jumps': [
      { setsReps: '3 × 3', tempo: 'X0X3', rest: '60-90 sec' }
    ],
    'Hurdle Jump to Box': [
      { setsReps: '3 × 3', tempo: 'X0X3', rest: '60-90 sec' }
    ],
    'Overhead Medicine Ball Slam': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '60-90 sec' }
    ],
    'Medicine Ball Slam': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '60-90 sec' }
    ],
    'Medicine Ball Chest Pass': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '60-90 sec' }
    ],
    // Power B (Main Power Lift)
    'Power Clean': [
      { setsReps: '3 × 3', tempo: 'X0X1', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '2 × 3/2/1', tempo: 'X0X1', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' }
    ],
    'Power Clean from Hang': [
      { setsReps: '3 × 3', tempo: 'X0X1', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '2 × 3/2/1', tempo: 'X0X1', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' }
    ],
    'Power Clean + Front Squat (1+1)': [
      { setsReps: '3-5 × (1+1)', tempo: 'X0X0 + X0X0', rest: '120-180 sec', scheme: 'Complex Power' }
    ],
    'Power Clean from Block': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '2 × 3/2/1', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' }
    ],
    'Halting Pull + Power Clean (1+1)': [
      { setsReps: '3-5 × (1+1)', tempo: '1010 + X0X1', rest: '120-180 sec', scheme: 'Complex Power' }
    ],
    'Power Snatch': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '2 × 3/2/1', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' }
    ],
    'Power Snatch from Hang': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '2 × 3/2/1', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' }
    ],
    'Power Snatch from Block': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '2 × 3/2/1', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' }
    ],
    'Snatch High Pull from Hang': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '3 × 3-5', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' }
    ],
    'Snatch High Pull from Blocks': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '3-5 × 3-5', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' }
    ],
    'Squat Jumps': [
      { setsReps: '3 × 3-6', tempo: 'X0X0', rest: '90-120 sec', scheme: 'Explosive Power' }
    ],
    'Sled Sprints': [
      { setsReps: '3-5 × 10-20m', tempo: '—', rest: '90-120 sec', scheme: 'Explosive Power' }
    ],
    'Power Clean + Overhead Press': [
      { setsReps: '3-5 × (1+2)', tempo: 'X0X0 + X0X0', rest: '120-180 sec', scheme: 'Complex Power' }
    ],
    'Trap Bar Jumps': [
      { setsReps: '3 × 3-6', tempo: 'X0X0', rest: '90-120 sec', scheme: 'Explosive Power' }
    ],
    // Power C (Speed-Strength)
    'Dumbbell Speed Bench': [
      { setsReps: '3-5 × 8', tempo: 'X0X0', rest: '90-120 sec', scheme: 'Speed-Strength' }
    ],
    'Explosive Close Grip Bench Press': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '4 × 4', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '3-5 × 3-5', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' }
    ],
    'Explosive Close Grip Chin-Ups': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '4 × 4', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '3-5 × 3-5', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' }
    ],
    'Plyometric Push-Ups': [
      { setsReps: '3-5 × 5-8', tempo: 'X0X0', rest: '90-120 sec', scheme: 'Speed-Strength' }
    ],
    'Sled Push': [
      { setsReps: '3-5 × 10-20m', tempo: '—', rest: '90-120 sec', scheme: 'Speed-Strength' }
    ],
    'Clean Pull': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '2 × 3/2/1', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' }
    ],
    'Stiff-Leg Deadlift (Concentric)': [
      { setsReps: '3-5 × 2', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '3 × 3', tempo: '20X0', rest: '120-180 sec', scheme: 'Speed-Strength' }
    ],
    'Landmine Press (Explosive)': [
      { setsReps: '3-5 × 5-8', tempo: 'X0X0', rest: '90-120 sec', scheme: 'Speed-Strength' }
    ],
    'Halting Pull + Clean Pull (2+1)': [
      { setsReps: '3-5 × (2+1)', tempo: '1010 + X0X0', rest: '120-180 sec', scheme: 'Complex Speed-Strength' }
    ],
    'Clean Pull from Block': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '5 × (5,4,3,2,1)', tempo: 'X0X0', rest: '120-180 sec', scheme: '5,4,3,2,1 Method', description: 'Perform 5 reps, next set add weight perform 4 reps, add weight perform 3 reps, etc.', example: 'Set 1: 100kg × 5 → Set 2: 105kg × 4 → Set 3: 110kg × 3 → Set 4: 115kg × 2 → Set 5: 120kg × 1' }
    ],
    'Pin Front Squat': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '3-5 × 3-5', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' }
    ],
    'Front Squat': [
      { setsReps: '3 × 3', tempo: '20X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '6 × 3', tempo: '31X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '2 × 3/2/1', tempo: '32X1', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' },
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' }
    ],
    'Front Squat (1+1)': [
      { setsReps: '3-5 × (1+1)', tempo: '43X0 + 20X0', rest: '120-180 sec', scheme: 'Complex Speed-Strength' }
    ],
    'Back Squat + Front Squat (1+1)': [
      { setsReps: '3-5 × (1+1)', tempo: '43X0 + 20X0', rest: '120-180 sec', scheme: 'Complex Speed-Strength' }
    ],
    'Front Squat Heel Elevated': [
      { setsReps: '3 × 3', tempo: '20X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '6 × 3', tempo: '31X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '2 × 3/2/1', tempo: '32X1', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' },
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' }
    ],
    'Back Squat': [
      { setsReps: '3 × 3', tempo: '20X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '5 × 3', tempo: '31X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '2 × 3/2/1', tempo: '32X1', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' },
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' }
    ],
    'Pin Back Squat': [
      { setsReps: '3 × 3', tempo: '20X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '3-5 × 3-5', tempo: '31X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '2 × 3/2/1', tempo: '32X1', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' },
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' }
    ],
    'Back Squat Heel Elevated': [
      { setsReps: '3 × 3', tempo: '20X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '5 × 3', tempo: '31X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '2 × 3/2/1', tempo: '32X1', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' },
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' }
    ],
    'Snatch Pull': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '2 × 3/2/1', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' }
    ],
    'Snatch Pull from Blocks': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '2 × 3/2/1', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' }
    ],
    'Trap Bar Deadlift': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '5 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '2 × 3/2/1', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' },
      { setsReps: '3-5 × 3-5', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' }
    ],
    // Power D (Posterior Accessory)
    'Back Extensions (Dumbbells)': [
      { setsReps: '3 × 10', tempo: '3010', rest: '60-90 sec', scheme: 'Posterior Chain' },
      { setsReps: '3 × 8-12', tempo: '3010', rest: '60-90 sec', scheme: 'Posterior Chain' }
    ],
    'Back Extensions (Plate)': [
      { setsReps: '3 × 10', tempo: '3010', rest: '60-90 sec', scheme: 'Posterior Chain' },
      { setsReps: '3 × 8-12', tempo: '3010', rest: '60-90 sec', scheme: 'Posterior Chain' }
    ],
    'Back Extensions Snatch Grip': [
      { setsReps: '3 × 10', tempo: '3010', rest: '60-90 sec', scheme: 'Posterior Chain' },
      { setsReps: '3 × 8-12', tempo: '3010', rest: '60-90 sec', scheme: 'Posterior Chain' }
    ],
    'Good Morning': [
      { setsReps: '3 × 10', tempo: '3010', rest: '60-90 sec', scheme: 'Posterior Chain' },
      { setsReps: '3 × 5-8', tempo: '3010', rest: '60-90 sec', scheme: 'Posterior Chain' }
    ],
    'Reverse Hyperextensions': [
      { setsReps: '3 × 8-12', tempo: '1010', rest: '60-90 sec', scheme: 'Posterior Chain' },
      { setsReps: '3 × 15', tempo: '1010', rest: '60-90 sec', scheme: 'Posterior Chain' }
    ],
    'Seated Good Mornings': [
      { setsReps: '3 × 10', tempo: '3010', rest: '60-90 sec', scheme: 'Posterior Chain' },
      { setsReps: '3 × 8-12', tempo: '3010', rest: '60-90 sec', scheme: 'Posterior Chain' },
      { setsReps: '3 × 5-8', tempo: '3010', rest: '60-90 sec', scheme: 'Posterior Chain' }
    ],
    // Upper Body Power exercises
    'Explosive Pull-Ups': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '4 × 4', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '3-5 × 3-5', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' }
    ],
    'Band-Resisted Push-Ups': [
      { setsReps: '3-5 × 5-8', tempo: 'X0X0', rest: '90-120 sec', scheme: 'Speed-Strength' }
    ],
    'Explosive Bench Press': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '4 × 4', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '3-5 × 3-5', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' }
    ],
    'Explosive Trap Bar Push-Ups': [
      { setsReps: '3-5 × 5-8', tempo: 'X0X0', rest: '90-120 sec', scheme: 'Speed-Strength' }
    ],
    'Snatch-Grip Trap Pull': [
      { setsReps: '3-5 × 5', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' }
    ],
    'Concept2 Rower Sprints': [
      { setsReps: '3 × 50-80m', tempo: '—', rest: '90-120 sec', scheme: 'Explosive Power' }
    ],
    'Kettlebell Clean & Press': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '4 × 4', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '3-5 × 3-5', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' }
    ],
    // Core / Upper Body Accessory
    'Russian Twists': [
      { setsReps: '3 × 10', tempo: '1010', rest: '60-90 sec', scheme: 'Core Accessory' }
    ],
    'Hanging Knee Raise': [
      { setsReps: '3 × 10', tempo: '2010', rest: '60-90 sec', scheme: 'Core Accessory' }
    ],
    'Hanging Leg Raise': [
      { setsReps: '3 × 5-8', tempo: '2010', rest: '60-90 sec', scheme: 'Core Accessory' }
    ],
    'Single-Arm Dumbbell Row': [
      { setsReps: '3-5 × 5-8', tempo: 'X0X0', rest: '90-120 sec', scheme: 'Speed-Strength' }
    ],
    'TRX Face Pull': [
      { setsReps: '3 × 8-12', tempo: 'X0X0', rest: '60-90 sec', scheme: 'Speed-Strength' }
    ],
    // Arms Power exercises
    'Explosive Barbell Curl': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '4 × 4', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '3-5 × 3-5', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '5 × (5,4,3,2,1)', tempo: 'X0X0', rest: '120-180 sec', scheme: '5,4,3,2,1 Method', description: 'Perform 5 reps, next set add weight perform 4 reps, add weight perform 3 reps, etc.', example: 'Set 1: 100kg × 5 → Set 2: 105kg × 4 → Set 3: 110kg × 3 → Set 4: 115kg × 2 → Set 5: 120kg × 1' }
    ],
    'DB Clean & Press': [
      { setsReps: '3-5 × 8', tempo: 'X0X0', rest: '90-120 sec', scheme: 'Explosive Power' }
    ],
    // Rotation / Prehab Accessory
    'Seated Dumbbell External Rotation': [
      { setsReps: '3 × 8', tempo: '3010', rest: '60-90 sec', scheme: 'Rotator Cuff', description: 'Supporting work for main power movements' }
    ],
    'External Rotation (Cable/Band)': [
      { setsReps: '3 × 8-12', tempo: '3010', rest: '60-90 sec', scheme: 'Rotator Cuff', description: 'Supporting work for main power movements' }
    ],
    'Internal Rotation (Cable/Band)': [
      { setsReps: '3 × 8-12', tempo: '3010', rest: '60-90 sec', scheme: 'Rotator Cuff', description: 'Supporting work for main power movements' }
    ]
  };

  // Muscle data for each exercise
  const muscleData = {
    // CHEST EXERCISES
    'Bench Press': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Rotator Cuff, Rhomboids, Core' },
    'Push-ups': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Core, Glutes, Serratus Anterior' },
    'Neutral Grip Trapbar Push-ups': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Core, Serratus Anterior, Scapular Stabilizers, Forearms' },
    'Decline Push-up': { primary: 'Lower Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Core, Serratus Anterior, Glutes' },
    'Weighted Push-up': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Core, Upper Back, Glutes' },
    'Chest Press': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Scapular Stabilizers, Core' },
    'Incline Dumbbell Press': { primary: 'Upper Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Rotator Cuff, Core, Upper Back' },
    'Cable Flies': { primary: 'Pectoralis Major', secondary: 'Anterior Deltoids', stabilizers: 'Core, Serratus Anterior, Biceps' },
    'Dumbbell Chest Fly': { primary: 'Pectoralis Major', secondary: 'Anterior Deltoids', stabilizers: 'Biceps, Rotator Cuff, Upper Back' },
    'Incline Dumbbell Fly': { primary: 'Upper Pectoralis Major', secondary: 'Anterior Deltoids', stabilizers: 'Biceps, Rotator Cuff, Upper Back' },
    'Plate-Loaded Chest Press': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Scapular Stabilizers, Core' },
    'Seated Chest Fly': { primary: 'Pectoralis Major', secondary: 'Anterior Deltoids', stabilizers: 'Biceps, Scapular Stabilizers' },
    'Chest Dips': { primary: 'Lower Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Core, Lats, Rhomboids, Serratus Anterior' },
    
    // BACK EXERCISES
    'Pull-ups': { primary: 'Latissimus Dorsi', secondary: 'Biceps, Rhomboids, Trapezius', stabilizers: 'Core, Forearm Flexors, Rotator Cuff' },
    'Pull-ups Neutral Grip': { primary: 'Latissimus Dorsi', secondary: 'Biceps, Rhomboids, Trapezius', stabilizers: 'Core, Forearm Flexors, Rotator Cuff' },
    'Lat Pulldown': { primary: 'Latissimus Dorsi', secondary: 'Biceps, Rhomboids, Teres Major, Rear Deltoids', stabilizers: 'Rotator Cuff, Core' },
    'Barbell Row': { primary: 'Latissimus Dorsi', secondary: 'Rhomboids, Trapezius, Rear Deltoids, Biceps', stabilizers: 'Core, Hamstrings, Spinal Erectors' },
    'T-Bar Row': { primary: 'Latissimus Dorsi', secondary: 'Rhomboids, Trapezius, Rear Deltoids, Biceps', stabilizers: 'Core, Spinal Erectors, Glutes' },
    'Pendlay Row': { primary: 'Latissimus Dorsi', secondary: 'Rhomboids, Trapezius, Rear Deltoids, Biceps', stabilizers: 'Core, Spinal Erectors, Glutes' },
    'Chest-Supported Row': { primary: 'Rhomboids', secondary: 'Middle Trapezius, Lats, Rear Deltoids, Biceps', stabilizers: 'Forearms' },
    'One-Arm Dumbbell Row': { primary: 'Latissimus Dorsi', secondary: 'Rhomboids, Trapezius, Rear Deltoids, Biceps', stabilizers: 'Core, Rotator Cuff' },
    'Inverted Row': { primary: 'Rhomboids', secondary: 'Lats, Middle Trapezius, Rear Deltoids, Biceps', stabilizers: 'Core, Glutes' },
    'Cable Row': { primary: 'Latissimus Dorsi', secondary: 'Rhomboids, Trapezius, Rear Deltoids, Biceps', stabilizers: 'Core, Rotator Cuff' },
    'Face Pulls': { primary: 'Rear Deltoids', secondary: 'Rhomboids, Middle Trapezius, External Rotators', stabilizers: 'Core, Rotator Cuff' },
    'High Pulls': { primary: 'Trapezius', secondary: 'Rear Deltoids, Rhomboids', stabilizers: 'Core, Erector Spinae' },
    'Rear Delt Flys': { primary: 'Rear Deltoids', secondary: 'Rhomboids, Middle Trapezius', stabilizers: 'Core, Rotator Cuff' },
    'Band Pull-Aparts': { primary: 'Rear Deltoids', secondary: 'Rhomboids, Middle Trapezius, External Rotators', stabilizers: 'Core' },
    'Y-T-W Raises': { primary: 'Lower Trapezius', secondary: 'Rhomboids, Middle Trapezius, External Rotators', stabilizers: 'Core, Rotator Cuff' },
    
    // SHOULDER EXERCISES
    'Barbell Overhead Press': { primary: 'Anterior Deltoid', secondary: 'Lateral Deltoid, Triceps Brachii, Upper Pectoralis Major', stabilizers: 'Core, Upper Trapezius, Rotator Cuff, Gluteus Maximus' },
    'Dumbbell Shoulder Press': { primary: 'Anterior Deltoid', secondary: 'Lateral Deltoid, Triceps Brachii, Upper Pectoralis Major', stabilizers: 'Core, Rotator Cuff, Upper Trapezius' },
    'Landmine Press': { primary: 'Anterior Deltoid', secondary: 'Upper Pectoralis Major, Triceps Brachii, Lateral Deltoid', stabilizers: 'Core, Obliques, Rotator Cuff, Serratus Anterior' },
    'Behind-the-Neck Overhead Press (Seated)': { primary: 'Anterior Deltoid', secondary: 'Lateral Deltoid, Triceps Brachii, Upper Trapezius', stabilizers: 'Rotator Cuff, Core, Rhomboids' },
    'Behind-the-Neck Overhead Press (Standing)': { primary: 'Anterior Deltoid', secondary: 'Lateral Deltoid, Triceps Brachii, Upper Trapezius', stabilizers: 'Core, Gluteus Maximus, Rotator Cuff' },
    'Behind-the-Neck Snatch-Grip Press': { primary: 'Lateral Deltoid', secondary: 'Anterior Deltoid, Triceps Brachii, Upper Trapezius', stabilizers: 'Rotator Cuff, Core, Rhomboids, Serratus Anterior' },
    'Poliquin Raise': { primary: 'Lateral Deltoid', secondary: 'Anterior Deltoid, Upper Trapezius', stabilizers: 'Rotator Cuff, Core' },
    'External Rotation (Cable/Band)': { primary: 'Rotator Cuff', secondary: 'Posterior Deltoid', stabilizers: 'Scapular Stabilizers, Core' },
    'External Rotation Dumbbell (Seated)': { primary: 'Rotator Cuff', secondary: 'Posterior Deltoid', stabilizers: 'Scapular Stabilizers, Core' },
    'Bent-Over Dumbbell Rear Delt Raise': { primary: 'Posterior Deltoid', secondary: 'Rhomboids, Middle Trapezius', stabilizers: 'Core, Lower Back, Rotator Cuff' },
    'Arnold Press': { primary: 'Anterior Deltoid', secondary: 'Lateral Deltoid, Triceps Brachii, Upper Pectoralis Major', stabilizers: 'Core, Rotator Cuff, Upper Trapezius' },
    'Chest-Supported Rear Delt Raise': { primary: 'Posterior Deltoid', secondary: 'Rhomboids, Middle Trapezius', stabilizers: 'Rotator Cuff' },
    'Internal Rotation (Cable/Band)': { primary: 'Rotator Cuff', secondary: 'Pectoralis Major, Latissimus Dorsi', stabilizers: 'Scapular Stabilizers, Core' },
    'Leaning Lateral Raise': { primary: 'Lateral Deltoid', secondary: 'Anterior Deltoid, Upper Trapezius', stabilizers: 'Core, Rotator Cuff' },
    
    // LEG EXERCISES - SQUATS
    'Back Squat': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Erector Spinae, Core, Upper Back, Calves' },
    'Back Squat Heel Elevated': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Erector Spinae, Core, Upper Back, Calves' },
    'Low Bar Back Squat': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Erector Spinae, Core, Upper Back, Calves' },
    'Box Back Squat': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Erector Spinae, Core, Upper Back, Calves' },
    'Pin Back Squat': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Erector Spinae, Core, Upper Back, Calves' },
    'Back Squat w Chains': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Erector Spinae, Core, Upper Back, Calves' },
    'Eccentric Back Squat': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Erector Spinae, Core, Upper Back, Calves' },
    'Front Squat': { primary: 'Quadriceps', secondary: 'Gluteus Maximus, Adductors', stabilizers: 'Core, Upper Back, Erector Spinae' },
    'Front Squat Heel Elevated': { primary: 'Quadriceps', secondary: 'Gluteus Maximus, Adductors', stabilizers: 'Core, Upper Back, Erector Spinae' },
    'Box Front Squat': { primary: 'Quadriceps', secondary: 'Gluteus Maximus, Adductors', stabilizers: 'Core, Upper Back, Erector Spinae' },
    'Pin Front Squat': { primary: 'Quadriceps', secondary: 'Gluteus Maximus, Adductors', stabilizers: 'Core, Upper Back, Erector Spinae' },
    'Front Squat w Chains': { primary: 'Quadriceps', secondary: 'Gluteus Maximus, Adductors', stabilizers: 'Core, Upper Back, Erector Spinae' },
    'Eccentric Front Squat': { primary: 'Quadriceps', secondary: 'Gluteus Maximus, Adductors', stabilizers: 'Core, Upper Back, Erector Spinae' },
    'Bulgarian Squat w Dumbbells': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core, Calves' },
    'Bulgarian Squat w Kettlebells': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core, Calves' },
    'Bulgarian Back Squat': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core, Calves' },
    'Bulgarian Front Squat': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core, Calves' },
    'Dumbbell Lunges': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core, Calves' },
    'Belt Squat': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core, Calves' },
    'Leg Press': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core' },
    'Leg Extension': { primary: 'Quadriceps', secondary: '', stabilizers: 'Core' },
    'Sled Push': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Calves', stabilizers: 'Core, Upper Back' },
    'Box Jump': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Calves', stabilizers: 'Core' },
    'Barbell Jumps': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Calves', stabilizers: 'Core, Upper Back' },
    
    // LEG EXERCISES - DEADLIFTS
    'Deadlift': { primary: 'Gluteus Maximus, Hamstrings', secondary: 'Erector Spinae, Adductors', stabilizers: 'Core, Traps, Lats, Forearm Flexors' },
    'Trap Bar Deadlift': { primary: 'Gluteus Maximus, Hamstrings, Quadriceps', secondary: 'Erector Spinae, Adductors', stabilizers: 'Core, Traps, Lats, Forearm Flexors' },
    'Romanian Deadlift': { primary: 'Hamstrings, Gluteus Maximus', secondary: 'Erector Spinae, Adductors', stabilizers: 'Core, Lats, Forearms' },
    'Single Leg RDL': { primary: 'Hamstrings, Gluteus Maximus', secondary: 'Erector Spinae, Adductors', stabilizers: 'Core, Lats, Forearms' },
    'Snatch Grip Romanian DL': { primary: 'Hamstrings, Gluteus Maximus', secondary: 'Erector Spinae, Adductors', stabilizers: 'Core, Lats, Forearms' },
    'Snatch Grip Deficit RDL': { primary: 'Hamstrings, Gluteus Maximus', secondary: 'Erector Spinae, Adductors', stabilizers: 'Core, Lats, Forearms' },
    'Snatch Pull': { primary: 'Gluteus Maximus, Quadriceps', secondary: 'Hamstrings, Traps, Erector Spinae', stabilizers: 'Core, Lats, Rhomboids' },
    'Rack Pull DL': { primary: 'Gluteus Maximus, Quadriceps', secondary: 'Hamstrings, Traps, Erector Spinae', stabilizers: 'Core, Lats, Rhomboids' },
    'Rack Pull Clean Pull': { primary: 'Gluteus Maximus, Quadriceps', secondary: 'Hamstrings, Traps, Erector Spinae', stabilizers: 'Core, Lats, Rhomboids' },
    'Rack Pull Snatch Pull': { primary: 'Gluteus Maximus, Quadriceps', secondary: 'Hamstrings, Traps, Erector Spinae', stabilizers: 'Core, Lats, Rhomboids' },
    'Lying Leg Curl': { primary: 'Hamstrings', secondary: 'Glutes', stabilizers: 'Core, Calves' },
    'Nordic Curl': { primary: 'Hamstrings', secondary: 'Glutes', stabilizers: 'Core, Calves' },
    'Glute Ham Raise': { primary: 'Hamstrings', secondary: 'Glutes', stabilizers: 'Core, Calves' },
    'Back Extensions': { primary: 'Erector Spinae', secondary: 'Glutes, Hamstrings', stabilizers: 'Core, Upper Back' },
    'Back Extensions (Dumbbells)': { primary: 'Erector Spinae', secondary: 'Glutes, Hamstrings', stabilizers: 'Core, Upper Back' },
    'Back Extensions (Plate)': { primary: 'Erector Spinae', secondary: 'Glutes, Hamstrings', stabilizers: 'Core, Upper Back' },
    'Back Extensions Snatch Grip': { primary: 'Erector Spinae', secondary: 'Glutes, Hamstrings', stabilizers: 'Core, Upper Back' },
    'Single Leg Back Extensions': { primary: 'Erector Spinae', secondary: 'Glutes, Hamstrings', stabilizers: 'Core, Upper Back' },
    'Good Morning': { primary: 'Erector Spinae', secondary: 'Glutes, Hamstrings', stabilizers: 'Core, Upper Back' },
    'Seated Good Mornings': { primary: 'Erector Spinae', secondary: 'Glutes, Hamstrings', stabilizers: 'Core, Upper Back' },
    'Russian Twists': { primary: 'Obliques, Rectus Abdominis', secondary: 'Hip Flexors, Erector Spinae', stabilizers: 'Core, Transverse Abdominis' },
    'Hanging Knee Raise': { primary: 'Rectus Abdominis, Hip Flexors', secondary: 'Obliques', stabilizers: 'Forearms, Latissimus Dorsi, Core' },
    'Hanging Leg Raise': { primary: 'Rectus Abdominis, Hip Flexors', secondary: 'Obliques, Adductors', stabilizers: 'Forearms, Latissimus Dorsi, Core' },
    'Single-Arm Dumbbell Row': { primary: 'Latissimus Dorsi', secondary: 'Rhomboids, Trapezius, Rear Deltoids, Biceps', stabilizers: 'Core, Rotator Cuff, Obliques' },
    'TRX Face Pull': { primary: 'Rear Deltoids', secondary: 'Rhomboids, Middle Trapezius, External Rotators', stabilizers: 'Core, Rotator Cuff, Biceps' },
    'Reverse Hyperextensions': { primary: 'Erector Spinae', secondary: 'Glutes, Hamstrings', stabilizers: 'Core, Upper Back' },
    'Calf Raises': { primary: 'Gastrocnemius, Soleus', secondary: 'Tibialis Posterior', stabilizers: 'Core, Ankle Stabilizers' },
    
    // ARM EXERCISES
    'Chin Up': { primary: 'Biceps Brachii, Lats', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Scapular Stabilizers' },
    'Close Grip Chin Up': { primary: 'Biceps Brachii, Lats', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Scapular Stabilizers' },
    'Incline Dumbbell Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Barbell Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Dumbbell Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Hammer Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Anatoly Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Preacher Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Zottman Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Concentration Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Drag Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Supinated Close Grip Lat Pulldown': { primary: 'Biceps Brachii, Lats', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Scapular Stabilizers' },
    'Cable Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Single-Arm Cable Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'High Cable Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Machine Preacher Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Machine Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Close-Grip Bench Press': { primary: 'Triceps Brachii', secondary: 'Chest, Anterior Deltoids', stabilizers: 'Core, Upper Back' },
    'Close-Grip Bench Press': { primary: 'Triceps Brachii', secondary: 'Chest, Anterior Deltoids', stabilizers: 'Core, Upper Back' },
    'Weighted V Dips': { primary: 'Triceps Brachii', secondary: 'Chest, Anterior Deltoids', stabilizers: 'Core, Upper Back' },
    'Skull Crushers EZ-Bar': { primary: 'Triceps Brachii', secondary: 'Anterior Deltoids', stabilizers: 'Core, Shoulders' },
    'Skull Crushers DB': { primary: 'Triceps Brachii', secondary: 'Anterior Deltoids', stabilizers: 'Core, Shoulders' },
    'Dumbbell Kickbacks': { primary: 'Triceps Brachii', secondary: 'Anterior Deltoids', stabilizers: 'Core, Shoulders' },
    'Cable Triceps Pushdown': { primary: 'Triceps Brachii', secondary: 'Anterior Deltoids', stabilizers: 'Core, Shoulders' },
    'Diamond Push-Ups': { primary: 'Triceps Brachii', secondary: 'Anterior Deltoids', stabilizers: 'Core, Shoulders' },
    'Low Incline Dumbbell Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Overhead Rope Extension': { primary: 'Triceps Brachii', secondary: 'Anterior Deltoids', stabilizers: 'Core, Shoulders' },
    'Scott EZ Bar Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    
    // FOREARM/GRIP
    'Wrist Curl': { primary: 'Forearm Flexors', secondary: 'Brachioradialis', stabilizers: 'Wrist Stabilizers' },
    'Reverse Wrist Curl': { primary: 'Forearm Extensors', secondary: 'Brachioradialis', stabilizers: 'Wrist Stabilizers' },
    'Reverse Curl': { primary: 'Forearm Extensors', secondary: 'Brachioradialis', stabilizers: 'Wrist Stabilizers' },
    'Plate Pinch Holds': { primary: 'Forearm Flexors', secondary: 'Brachioradialis', stabilizers: 'Wrist Stabilizers' },
    'DB Pinch Holds': { primary: 'Forearm Flexors', secondary: 'Brachioradialis', stabilizers: 'Wrist Stabilizers' },
    'FatGrip Curls': { primary: 'Forearm Flexors', secondary: 'Brachioradialis', stabilizers: 'Wrist Stabilizers' },
    'Gripper Machine': { primary: 'Forearm Flexors', secondary: 'Brachioradialis', stabilizers: 'Wrist Stabilizers' },
    'Grippers': { primary: 'Forearm Flexors', secondary: 'Brachioradialis', stabilizers: 'Wrist Stabilizers' },
    
    // POWER EXERCISES
    'Power Clean': { primary: 'Quadriceps, Gluteus Maximus, Trapezius', secondary: 'Hamstrings, Deltoids, Upper Back', stabilizers: 'Core, Erector Spinae, Forearms' },
    'Power Clean from Hang': { primary: 'Hamstrings, Gluteus Maximus, Trapezius', secondary: 'Quadriceps, Deltoids, Upper Back', stabilizers: 'Core, Erector Spinae, Forearms' },
    'Power Clean + Front Squat (1+1)': { primary: 'Quadriceps, Gluteus Maximus, Trapezius', secondary: 'Hamstrings, Deltoids, Upper Back', stabilizers: 'Core, Erector Spinae, Forearms' },
    'Power Clean from Block': { primary: 'Quadriceps, Gluteus Maximus, Trapezius', secondary: 'Hamstrings, Deltoids, Upper Back', stabilizers: 'Core, Erector Spinae, Forearms' },
    'Halting Pull + Power Clean (1+1)': { primary: 'Hamstrings, Gluteus Maximus, Trapezius', secondary: 'Quadriceps, Erector Spinae, Upper Back', stabilizers: 'Core, Forearms, Deltoids' },
    'Clean Pull': { primary: 'Hamstrings, Gluteus Maximus, Trapezius', secondary: 'Quadriceps, Erector Spinae', stabilizers: 'Core, Forearms, Upper Back' },
    'Clean Pull from Hang': { primary: 'Hamstrings, Gluteus Maximus, Trapezius', secondary: 'Erector Spinae, Quadriceps', stabilizers: 'Core, Forearms, Upper Back' },
    'Halting Pull + Clean Pull (2+1)': { primary: 'Hamstrings, Gluteus Maximus, Trapezius', secondary: 'Quadriceps, Erector Spinae', stabilizers: 'Core, Forearms, Upper Back' },
    'Clean Pull from Block': { primary: 'Hamstrings, Gluteus Maximus, Trapezius', secondary: 'Quadriceps, Erector Spinae', stabilizers: 'Core, Forearms, Upper Back' },
    'Stiff-Leg Deadlift (Concentric)': { primary: 'Hamstrings, Gluteus Maximus', secondary: 'Erector Spinae, Adductors', stabilizers: 'Core, Lats, Forearms' },
    'Power Snatch': { primary: 'Quadriceps, Gluteus Maximus, Deltoids, Trapezius', secondary: 'Hamstrings, Triceps, Upper Back', stabilizers: 'Core, Erector Spinae, Forearms, Rotator Cuff' },
    'Power Snatch from Hang': { primary: 'Hamstrings, Gluteus Maximus, Deltoids, Trapezius', secondary: 'Quadriceps, Triceps, Upper Back', stabilizers: 'Core, Erector Spinae, Forearms, Rotator Cuff' },
    'Power Snatch from Block': { primary: 'Quadriceps, Gluteus Maximus, Deltoids, Trapezius', secondary: 'Hamstrings, Triceps, Upper Back', stabilizers: 'Core, Erector Spinae, Forearms, Rotator Cuff' },
    'Snatch High Pull from Hang': { primary: 'Hamstrings, Trapezius, Deltoids', secondary: 'Gluteus Maximus, Upper Back', stabilizers: 'Core, Forearms, Erector Spinae' },
    'Snatch High Pull from Blocks': { primary: 'Hamstrings, Trapezius, Deltoids', secondary: 'Gluteus Maximus, Upper Back', stabilizers: 'Core, Forearms, Erector Spinae' },
    'Snatch Pull': { primary: 'Hamstrings, Gluteus Maximus, Trapezius', secondary: 'Quadriceps, Erector Spinae', stabilizers: 'Core, Forearms, Upper Back' },
    'Snatch Pull from Blocks': { primary: 'Hamstrings, Gluteus Maximus, Trapezius', secondary: 'Quadriceps, Erector Spinae', stabilizers: 'Core, Forearms, Upper Back' },
    'Pin Front Squat': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core, Erector Spinae, Upper Back' },
    'VMO Front Squat': { primary: 'Vastus Medialis Oblique (VMO), Quadriceps', secondary: 'Gluteus Maximus, Hamstrings', stabilizers: 'Core, Erector Spinae, Upper Back' },
    'Back Squat + Front Squat (1+1)': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core, Erector Spinae, Upper Back' },
    'Front Squat (1+1)': { primary: 'Quadriceps', secondary: 'Gluteus Maximus, Adductors', stabilizers: 'Core, Upper Back, Erector Spinae' },
    'Pin Back Squat': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core, Erector Spinae, Upper Back' },
    'Squat Jumps': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Calves', stabilizers: 'Core, Hip Stabilizers' },
    'VMO Back Squat': { primary: 'Vastus Medialis Oblique (VMO), Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core, Erector Spinae, Upper Back' },
    'Box Jumps': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Calves', stabilizers: 'Core, Hip Stabilizers, Ankle Stabilizers' },
    'Depth to Box Jumps': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Calves', stabilizers: 'Core, Hip Stabilizers, Ankle Stabilizers' },
    'Stiff-Leg Depth Jump': { primary: 'Calves, Quadriceps', secondary: 'Hamstrings, Gluteus Maximus', stabilizers: 'Ankle Stabilizers, Core' },
    'Pogo Jumps': { primary: 'Calves, Quadriceps', secondary: 'Hamstrings', stabilizers: 'Ankle Stabilizers, Core' },
    'Seated Box Jumps': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Calves', stabilizers: 'Core, Hip Stabilizers' },
    'Hurdles Jumps': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Calves, Hip Flexors', stabilizers: 'Core, Hip Stabilizers, Ankle Stabilizers' },
    'Hurdle Jump to Box': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Calves, Hip Flexors', stabilizers: 'Core, Hip Stabilizers, Ankle Stabilizers' },
    'Sled Sprints': { primary: 'Quadriceps, Gluteus Maximus, Hamstrings', secondary: 'Calves, Hip Flexors', stabilizers: 'Core, Erector Spinae' },
    'Medicine Ball Slam': { primary: 'Pectoralis Major, Deltoids, Latissimus Dorsi', secondary: 'Triceps, Core, Serratus Anterior', stabilizers: 'Rotator Cuff, Obliques, Erector Spinae' },
    'Overhead Medicine Ball Slam': { primary: 'Deltoids, Latissimus Dorsi, Core', secondary: 'Triceps, Serratus Anterior, Erector Spinae', stabilizers: 'Rotator Cuff, Obliques, Gluteus Maximus' },
    'Plyometric Push-Ups': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Core, Serratus Anterior, Rotator Cuff' },
    'Speed Bench Press': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Rotator Cuff, Core, Scapular Stabilizers' },
    'Barbell High Pull': { primary: 'Trapezius, Deltoids', secondary: 'Rhomboids, Biceps', stabilizers: 'Core, Erector Spinae, Forearms' },
    'Medicine Ball Chest Pass': { primary: 'Pectoralis Major, Deltoids', secondary: 'Triceps, Serratus Anterior', stabilizers: 'Core, Rotator Cuff' },
    'Explosive Pull-Ups': { primary: 'Latissimus Dorsi', secondary: 'Biceps, Rhomboids, Trapezius', stabilizers: 'Core, Forearms, Rear Deltoids' },
    'SPEED CLOSE GRIP BENCH': { primary: 'Triceps, Pectoralis Major', secondary: 'Anterior Deltoids', stabilizers: 'Rotator Cuff, Core, Scapular Stabilizers' },
    'Landmine Press (Explosive)': { primary: 'Anterior Deltoids, Pectoralis Major', secondary: 'Triceps, Core', stabilizers: 'Obliques, Serratus Anterior, Rotator Cuff' },
    'Explosive Close Grip Chin-Ups': { primary: 'Latissimus Dorsi, Biceps', secondary: 'Rhomboids, Trapezius', stabilizers: 'Core, Forearms, Rear Deltoids' },
    'Dumbbell Speed Bench': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Rotator Cuff, Core, Scapular Stabilizers' },
    'Kettlebell Clean & Press': { primary: 'Deltoids, Quadriceps, Gluteus Maximus', secondary: 'Trapezius, Triceps, Hamstrings', stabilizers: 'Core, Forearms, Erector Spinae, Rotator Cuff' },
    'Trap Bar Jumps': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Calves, Trapezius', stabilizers: 'Core, Erector Spinae, Forearms' },
    'Power Clean + Overhead Press': { primary: 'Quadriceps, Gluteus Maximus, Deltoids, Trapezius', secondary: 'Hamstrings, Triceps, Upper Back', stabilizers: 'Core, Erector Spinae, Forearms, Rotator Cuff' },
    'Explosive Close Grip Bench Press': { primary: 'Triceps, Pectoralis Major', secondary: 'Anterior Deltoids', stabilizers: 'Rotator Cuff, Core, Scapular Stabilizers' },
    'Band-Resisted Push-Ups': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Core, Serratus Anterior, Glutes' },
    'Explosive Bench Press': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Rotator Cuff, Core, Scapular Stabilizers' },
    'Explosive Trap Bar Push-Ups': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Core, Serratus Anterior, Scapular Stabilizers, Forearms' },
    'Snatch-Grip Trap Pull': { primary: 'Trapezius, Deltoids, Upper Back', secondary: 'Rhomboids, Biceps, Erector Spinae', stabilizers: 'Core, Forearms, Rotator Cuff' },
    'Concept2 Rower Sprints': { primary: 'Quadriceps, Latissimus Dorsi, Gluteus Maximus', secondary: 'Hamstrings, Biceps, Erector Spinae, Deltoids', stabilizers: 'Core, Forearms, Calves' },
    'Explosive Barbell Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis, Anterior Deltoids', stabilizers: 'Core, Forearms' },
    'DB Clean & Press': { primary: 'Deltoids, Quadriceps, Gluteus Maximus', secondary: 'Trapezius, Triceps, Hamstrings', stabilizers: 'Core, Forearms, Erector Spinae, Rotator Cuff' },
    'Seated Dumbbell External Rotation': { primary: 'Rotator Cuff', secondary: 'Posterior Deltoid', stabilizers: 'Scapular Stabilizers, Core' }
  };

  // Exercise Database with main/secondary classification
  const exerciseDatabase = {
    'build-muscle': {
      'full-gym': {
        'chest-back': {
          chest: {
            main: ['Bench Press', 'Chest Press', 'Incline Dumbbell Press', 'Plate-Loaded Chest Press'],
            secondary: ['Push-ups', 'Neutral Grip Trapbar Push-ups', 'Decline Push-up', 'Weighted Push-up', 'Cable Flies', 'Dumbbell Chest Fly', 'Incline Dumbbell Fly', 'Seated Chest Fly', 'Chest Dips']
          },
          back: {
            main: ['Pull-ups', 'Pull-ups Neutral Grip', 'Lat Pulldown', 'T-Bar Row', 'Pendlay Row', 'High Pulls'],
            secondary: ['Barbell Row', 'Chest-Supported Row', 'One-Arm Dumbbell Row', 'Inverted Row', 'Cable Row', 'Face Pulls', 'Rear Delt Flys', 'Band Pull-Aparts', 'Y-T-W Raises']
          }
        },
        'legs': {
          quads: {
            main: ['Back Squat', 'Back Squat Heel Elevated', 'Low Bar Back Squat', 'Box Back Squat', 'Pin Back Squat', 'Back Squat w Chains', 'Eccentric Back Squat', 'Front Squat', 'Front Squat Heel Elevated', 'Box Front Squat', 'Pin Front Squat', 'Front Squat w Chains', 'Eccentric Front Squat', 'Belt Squat', 'Sled Push'],
            secondary: ['Bulgarian Squat w Dumbbells', 'Bulgarian Squat w Kettlebells', 'Bulgarian Back Squat', 'Bulgarian Front Squat', 'Dumbbell Lunges', 'Leg Press', 'Leg Extension', 'Calf Raises']
          },
          hamstrings: {
            main: ['Deadlift', 'Trap Bar Deadlift', 'Snatch Grip Romanian DL', 'Snatch Grip Deficit RDL', 'Snatch Pull', 'Rack Pull DL', 'Rack Pull Clean Pull', 'Rack Pull Snatch Pull', 'Lying Leg Curl', 'Nordic Curl', 'Glute Ham Raise'],
            secondary: ['Romanian Deadlift', 'Single Leg RDL', 'Back Extensions', 'Back Extensions Snatch Grip', 'Single Leg Back Extensions', 'Good Morning', 'Reverse Hyperextensions']
          }
        },
        'arms': {
          biceps: {
            main: ['Chin Up', 'Close Grip Chin Up', 'Incline Dumbbell Curl', 'Barbell Curl', 'Preacher Curl', 'Supinated Close Grip Lat Pulldown', 'Machine Preacher Curl'],
            secondary: ['Dumbbell Curl', 'Hammer Curl', 'Anatoly Curl', 'Zottman Curl', 'Concentration Curl', 'Drag Curl', 'Cable Curl', 'Single-Arm Cable Curl', 'High Cable Curl', 'Machine Curl', 'Low Incline Dumbbell Curl']
          },
          triceps: {
            main: ['Close-Grip Bench Press', 'Weighted V Dips'],
            secondary: ['Skull Crushers EZ-Bar', 'Skull Crushers DB', 'Dumbbell Kickbacks', 'Cable Triceps Pushdown', 'Diamond Push-Ups', 'Overhead Rope Extension']
          },
          shoulders: {
            main: ['Barbell Overhead Press', 'Landmine Press', 'Behind-the-Neck Overhead Press (Seated)', 'Behind-the-Neck Overhead Press (Standing)', 'Behind-the-Neck Snatch-Grip Press'],
            secondary: ['Dumbbell Shoulder Press', 'Arnold Press', 'Poliquin Raise', 'Leaning Lateral Raise', 'Bent-Over Dumbbell Rear Delt Raise', 'Chest-Supported Rear Delt Raise', 'External Rotation (Cable/Band)', 'External Rotation Dumbbell (Seated)', 'Internal Rotation (Cable/Band)']
          }
        },
        'full-body': {
          main: ['Back Squat', 'Deadlift', 'Bench Press', 'Pull-ups', 'Front Squat', 'Barbell Overhead Press'],
          secondary: ['Romanian Deadlift', 'Bulgarian Squat w Dumbbells', 'Barbell Row', 'Push-ups', 'Leg Press', 'Dumbbell Shoulder Press']
        },
        'upper-body': {
          main: ['Bench Press', 'Pull-ups', 'Lat Pulldown', 'Barbell Overhead Press'],
          secondary: ['Incline Dumbbell Press', 'Cable Flies', 'Barbell Row', 'Face Pulls', 'Cable Row', 'Chest Dips', 'Dumbbell Shoulder Press', 'Arnold Press', 'Leaning Lateral Raise']
        }
      },
      'barbells-only': {
        'chest-back': {
          chest: { main: ['Bench Press'], secondary: ['Close-Grip Bench Press'] },
          back: { main: ['Barbell Row', 'Pendlay Row', 'T-Bar Row', 'High Pulls'], secondary: ['Inverted Row'] }
        },
        'legs': {
          quads: { main: ['Back Squat', 'Back Squat Heel Elevated', 'Low Bar Back Squat', 'Box Back Squat', 'Pin Back Squat', 'Back Squat w Chains', 'Eccentric Back Squat', 'Front Squat', 'Front Squat Heel Elevated', 'Box Front Squat', 'Pin Front Squat', 'Front Squat w Chains', 'Eccentric Front Squat'], secondary: ['Bulgarian Back Squat', 'Bulgarian Front Squat', 'Dumbbell Lunges', 'Calf Raises'] },
          hamstrings: { main: ['Deadlift', 'Snatch Pull', 'Rack Pull DL', 'Rack Pull Clean Pull', 'Rack Pull Snatch Pull'], secondary: ['Romanian Deadlift', 'Snatch Grip Romanian DL', 'Snatch Grip Deficit RDL', 'Good Morning', 'Back Extensions', 'Back Extensions Snatch Grip'] }
        },
        'arms': {
          biceps: { main: ['Barbell Curl', 'Preacher Curl'], secondary: ['Drag Curl', 'Reverse Curl'] },
          triceps: { main: ['Close-Grip Bench Press'], secondary: ['Skull Crushers EZ-Bar'] },
          shoulders: { main: ['Barbell Overhead Press', 'Behind-the-Neck Overhead Press (Seated)', 'Behind-the-Neck Overhead Press (Standing)', 'Behind-the-Neck Snatch-Grip Press'], secondary: [] }
        },
        'full-body': { main: ['Back Squat', 'Deadlift', 'Bench Press', 'Front Squat', 'Barbell Overhead Press'], secondary: ['Romanian Deadlift', 'Barbell Row', 'Dumbbell Lunges'] },
        'upper-body': { main: ['Bench Press', 'Barbell Row', 'Barbell Overhead Press'], secondary: ['Pendlay Row', 'Close-Grip Bench Press'] }
      },
      'dumbbells-only': {
        'chest-back': {
          chest: { main: ['Incline Dumbbell Press', 'Chest Press', 'Plate-Loaded Chest Press'], secondary: ['Dumbbell Chest Fly', 'Incline Dumbbell Fly'] },
          back: { main: ['T-Bar Row'], secondary: ['One-Arm Dumbbell Row', 'Chest-Supported Row', 'Rear Delt Flys'] }
        },
        'legs': {
          quads: { main: ['Belt Squat'], secondary: ['Bulgarian Squat w Dumbbells', 'Bulgarian Squat w Kettlebells', 'Dumbbell Lunges', 'Calf Raises'] },
          hamstrings: { main: ['Trap Bar Deadlift', 'Glute Ham Raise'], secondary: ['Romanian Deadlift', 'Single Leg RDL', 'Back Extensions', 'Single Leg Back Extensions'] }
        },
        'arms': {
          biceps: { main: ['Incline Dumbbell Curl', 'Preacher Curl', 'Machine Preacher Curl'], secondary: ['Dumbbell Curl', 'Hammer Curl', 'Anatoly Curl', 'Zottman Curl', 'Concentration Curl', 'DB Pinch Holds'] },
          triceps: { main: ['Weighted V Dips'], secondary: ['Skull Crushers DB', 'Dumbbell Kickbacks'] },
          shoulders: { main: ['Dumbbell Shoulder Press', 'Landmine Press'], secondary: ['Arnold Press', 'Poliquin Raise', 'Leaning Lateral Raise', 'Bent-Over Dumbbell Rear Delt Raise', 'External Rotation Dumbbell (Seated)'] }
        },
        'full-body': { main: ['Trap Bar Deadlift', 'Incline Dumbbell Press', 'Dumbbell Shoulder Press'], secondary: ['Bulgarian Squat w Dumbbells', 'One-Arm Dumbbell Row', 'Dumbbell Lunges'] },
        'upper-body': { main: ['Incline Dumbbell Press', 'Dumbbell Shoulder Press'], secondary: ['Dumbbell Chest Fly', 'One-Arm Dumbbell Row', 'Rear Delt Flys', 'Arnold Press', 'Leaning Lateral Raise'] }
      },
      'no-equipment': {
        'full-body': ['Push-ups', 'Bodyweight Squat', 'Pike Push-up', 'Lunge', 'Plank', 'Burpee', 'Mountain Climbers', 'Jump Squat'],
        'upper-body': ['Push-ups', 'Pike Push-up', 'Diamond Push-up', 'Decline Push-up', 'Plank', 'Superman', 'Tricep Dips', 'Wide Push-up'],
        'chest-back': ['Push-ups', 'Wide Push-up', 'Diamond Push-up', 'Pike Push-up', 'Superman', 'Plank Row', 'Pseudo Planche Push-up', 'Back Extensions'],
        'legs': ['Bodyweight Squat', 'Lunge', 'Bulgarian Split Squat', 'Jump Squat', 'Single Leg Deadlift', 'Glute Bridge', 'Wall Sit', 'Calf Raises'],
        'arms': ['Diamond Push-up', 'Tricep Dips', 'Pike Push-up', 'Decline Push-up', 'Plank Up-Down', 'Close-Grip Push-up', 'Bodyweight Curl', 'Arm Circles']
      }
    },
    'strength': {
      'full-gym': {
        'chest-back': {
          chest: { main: ['Bench Press', 'Chest Press', 'Incline Dumbbell Press', 'Plate-Loaded Chest Press'], secondary: ['Weighted Push-up', 'Chest Dips'] },
          back: { main: ['Pull-ups', 'Pull-ups Neutral Grip', 'Lat Pulldown', 'T-Bar Row', 'Pendlay Row', 'High Pulls'], secondary: ['Barbell Row', 'Chest-Supported Row', 'Cable Row'] }
        },
        'legs': {
          quads: { main: ['Back Squat', 'Back Squat Heel Elevated', 'Low Bar Back Squat', 'Box Back Squat', 'Pin Back Squat', 'Back Squat w Chains', 'Front Squat', 'Front Squat Heel Elevated', 'Box Front Squat', 'Pin Front Squat', 'Front Squat w Chains', 'Belt Squat', 'Sled Push'], secondary: ['Bulgarian Squat w Dumbbells', 'Leg Press', 'Leg Extension', 'Dumbbell Lunges', 'Calf Raises'] },
          hamstrings: { main: ['Deadlift', 'Trap Bar Deadlift', 'Rack Pull DL', 'Lying Leg Curl', 'Nordic Curl'], secondary: ['Romanian Deadlift', 'Single Leg RDL', 'Back Extensions'] }
        },
        'arms': {
          biceps: { main: ['Chin Up', 'Close Grip Chin Up', 'Barbell Curl', 'Supinated Close Grip Lat Pulldown'], secondary: ['Dumbbell Curl', 'Hammer Curl', 'Preacher Curl', 'Scott EZ Bar Curl'] },
          triceps: { main: ['Close-Grip Bench Press', 'Weighted V Dips'], secondary: ['Skull Crushers EZ-Bar', 'Cable Triceps Pushdown'] },
          shoulders: { main: ['Barbell Overhead Press', 'Behind-the-Neck Overhead Press (Seated)', 'Behind-the-Neck Overhead Press (Standing)', 'Behind-the-Neck Snatch-Grip Press'], secondary: ['Dumbbell Shoulder Press', 'Landmine Press', 'Arnold Press'] }
        },
        'full-body': { main: ['Back Squat', 'Deadlift', 'Bench Press', 'Pull-ups', 'Front Squat', 'Barbell Overhead Press'], secondary: ['Romanian Deadlift', 'Barbell Row', 'Dumbbell Lunges'] },
        'upper-body': { main: ['Bench Press', 'Pull-ups', 'Lat Pulldown', 'Barbell Overhead Press'], secondary: ['Barbell Row', 'Chest Dips', 'Face Pulls', 'Dumbbell Shoulder Press'] }
      },
      'barbells-only': {
        'chest-back': { chest: { main: ['Bench Press'], secondary: ['Close-Grip Bench Press'] }, back: { main: ['Barbell Row', 'Pendlay Row', 'T-Bar Row', 'High Pulls'], secondary: [] } },
        'legs': { quads: { main: ['Back Squat', 'Low Bar Back Squat', 'Box Back Squat', 'Front Squat'], secondary: ['Bulgarian Back Squat', 'Bulgarian Front Squat', 'Dumbbell Lunges', 'Calf Raises'] }, hamstrings: { main: ['Deadlift', 'Rack Pull DL'], secondary: ['Romanian Deadlift', 'Good Morning'] } },
        'arms': { biceps: { main: ['Barbell Curl'], secondary: ['Reverse Curl'] }, triceps: { main: ['Close-Grip Bench Press'], secondary: ['Skull Crushers EZ-Bar'] }, shoulders: { main: ['Barbell Overhead Press', 'Behind-the-Neck Overhead Press (Seated)', 'Behind-the-Neck Overhead Press (Standing)', 'Behind-the-Neck Snatch-Grip Press'], secondary: [] } },
        'full-body': { main: ['Back Squat', 'Deadlift', 'Bench Press', 'Front Squat', 'Barbell Overhead Press'], secondary: ['Romanian Deadlift', 'Barbell Row', 'Dumbbell Lunges'] },
        'upper-body': { main: ['Bench Press', 'Barbell Row', 'Barbell Overhead Press'], secondary: ['Pendlay Row', 'Close-Grip Bench Press'] }
      },
      'dumbbells-only': {
        'chest-back': { chest: { main: ['Incline Dumbbell Press', 'Chest Press'], secondary: ['Chest Dips'] }, back: { main: ['T-Bar Row'], secondary: ['One-Arm Dumbbell Row', 'Chest-Supported Row'] } },
        'legs': { quads: { main: ['Belt Squat'], secondary: ['Bulgarian Squat w Dumbbells', 'Dumbbell Lunges', 'Calf Raises'] }, hamstrings: { main: ['Trap Bar Deadlift'], secondary: ['Romanian Deadlift', 'Single Leg RDL'] } },
        'arms': { biceps: { main: ['Incline Dumbbell Curl'], secondary: ['Dumbbell Curl', 'Hammer Curl'] }, triceps: { main: ['Weighted V Dips'], secondary: ['Skull Crushers DB'] }, shoulders: { main: ['Dumbbell Shoulder Press', 'Landmine Press'], secondary: ['Arnold Press', 'Poliquin Raise', 'Leaning Lateral Raise'] } },
        'full-body': { main: ['Trap Bar Deadlift', 'Incline Dumbbell Press', 'Dumbbell Shoulder Press'], secondary: ['Bulgarian Squat w Dumbbells', 'One-Arm Dumbbell Row'] },
        'upper-body': { main: ['Incline Dumbbell Press', 'Dumbbell Shoulder Press'], secondary: ['One-Arm Dumbbell Row', 'Chest Dips', 'Arnold Press'] }
      },
      'no-equipment': {
        'full-body': ['Pistol Squat', 'Pseudo Planche Push-up', 'One-Arm Push-up', 'Nordic Curl', 'Handstand Push-up', 'Dragon Flag', 'Archer Push-up', 'Shrimp Squat'],
        'upper-body': ['One-Arm Push-up', 'Planche Lean', 'Archer Push-up', 'Handstand Hold', 'L-Sit', 'Front Lever', 'Typewriter Push-up', 'Pseudo Planche'],
        'chest-back': ['One-Arm Push-up', 'Pseudo Planche', 'Archer Push-up', 'Front Lever', 'Back Lever', 'Superman Hold', 'Planche Lean', 'Explosive Push-up'],
        'legs': ['Pistol Squat', 'Nordic Curl', 'Single Leg RDL', 'Shrimp Squat', 'Deep Step-up', 'Sissy Squat', 'Jump Squat', 'Bulgarian Split Squat'],
        'arms': ['Typewriter Pull-up', 'Diamond Push-up', 'Tricep Extension', 'L-Sit', 'Plank Up-Down', 'Decline Push-up', 'Narrow Push-up', 'Dips']
      }
    },
    'fat-loss': {
      'full-gym': {
        'chest-back': { 
          plyometric: ['Overhead Medicine Ball Slam'],
          mainPowerLift: ['Dumbbell Speed Bench', 'Explosive Close Grip Chin-Ups', 'Plyometric Push-Ups', 'Explosive Pull-Ups', 'Band-Resisted Push-Ups', 'Explosive Bench Press', 'Explosive Trap Bar Push-Ups', 'Snatch-Grip Trap Pull', 'Concept2 Rower Sprints'],
          speedStrength: ['Dumbbell Speed Bench', 'Explosive Close Grip Bench Press', 'Explosive Close Grip Chin-Ups', 'Plyometric Push-Ups', 'Explosive Pull-Ups', 'Band-Resisted Push-Ups', 'Explosive Bench Press', 'Explosive Trap Bar Push-Ups', 'Snatch-Grip Trap Pull', 'Single-Arm Dumbbell Row', 'TRX Face Pull'],
          posteriorAccessory: ['Back Extensions (Dumbbells)', 'Back Extensions (Plate)', 'Back Extensions Snatch Grip', 'Seated Good Mornings', 'Reverse Hyperextensions']
        },
        'legs': { 
          plyometric: ['Box Jumps', 'Depth to Box Jumps', 'Stiff-Leg Depth Jump', 'Pogo Jumps', 'Seated Box Jumps', 'Hurdle Jump to Box'],
          mainPowerLift: ['Power Clean from Hang', 'Power Clean + Front Squat (1+1)', 'Power Clean from Block', 'Halting Pull + Power Clean (1+1)', 'Power Snatch', 'Power Snatch from Hang', 'Power Snatch from Block', 'Snatch High Pull from Hang', 'Snatch High Pull from Blocks', 'Squat Jumps', 'Sled Sprints'],
          speedStrength: ['Clean Pull', 'Stiff-Leg Deadlift (Concentric)', 'Halting Pull + Clean Pull (2+1)', 'Clean Pull from Block', 'Trap Bar Deadlift', 'Sled Push', 'Pin Front Squat', 'Front Squat', 'Front Squat (1+1)', 'Back Squat + Front Squat (1+1)', 'Front Squat Heel Elevated', 'Back Squat', 'Pin Back Squat', 'Back Squat Heel Elevated', 'Snatch Pull', 'Snatch Pull from Blocks'],
          posteriorAccessory: ['Back Extensions (Dumbbells)', 'Back Extensions (Plate)', 'Back Extensions Snatch Grip', 'Good Morning', 'Reverse Hyperextensions']
        },
        'arms': { 
          plyometric: ['Overhead Medicine Ball Slam'],
          mainPowerLift: ['Explosive Close Grip Bench Press', 'Landmine Press (Explosive)', 'Explosive Close Grip Chin-Ups', 'Explosive Pull-Ups', 'Explosive Barbell Curl', 'Kettlebell Clean & Press', 'DB Clean & Press'],
          speedStrength: ['Explosive Close Grip Bench Press', 'Landmine Press (Explosive)', 'Explosive Close Grip Chin-Ups', 'Explosive Pull-Ups', 'Explosive Barbell Curl', 'Kettlebell Clean & Press', 'DB Clean & Press'],
          posteriorAccessory: ['Seated Dumbbell External Rotation', 'External Rotation (Cable/Band)', 'Internal Rotation (Cable/Band)']
        },
        'full-body': { 
          plyometric: ['Box Jumps', 'Depth to Box Jumps', 'Stiff-Leg Depth Jump', 'Pogo Jumps', 'Seated Box Jumps', 'Overhead Medicine Ball Slam'],
          mainPowerLift: ['Power Clean', 'Power Clean from Hang', 'Power Clean + Front Squat (1+1)', 'Power Clean from Block', 'Halting Pull + Power Clean (1+1)', 'Power Snatch', 'Power Snatch from Hang', 'Power Snatch from Block', 'Snatch High Pull from Hang', 'Snatch High Pull from Blocks', 'Squat Jumps', 'Sled Sprints', 'Power Clean + Overhead Press', 'Trap Bar Jumps'],
          speedStrength: ['Dumbbell Speed Bench', 'Explosive Close Grip Bench Press', 'Explosive Close Grip Chin-Ups', 'Plyometric Push-Ups', 'Sled Push', 'Clean Pull', 'Stiff-Leg Deadlift (Concentric)', 'Landmine Press (Explosive)', 'Halting Pull + Clean Pull (2+1)', 'Clean Pull from Block', 'Pin Front Squat', 'Front Squat', 'Front Squat (1+1)', 'Back Squat + Front Squat (1+1)', 'Front Squat Heel Elevated', 'Back Squat', 'Pin Back Squat', 'Back Squat Heel Elevated', 'Snatch Pull', 'Snatch Pull from Blocks', 'Trap Bar Deadlift'],
          posteriorAccessory: ['Back Extensions (Dumbbells)', 'Back Extensions (Plate)', 'Back Extensions Snatch Grip', 'Good Morning', 'Reverse Hyperextensions', 'Seated Good Mornings']
        },
        'upper-body': { 
          plyometric: ['Overhead Medicine Ball Slam'],
          mainPowerLift: ['Dumbbell Speed Bench', 'Explosive Close Grip Bench Press', 'Explosive Close Grip Chin-Ups', 'Plyometric Push-Ups', 'Landmine Press (Explosive)', 'Explosive Pull-Ups', 'Band-Resisted Push-Ups', 'Explosive Bench Press', 'Explosive Trap Bar Push-Ups', 'Snatch-Grip Trap Pull', 'Concept2 Rower Sprints'],
          speedStrength: ['Dumbbell Speed Bench', 'Explosive Close Grip Bench Press', 'Explosive Close Grip Chin-Ups', 'Plyometric Push-Ups', 'Landmine Press (Explosive)', 'Explosive Pull-Ups', 'Band-Resisted Push-Ups', 'Explosive Bench Press', 'Explosive Trap Bar Push-Ups', 'Snatch-Grip Trap Pull', 'Kettlebell Clean & Press'],
          posteriorAccessory: ['Russian Twists', 'Hanging Knee Raise', 'Hanging Leg Raise', 'Seated Good Mornings']
        }
      },
      'barbells-only': {
        'chest-back': { 
          plyometric: ['Overhead Medicine Ball Slam'],
          mainPowerLift: ['Explosive Close Grip Bench Press', 'Plyometric Push-Ups', 'Explosive Pull-Ups', 'Band-Resisted Push-Ups', 'Explosive Bench Press', 'Snatch-Grip Trap Pull'],
          speedStrength: ['Explosive Close Grip Bench Press', 'Plyometric Push-Ups', 'Explosive Pull-Ups', 'Band-Resisted Push-Ups', 'Explosive Bench Press', 'Snatch-Grip Trap Pull'],
          posteriorAccessory: ['Back Extensions (Plate)', 'Back Extensions Snatch Grip', 'Seated Good Mornings', 'Reverse Hyperextensions']
        },
        'legs': { 
          plyometric: ['Box Jumps', 'Depth to Box Jumps', 'Stiff-Leg Depth Jump', 'Pogo Jumps', 'Seated Box Jumps', 'Hurdle Jump to Box'],
          mainPowerLift: ['Power Clean from Hang', 'Power Clean + Front Squat (1+1)', 'Power Clean from Block', 'Halting Pull + Power Clean (1+1)', 'Power Snatch', 'Power Snatch from Hang', 'Power Snatch from Block', 'Snatch High Pull from Hang', 'Snatch High Pull from Blocks', 'Squat Jumps'],
          speedStrength: ['Clean Pull', 'Stiff-Leg Deadlift (Concentric)', 'Halting Pull + Clean Pull (2+1)', 'Clean Pull from Block', 'Pin Front Squat', 'Front Squat', 'Front Squat (1+1)', 'Back Squat + Front Squat (1+1)', 'Front Squat Heel Elevated', 'Back Squat', 'Pin Back Squat', 'Back Squat Heel Elevated', 'Snatch Pull', 'Snatch Pull from Blocks'],
          posteriorAccessory: ['Back Extensions (Plate)', 'Back Extensions Snatch Grip', 'Good Morning', 'Reverse Hyperextensions']
        },
        'arms': { 
          plyometric: ['Overhead Medicine Ball Slam'],
          mainPowerLift: ['Explosive Close Grip Bench Press', 'Landmine Press (Explosive)', 'Explosive Barbell Curl'],
          speedStrength: ['Explosive Close Grip Bench Press', 'Landmine Press (Explosive)', 'Explosive Barbell Curl'],
          posteriorAccessory: ['External Rotation (Cable/Band)', 'Internal Rotation (Cable/Band)']
        },
        'full-body': { 
          plyometric: ['Box Jumps', 'Depth to Box Jumps', 'Stiff-Leg Depth Jump', 'Pogo Jumps', 'Seated Box Jumps', 'Hurdle Jump to Box'],
          mainPowerLift: ['Power Clean', 'Power Clean from Hang', 'Power Clean + Front Squat (1+1)', 'Power Clean from Block', 'Halting Pull + Power Clean (1+1)', 'Power Snatch', 'Power Snatch from Hang', 'Power Snatch from Block', 'Snatch High Pull from Hang', 'Snatch High Pull from Blocks', 'Squat Jumps', 'Power Clean + Overhead Press'],
          speedStrength: ['Explosive Close Grip Bench Press', 'Sled Push', 'Clean Pull', 'Stiff-Leg Deadlift (Concentric)', 'Halting Pull + Clean Pull (2+1)', 'Clean Pull from Block', 'Pin Front Squat', 'Front Squat', 'Front Squat (1+1)', 'Back Squat + Front Squat (1+1)', 'Front Squat Heel Elevated', 'Back Squat', 'Pin Back Squat', 'Back Squat Heel Elevated', 'Snatch Pull', 'Snatch Pull from Blocks'],
          posteriorAccessory: ['Back Extensions (Plate)', 'Back Extensions Snatch Grip', 'Good Morning', 'Reverse Hyperextensions', 'Seated Good Mornings']
        },
        'upper-body': { 
          plyometric: ['Overhead Medicine Ball Slam'],
          mainPowerLift: ['Explosive Close Grip Bench Press', 'Plyometric Push-Ups', 'Explosive Pull-Ups', 'Band-Resisted Push-Ups', 'Explosive Bench Press', 'Snatch-Grip Trap Pull'],
          speedStrength: ['Explosive Close Grip Bench Press', 'Plyometric Push-Ups', 'Explosive Pull-Ups', 'Band-Resisted Push-Ups', 'Explosive Bench Press', 'Snatch-Grip Trap Pull'],
          posteriorAccessory: ['Russian Twists', 'Hanging Knee Raise', 'Hanging Leg Raise', 'Seated Good Mornings']
        }
      },
      'dumbbells-only': {
        'chest-back': { 
          plyometric: ['Overhead Medicine Ball Slam'],
          mainPowerLift: ['Dumbbell Speed Bench', 'Plyometric Push-Ups', 'Band-Resisted Push-Ups', 'Single-Arm Dumbbell Row'],
          speedStrength: ['Dumbbell Speed Bench', 'Plyometric Push-Ups', 'Band-Resisted Push-Ups', 'Single-Arm Dumbbell Row', 'TRX Face Pull'],
          posteriorAccessory: ['Back Extensions (Dumbbells)', 'Seated Good Mornings', 'Reverse Hyperextensions']
        },
        'legs': { 
          plyometric: ['Box Jumps', 'Depth to Box Jumps', 'Stiff-Leg Depth Jump', 'Pogo Jumps', 'Seated Box Jumps', 'Hurdle Jump to Box'],
          mainPowerLift: ['Squat Jumps'],
          speedStrength: ['Trap Bar Deadlift'],
          posteriorAccessory: ['Back Extensions (Dumbbells)', 'Good Morning', 'Reverse Hyperextensions']
        },
        'arms': { 
          plyometric: ['Overhead Medicine Ball Slam'],
          mainPowerLift: ['Landmine Press (Explosive)', 'Kettlebell Clean & Press', 'DB Clean & Press'],
          speedStrength: ['Landmine Press (Explosive)', 'Kettlebell Clean & Press', 'DB Clean & Press'],
          posteriorAccessory: ['Seated Dumbbell External Rotation']
        },
        'full-body': { 
          plyometric: ['Box Jumps', 'Depth to Box Jumps', 'Stiff-Leg Depth Jump', 'Pogo Jumps', 'Seated Box Jumps', 'Overhead Medicine Ball Slam'],
          mainPowerLift: ['Squat Jumps', 'Trap Bar Jumps', 'Kettlebell Clean & Press'],
          speedStrength: ['Dumbbell Speed Bench', 'Plyometric Push-Ups', 'Landmine Press (Explosive)', 'Trap Bar Deadlift'],
          posteriorAccessory: ['Back Extensions (Dumbbells)', 'Good Morning', 'Reverse Hyperextensions', 'Seated Good Mornings']
        },
        'upper-body': { 
          plyometric: ['Overhead Medicine Ball Slam'],
          mainPowerLift: ['Dumbbell Speed Bench', 'Plyometric Push-Ups', 'Landmine Press (Explosive)', 'Band-Resisted Push-Ups', 'Kettlebell Clean & Press'],
          speedStrength: ['Dumbbell Speed Bench', 'Plyometric Push-Ups', 'Landmine Press (Explosive)', 'Band-Resisted Push-Ups', 'Kettlebell Clean & Press'],
          posteriorAccessory: ['Russian Twists', 'Hanging Knee Raise', 'Hanging Leg Raise', 'Seated Good Mornings']
        }
      },
      'no-equipment': {
        'full-body': ['Plyometric Push-Ups', 'Box Jumps', 'Squat Jumps', 'Depth to Box Jumps', 'Stiff-Leg Depth Jump', 'Pogo Jumps', 'Seated Box Jumps', 'Hurdles Jumps'],
        'upper-body': ['Plyometric Push-Ups'],
        'chest-back': ['Plyometric Push-Ups'],
        'legs': ['Box Jumps', 'Squat Jumps', 'Depth to Box Jumps', 'Stiff-Leg Depth Jump', 'Pogo Jumps', 'Seated Box Jumps', 'Hurdles Jumps'],
        'arms': ['Plyometric Push-Ups']
      }
    },
    'v02-max': {
      // Zone 2 Cardio — steady state
      'cardio': [
        { name: 'Cycling (Stationary)', protocol: '20–40 min continuous' },
        { name: 'Rowing (Easy Pace)', protocol: '20–40 min continuous' },
        { name: 'Stair Climber (Slow–Moderate)', protocol: '20–40 min continuous' },
        { name: 'Jump Rope (Steady)', protocol: '2–3 min steady jump / 1 min rest — 6–10 rounds' },
        { name: 'Jogging — Continuous', protocol: '20–60 min continuous' },
        { name: 'Jogging — Intervals', protocol: '3 min steady state / 1 min walk — 6–10 sets' },
        { name: 'Treadmill Walking (Incline)', protocol: '20–45 min continuous' }
      ],
      // VO2 Max — high-intensity protocols
      'vo2max': [
        {
          name: '5 On / 25 Off Sprint Repeat Training',
          description: 'A high-intensity sprint repeat protocol designed to improve alactic power output and sprint efficiency while developing speed endurance, repeat sprint ability, and efficient recovery under increasing fatigue.',
          howTo: 'Perform 5 seconds all-out sprint (preferably on a Stationary Bike, Assault/Echo Bike, or Concept2 Rower.  Possible also on Track/Outdoor run, Treadmill, or Sled Pushes). Then take 25 seconds active recovery (easy pedaling, light walk, slow jog). Repeat continuously for 20–30 total sprints depending on training level.',
          sprint: '5 sec all-out',
          recovery: '25 sec active',
          rounds: '20–30 sprints',
          benefits: 'Enhances speed endurance and sprint repeatability. Improves cardiovascular efficiency and VO2 max. Boosts calorie burn after training and helps reduce body fat.',
          whoFor: 'Athletes developing repeat sprint ability and game-speed conditioning. Individuals seeking high-intensity conditioning and fat loss in less time. General population with a solid fitness base focused on performance and cardiovascular health.'
        },
        {
          name: '5s On / 55s Off Sprint Repeat Training',
          description: 'A high-intensity sprint repeat protocol designed to improve alactic power output and sprint efficiency while enhancing speed endurance, repeated-sprint capacity, and fast recovery with low fatigue cost.',
          howTo: 'Perform 5 seconds all-out sprint (preferably on a Stationary Bike, Assault/Echo Bike, or Concept2 Rower.  Possible also on Track/Outdoor run, Treadmill, or Sled Pushes). Then take 55 seconds active recovery (easy pedaling, light walk, slow jog). Repeat continuously for 20–30 total sprints depending on training level.',
          sprint: '5 sec all-out',
          recovery: '55 sec active',
          rounds: '20–30 sprints',
          benefits: 'Improves speed and peak power. Improves speed endurance and sprint repeat efficiency. Supports cardiovascular health with minimal fatigue cost.',
          whoFor: 'Athletes focused on speed, power, and explosiveness. Individuals seeking efficient conditioning with low fatigue. General population focused on longevity and cardiovascular health.'
        },
        {
          name: 'Short & Sweet — 3 × 20s Sprints',
          description: 'A minimal, high-intensity sprint session designed to rapidly stimulate VO₂ max, improve cardiovascular efficiency, and build short-burst power.',
          howTo: 'Perform 20 sec all-out sprint (preferably on a Stationary Bike or Assault/Echo Bike.  Possible also on Track/Outdoor run, Treadmill, or Concept2 Rower). Then take 2 minutes active recovery (easy pedaling, light walk, slow jog). Repeat for a total of 3 sprints.',
          sprint: '20 sec all-out',
          recovery: '2 min active',
          rounds: '3 sprints',
          benefits: 'Improves VO₂ max. Increases anaerobic power. Enhances heart efficiency. Time-efficient conditioning boost. Supports longevity and cardiovascular health.',
          whoFor: 'Busy individuals needing fast conditioning. Athletes maintaining sprint capacity. Anyone wanting a powerful cardiovascular stimulus in minimal time.'
        },
        {
          name: '30-20-10 Training',
          description: 'This protocol blends low, moderate, and high intensities within short repeated cycles to simultaneously develop cardiovascular health, VO₂ max, and short-burst power.',
          howTo: 'Perform 30 sec easy jog → 20 sec moderate run → 10 sec hard sprint (preferably on Track/Outdoor run or Treadmill.  Possible also on Stationary Bike, Assault/Echo Bike, or Concept2 Rower). Repeat this sequence continuously for 5 minutes, then take 2 min active recovery. Complete 4 total segments (20 minutes of work).',
          sprint: '30s easy / 20s moderate / 10s hard',
          recovery: '2 min between segments',
          rounds: '4 segments × 5 min',
          benefits: 'Improves VO₂ max. Lowers blood pressure and improves health markers. Time-efficient cardiovascular improvements.',
          whoFor: 'People who are generally active and want to improve cardiovascular health and longevity. Individuals looking to improve VO₂ max and heart efficiency. Athletes building conditioning base and short-burst power.'
        },
        {
          name: 'Wingate Protocol — 4–6 × 30s All-Out Sprints',
          description: 'This protocol maximizes anaerobic power and glycolytic capacity through repeated 30-second all-out efforts. Wingate pushes peak power output and lactate tolerance to their limits.',
          howTo: 'Perform 30 sec ALL-OUT sprint → 4 min full recovery (preferably on a Stationary Bike or Assault/Echo Bike.  Possible also on Track Sprint, Sled Push, or Concept2 Rower). Repeat for 4–6 total rounds.',
          sprint: '30 sec ALL-OUT',
          recovery: '4 min full rest',
          rounds: '4–6 rounds',
          benefits: 'Increases power. Increases VO₂ max. Supports fat loss.',
          whoFor: 'Team sport athletes. Track & Field and Hybrid athletes. Advanced general population focused on general fitness. ⚠️ Not ideal for beginners without a conditioning base.'
        },
        {
          name: '8 On / 12 Off Sprint Intervals',
          description: 'This protocol elevates oxygen demand through repeated short surges, allowing heart rate and oxygen consumption to progressively rise toward VO₂ max levels.',
          howTo: 'Perform 8 sec hard sprint → 12 sec easy pedaling (preferably on a Stationary Bike or Assault/Echo Bike.  Possible also on Track Sprint, Sled Push, or Concept2 Rower). Continue this cycle continuously for 20 minutes. Maintain powerful but repeatable effort — not a single all-out burst.',
          sprint: '8 sec hard sprint',
          recovery: '12 sec easy',
          rounds: '20 min continuous',
          benefits: 'Increases VO₂ max. Improves heart efficiency (stroke volume). Enhances repeat sprint endurance. Enhances cardiovascular health.',
          whoFor: 'Track & Field and combat sport athletes. Hybrid athletes. Off-season conditioning blocks. General population focused on longevity and cardiovascular health.'
        },
        {
          name: '8s On / 52s Off Sprint Repeat Training',
          description: 'A high-intensity sprint repeat protocol designed to improve alactic power endurance, enhance fast-twitch mitochondrial density and biogenesis, and increase cardiovascular efficiency while keeping recovery cost low.',
          howTo: 'Perform 8 sec all-out sprint (preferably on a Stationary Bike or Assault/Echo Bike.  Possible also on Concept2 Rower). Then take 52 seconds active recovery (easy pedaling, light walk, slow jog). Repeat continuously for 20 total sprints.',
          sprint: '8 sec all-out',
          recovery: '52 sec active',
          rounds: '20 sprints',
          benefits: 'Increases VO₂ max. Improves sprint repeatability. Improves heart efficiency (stroke volume). Supports cardiovascular health.',
          whoFor: 'Athletes building conditioning base and short-burst power. Individuals seeking efficient fat loss. General population focused on longevity and cardiovascular health.'
        },
        {
          name: '100m Tempo Runs / Rows',
          description: 'A controlled tempo protocol designed to improve cardiovascular efficiency, enhance oxygen delivery, support fat loss, build endurance, and accelerate recovery.',
          howTo: 'Perform 100 meters at controlled tempo (≈70–80% effort) preferably on a Track/Outdoor run, Treadmill, or Concept2 Rower.  Possible also on Stationary Bike or Assault/Echo Bike. Then take 60 seconds easy recovery (walk, light jog, or easy rowing). Repeat for 10–20 total reps depending on training level.',
          sprint: '100m at 70–80% effort',
          recovery: '60 sec easy',
          rounds: '10–20 reps',
          benefits: 'Improves aerobic endurance and overall stamina. Enhances recovery between efforts. Helps regulate blood pressure.',
          whoFor: 'Athletes building work capacity and aerobic durability. Individuals seeking efficient conditioning with lower intensity. General population aiming to improve endurance, heart health, and fat loss.'
        }
      ]
    }
  };

  // ─── Exercise-specific tempo pools ───────────────────────────────────────
  // Each key maps to an array of valid tempos; app picks one randomly.
  // '-' entries from the spreadsheet are omitted (no tempo assigned).
  const buildMuscleExerciseTempos = {
    // CHEST
    'Bench Press':                          ['4010','30X0','20X0'],
    'Chest Press':                          ['4010','30X0','20X0'],
    'Incline Dumbbell Press':               ['4010','30X0','20X0'],
    'Plate-Loaded Chest Press':             ['4010','30X0','20X0'],
    'Push-ups':                             ['4010','30X0','20X0'],
    'Neutral Grip Trapbar Push-ups':        ['4010','30X0','20X0'],
    'Decline Push-up':                      ['4010','30X0','20X0'],
    'Weighted Push-up':                     ['4010','30X0','20X0'],
    'Cable Flies':                          ['3010'],
    'Dumbbell Chest Fly':                   ['4010','30X0','20X0'],
    'Incline Dumbbell Fly':                 ['4010','30X0','20X0'],
    'Seated Chest Fly':                     ['4010','30X0','20X0'],
    'Chest Dips':                           ['30X0','20X0'],
    // BACK
    'Pull-ups':                             ['4010','30X0','20X0'],
    'Pull-ups Neutral Grip':                ['4010','30X0','20X0'],
    'Lat Pulldown':                         ['4010','30X0','20X0'],
    'T-Bar Row':                            ['4010','3010','2010'],
    'Pendlay Row':                          ['X0X0'],
    'High Pulls':                           ['X0X0'],
    'Barbell Row':                          ['3010','2010'],
    'Chest-Supported Row':                  ['4010','3010','2010'],
    'One-Arm Dumbbell Row':                 ['4010','30X0','20X0'],
    'Inverted Row':                         ['4010','30X0','20X0'],
    'Cable Row':                            ['4010','3010','2010'],
    // QUADS
    'Back Squat':                           ['4010','3010','2010'],
    'Back Squat Heel Elevated':             ['4010','3010','2010'],
    'Low Bar Back Squat':                   ['3010','2010','2110'],
    'Box Back Squat':                       ['30X0','20X0'],
    'Pin Back Squat':                       ['30X0','20X0'],
    'Eccentric Back Squat':                 ['(10)0X0'],
    'Front Squat':                          ['4010','3010','2010'],
    'Front Squat Heel Elevated':            ['4010','30X0','20X0','32X0'],
    'Box Front Squat':                      ['3010','2010','2110'],
    'Pin Front Squat':                      ['X0X0','30X0','20X0'],
    'Eccentric Front Squat':                ['(10)0X0'],
    'Belt Squat':                           ['X0X0','30X0','20X0'],
    'Bulgarian Squat w Dumbbells':          ['4010','3010','2010'],
    'Bulgarian Squat w Kettlebells':        ['4010','3010','2010'],
    'Bulgarian Back Squat':                 ['30X0','20X0'],
    'Bulgarian Front Squat':               ['30X0','20X0'],
    'Dumbbell Lunges':                      ['1010'],
    'Leg Press':                            ['4010','3010','2010'],
    'Leg Extension':                        ['4010','3010','2010'],
    'Calf Raises':                          ['4010','3010','2010'],
    // HAMSTRINGS
    'Deadlift':                             ['10X0','20X0'],
    'Trap Bar Deadlift':                    ['10X0','20X0'],
    'Snatch Grip Romanian DL':              ['4010','3010','2010'],
    'Snatch Grip Deficit RDL':              ['4010','3010','2010'],
    'Snatch Pull':                          ['10X0'],
    'Rack Pull DL':                         ['10X0'],
    'Rack Pull Clean Pull':                 ['10X0'],
    'Rack Pull Snatch Pull':                ['10X0'],
    'Lying Leg Curl':                       ['4010','3010','2010'],
    'Nordic Curl':                          ['4010','3010','2010'],
    'Glute Ham Raise':                      ['4010','3010','2010'],
    'Romanian Deadlift':                    ['4010'],
    'Single Leg RDL':                       ['4010','3010'],
    'Back Extensions':                      ['4010','3010'],
    'Back Extensions Snatch Grip':          ['4010','3010'],
    'Single Leg Back Extensions':           ['4010','3010'],
    'Good Morning':                         ['4010','3010'],
    'Reverse Hyperextensions':              ['1010'],
    // BICEPS
    'Chin Up':                              ['4010','3010','2010'],
    'Close Grip Chin Up':                   ['4010','3010','2010'],
    'Incline Dumbbell Curl':                ['4010','3010','2010'],
    'Barbell Curl':                         ['4010','3010','2010'],
    'Preacher Curl':                        ['4010','3010','2010'],
    'Supinated Close Grip Lat Pulldown':    ['4010','3010','2010'],
    'Machine Preacher Curl':                ['4010','3010','2010'],
    'Dumbbell Curl':                        ['2010','1010'],
    'Hammer Curl':                          ['2010','1010'],
    'Anatoly Curl':                         ['1010'],
    'Zottman Curl':                         ['4010','3010'],
    'Concentration Curl':                   ['4010','3010','2010'],
    'Drag Curl':                            ['4010','3010','2010'],
    'Cable Curl':                           ['4010','3010','2010'],
    'Single-Arm Cable Curl':                ['4010','3010','2010'],
    'High Cable Curl':                      ['4010','3010','2010'],
    // TRICEPS
    'Close-Grip Bench Press':               ['4010','3010','2010'],
    'Weighted V Dips':                      ['3010','2010'],
    'Skull Crushers EZ-Bar':                ['4010','3010','2010'],
    'Skull Crushers DB':                    ['4010','3010','2010'],
    'Dumbbell Kickbacks':                   ['4010','3010','2010'],
    'Cable Triceps Pushdown':               ['4010','3010','2010'],
    'Diamond Push-Ups':                     ['4010','3010','2010'],
    // SHOULDERS
    'Barbell Overhead Press':               ['3010','2010'],
    'Landmine Press':                       ['3010','4010','2010'],
    'Behind-the-Neck Overhead Press (Seated)':   ['3010','4010','2010'],
    'Behind-the-Neck Overhead Press (Standing)': ['3010','4010','2010'],
    'Behind-the-Neck Snatch-Grip Press':    ['3010','2010'],
    'Dumbbell Shoulder Press':              ['3010','4010','2010'],
    'Arnold Press':                         ['3010','2010'],
    'Leaning Lateral Raise':                ['2010'],
    'Bent-Over Dumbbell Rear Delt Raise':   ['2010'],
    'Chest-Supported Rear Delt Raise':      ['2010'],
    'External Rotation (Cable/Band)':       ['3010','4010','2010'],
    'External Rotation Dumbbell (Seated)':  ['3010','4010','2010'],
    'Internal Rotation (Cable/Band)':       ['3010','4010','2010'],
  };

  const strengthExerciseTempos = {
    // CHEST
    'Bench Press':                          ['4010','30X0','20X0','X0X0','32X1'],
    'Chest Press':                          ['4010','30X0','20X0'],
    'Incline Dumbbell Press':               ['4010','30X0','20X0','31X0'],
    'Plate-Loaded Chest Press':             ['4010','30X0','20X0'],
    'Push-ups':                             ['4010','30X0','20X0','31X1','X0X0'],
    'Neutral Grip Trapbar Push-ups':        ['4010','30X0','20X0','31X1','X0X0'],
    'Decline Push-up':                      ['4010','30X0','20X0','31X1','X0X0'],
    'Weighted Push-up':                     ['4010','30X0','20X0','31X1','X0X0'],
    'Cable Flies':                          ['3010'],
    'Dumbbell Chest Fly':                   ['4010','30X0','20X0','31X1'],
    'Incline Dumbbell Fly':                 ['4010','30X0','20X0','31X1'],
    'Seated Chest Fly':                     ['4010','30X0','20X0','31X1'],
    'Chest Dips':                           ['30X0','20X0'],
    // BACK
    'Pull-ups':                             ['4010','30X0','20X0','X0X0','30X2'],
    'Pull-ups Neutral Grip':                ['4010','30X0','20X0','X0X0','30X2'],
    'Lat Pulldown':                         ['4010','30X0','20X0'],
    'T-Bar Row':                            ['4010','3010','2010'],
    'Pendlay Row':                          ['X0X0'],
    'High Pulls':                           ['X0X0'],
    'Barbell Row':                          ['3010','2010'],
    'Chest-Supported Row':                  ['4010','3010','2010'],
    'One-Arm Dumbbell Row':                 ['4010','30X0','20X0'],
    'Inverted Row':                         ['4010','30X0','20X0'],
    'Cable Row':                            ['4010','3010','2010'],
    // QUADS
    'Back Squat':                           ['4010','30X0','20X0','X0X0','32X1'],
    'Back Squat Heel Elevated':             ['4010','30X0','20X0','X0X0','32X1'],
    'Low Bar Back Squat':                   ['30X0','20X0','21X0'],
    'Box Back Squat':                       ['30X0','20X0'],
    'Pin Back Squat':                       ['30X0','20X0','X0X0'],
    'Eccentric Back Squat':                 ['(10)0X0'],
    'Front Squat':                          ['4010','30X0','20X0','X0X0','32X1'],
    'Front Squat Heel Elevated':            ['4010','30X0','20X0','X0X0','32X1'],
    'Box Front Squat':                      ['30X0','20X0'],
    'Pin Front Squat':                      ['30X0','20X0','X0X0'],
    'Eccentric Front Squat':                ['(10)0X0'],
    'Belt Squat':                           ['X0X0','30X0','20X0'],
    'Bulgarian Squat w Dumbbells':          ['4010','3010','2010'],
    'Bulgarian Squat w Kettlebells':        ['4010','3010','2010'],
    'Bulgarian Back Squat':                 ['30X0','20X0'],
    'Bulgarian Front Squat':               ['30X0','20X0'],
    'Dumbbell Lunges':                      ['1010'],
    'Leg Press':                            ['4010','3010','2010'],
    'Leg Extension':                        ['4010','3010','2010'],
    'Calf Raises':                          ['4010','30X0','20X0'],
    // HAMSTRINGS
    'Deadlift':                             ['10X0','20X0'],
    'Trap Bar Deadlift':                    ['10X0','20X0','X0X0'],
    'Snatch Grip Romanian DL':              ['4010','3010','2010'],
    'Snatch Grip Deficit RDL':              ['4010','3010','2010'],
    'Snatch Pull':                          ['10X0'],
    'Rack Pull DL':                         ['10X0'],
    'Rack Pull Clean Pull':                 ['10X0'],
    'Rack Pull Snatch Pull':                ['10X0'],
    'Lying Leg Curl':                       ['4010','3010','20X0'],
    'Nordic Curl':                          ['4010','3010','20X0'],
    'Glute Ham Raise':                      ['4010','3010','20X0'],
    'Romanian Deadlift':                    ['4010'],
    'Single Leg RDL':                       ['4010','3010'],
    'Back Extensions':                      ['4010','3010'],
    'Back Extensions Snatch Grip':          ['4010','3010'],
    'Single Leg Back Extensions':           ['4010','3010'],
    'Good Morning':                         ['4010','3010'],
    'Reverse Hyperextensions':              ['1010'],
    // BICEPS
    'Chin Up':                              ['4010','3010','20X0','20X2'],
    'Close Grip Chin Up':                   ['4010','3010','20X0','20X2'],
    'Incline Dumbbell Curl':                ['4010','3010','2010'],
    'Barbell Curl':                         ['4010','3010','20X0'],
    'Preacher Curl':                        ['4010','3010','20X0'],
    'Supinated Close Grip Lat Pulldown':    ['4010','3010','20X0'],
    'Machine Preacher Curl':                ['4010','3010','20X0'],
    'Dumbbell Curl':                        ['2010','1010'],
    'Hammer Curl':                          ['2010','1010'],
    'Anatoly Curl':                         ['1010'],
    'Zottman Curl':                         ['4010','3010'],
    'Concentration Curl':                   ['4010','3010','2010'],
    'Drag Curl':                            ['4010','3010','2010'],
    'Cable Curl':                           ['4010','3010','2010'],
    'Single-Arm Cable Curl':                ['4010','3010','2010'],
    'High Cable Curl':                      ['4010','3010','2010'],
    'Reverse Curl':                         ['4010','3010'],
    'Scott EZ Bar Curl':                    ['4010','3010'],
    // TRICEPS
    'Close-Grip Bench Press':               ['4010','3010','20X0'],
    'Weighted V Dips':                      ['3010','2010'],
    'Skull Crushers EZ-Bar':                ['4010','3010','2010'],
    'Skull Crushers DB':                    ['4010','3010','2010'],
    'Dumbbell Kickbacks':                   ['4010','3010','2010'],
    'Cable Triceps Pushdown':               ['4010','3010','2010'],
    'Diamond Push-Ups':                     ['4010','3010','2010'],
    // SHOULDERS
    'Barbell Overhead Press':               ['3010','20X0','X0X0'],
    'Landmine Press':                       ['3010','4010','2010'],
    'Behind-the-Neck Overhead Press (Seated)':   ['3010','4010','2010'],
    'Behind-the-Neck Overhead Press (Standing)': ['3010','4010','2010'],
    'Behind-the-Neck Snatch-Grip Press':    ['3010','2010'],
    'Dumbbell Shoulder Press':              ['3010','4010','2010'],
    'Arnold Press':                         ['3010','2010'],
    'Leaning Lateral Raise':                ['2010'],
    'Bent-Over Dumbbell Rear Delt Raise':   ['2010'],
    'Chest-Supported Rear Delt Raise':      ['2010'],
    'External Rotation (Cable/Band)':       ['3010','4010','2010'],
    'External Rotation Dumbbell (Seated)':  ['3010','4010','2010'],
    'Internal Rotation (Cable/Band)':       ['3010','4010','2010'],
  };

  // Helper: pick a random tempo for a given exercise + goal
  const getExerciseTempo = (name, goal) => {
    const pool = goal === 'strength'
      ? (strengthExerciseTempos[name] || null)
      : (buildMuscleExerciseTempos[name] || null);
    if (pool && pool.length > 0) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
    // Fallback to global random tempo pools if exercise not in lookup
    return goal === 'strength' ? getRandomStrengthTempo() : getRandomBuildMuscleTempo();
  };
  // ─────────────────────────────────────────────────────────────────────────

  // Get a single random scheme for ALL main exercises in Build Muscle
  const getMainSchemeForBuildMuscle = (experience) => {
    const mainSchemeKeys = ['dropsets', 'gvt', 'post-exhaustion', 'wave-loading', 'wave-pump', 'eight-by-eight', 'cluster-hypertrophy'];
    
    if (experience === 'advanced') {
      // Add advanced-only schemes
      mainSchemeKeys.push('gvt-advanced', 'extended-eccentric', 'super-slow-eccentric', 'extreme-eccentric');
    }
    
    const schemeKey = mainSchemeKeys[Math.floor(Math.random() * mainSchemeKeys.length)];
    return buildMuscleSchemes[schemeKey];
  };

  // Get random secondary scheme for Build Muscle
  const getSecondarySchemeForBuildMuscle = () => {
    const secondarySchemeKeys = ['classic-hypertrophy', 'heavy-hypertrophy'];
    const schemeKey = secondarySchemeKeys[Math.floor(Math.random() * secondarySchemeKeys.length)];
    return buildMuscleSchemes[schemeKey];
  };

  // Get a single random scheme for ALL main exercises in Strength
  const getMainSchemeForStrength = () => {
    const mainSchemeKeys = ['one-six-method', 'five-four-three-two-one', 'cluster-strength', 'basic-strength', 'five-by-five', 'six-by-three', 'wave-531', 'wave-321'];
    const schemeKey = mainSchemeKeys[Math.floor(Math.random() * mainSchemeKeys.length)];
    return strengthSchemes[schemeKey];
  };

  // Get secondary scheme for Strength
  const getSecondarySchemeForStrength = () => {
    return strengthSchemes['basic-assistance'];
  };

  // Get main scheme for Power
  const getMainSchemeForPower = () => {
    return powerSchemes['explosive-power'];
  };

  // Get secondary scheme for Power
  const getSecondarySchemeForPower = () => {
    return powerSchemes['power-assistance'];
  };

  const generateWorkout = () => {
    let exercises;
    
    // Conditioning: skip all validation, generate directly
    if (settings.goal === 'v02-max') {
      const conditioningList = settings.conditioningType === 'vo2max' ? 'vo2max' : 'cardio';
      const conditioningExercises = exerciseDatabase['v02-max'][conditioningList];
      const chosen = conditioningExercises[Math.floor(Math.random() * conditioningExercises.length)];
      
      setWorkout([{
        label: 'A',
        name: chosen.name,
        setsReps: chosen.protocol || '',
        tempo: '—',
        rest: '—',
        schemeName: settings.conditioningType === 'vo2max' ? 'VO2 Max Training' : 'Zone 2 Cardio',
        schemeDescription: settings.conditioningType === 'vo2max' ? (chosen.description || '') : 'Low-intensity steady-state — maintain conversational pace, heart rate 60–70% of max',
        isMain: false,
        isConditioning: true,
        isVo2Max: settings.conditioningType === 'vo2max',
        vo2Protocol: settings.conditioningType === 'vo2max' ? chosen : null
      }]);
      setShowWorkout(true);
    window.scrollTo(0, 0);
      return;
    }
    
    if (settings.equipment === 'no-equipment') {
      exercises = exerciseDatabase[settings.goal]?.[settings.equipment]?.[settings.focus];
      if (!exercises || exercises.length === 0) {
        alert('No exercises found for this combination. Please try different settings.');
        return;
      }
    } else {
      const focusData = exerciseDatabase[settings.goal]?.[settings.equipment]?.[settings.focus];
      if (!focusData) {
        alert('No exercises found for this combination. Please try different settings.');
        return;
      }
    }
    
    const numPairs = 3;
    const numStraight = 4;
    
    // Get ONE main scheme for the entire workout based on goal
    let mainScheme = null;
    if (settings.goal === 'build-muscle') {
      mainScheme = getMainSchemeForBuildMuscle(settings.experience);
    } else if (settings.goal === 'strength') {
      mainScheme = getMainSchemeForStrength();
    } else if (settings.goal === 'fat-loss') {
      mainScheme = getMainSchemeForPower();
    }
    
    const pairs = [];
    
    // Helper function to create exercise object
    const createExercise = (label, name, isMain) => {
      // Special handling for Dumbbell Lunges and Reverse Hyper - always use 1010 tempo
      const uses1010Tempo = name === 'Dumbbell Lunges' || name === 'Reverse Hyperextensions';
      // Special handling for Reverse Hyper - always use Classic Hypertrophy scheme
      const isReverseHyper = name === 'Reverse Hyperextensions';
      
      if (settings.goal === 'build-muscle') {
        if (isMain) {
          // Use Classic Hypertrophy for Reverse Hyper, otherwise use mainScheme
          const scheme = isReverseHyper ? buildMuscleSchemes['classic-hypertrophy'] : mainScheme;
          return {
            label,
            name,
            setsReps: scheme.setsReps,
            tempo: getExerciseTempo(name, 'build-muscle'),
            rest: scheme.rest,
            schemeName: scheme.name,
            schemeDescription: scheme.description,
            schemeExample: scheme.example,
            isMain: true
          };
        } else {
          const scheme = isReverseHyper ? buildMuscleSchemes['classic-hypertrophy'] : getSecondarySchemeForBuildMuscle();
          return {
            label,
            name,
            setsReps: scheme.setsReps,
            tempo: getExerciseTempo(name, 'build-muscle'),
            rest: scheme.rest,
            schemeName: scheme.name,
            schemeDescription: scheme.description,
            isMain: false
          };
        }
      } else if (settings.goal === 'strength') {
        if (isMain) {
          return {
            label,
            name,
            setsReps: mainScheme.setsReps,
            tempo: getExerciseTempo(name, 'strength'),
            rest: mainScheme.rest,
            schemeName: mainScheme.name,
            schemeDescription: mainScheme.description,
            schemeExample: mainScheme.example,
            isMain: true
          };
        } else {
          const scheme = getSecondarySchemeForStrength();
          return {
            label,
            name,
            setsReps: scheme.setsReps,
            tempo: getExerciseTempo(name, 'strength'),
            rest: scheme.rest,
            schemeName: scheme.name,
            schemeDescription: scheme.description,
            isMain: false
          };
        }
      } else if (settings.goal === 'fat-loss') {
        // Power goal (labeled as "Power" in UI but uses 'fat-loss' internally)
        
        // Check if this exercise has a specific scheme in powerExerciseSchemes
        const exerciseSpecificSchemes = powerExerciseSchemes[name] || null;
        
        if (exerciseSpecificSchemes) {
          // Pick a random variation from the exercise's scheme list
          const chosen = exerciseSpecificSchemes[Math.floor(Math.random() * exerciseSpecificSchemes.length)];
          const isPlyoExercise = plyometricExercises.includes(name);
          return {
            label,
            name,
            setsReps: chosen.setsReps,
            tempo: chosen.tempo,
            rest: chosen.rest,
            schemeName: chosen.scheme || (isPlyoExercise ? 'Velocity Focused' : 'Power'),
            schemeDescription: chosen.description || (isPlyoExercise ? 'Explosive movement — max intent, full recovery between sets' : (chosen.scheme || '')),
            schemeExample: chosen.example,
            isMain: isMain,
            isPlyometric: isPlyoExercise
          };
        }
        
        // Check if this is a plyometric/medicine ball exercise — always gets fixed 3×3
        const isPlyometric = plyometricExercises.includes(name);
        
        if (isPlyometric) {
          return {
            label,
            name,
            setsReps: '3 × 3',
            tempo: '10X0',
            rest: '60-90 sec',
            schemeName: 'Velocity Focused',
            schemeDescription: 'Explosive movement — max intent, full recovery between sets',
            isMain: false,
            isPlyometric: true
          };
        } else if (isMain) {
          const powerMainScheme = getMainSchemeForPower();
          return {
            label,
            name,
            setsReps: powerMainScheme.setsReps,
            tempo: uses1010Tempo ? '1010' : powerMainScheme.tempo,
            rest: powerMainScheme.rest,
            schemeName: powerMainScheme.name,
            schemeDescription: powerMainScheme.description,
            schemeExample: powerMainScheme.example,
            isMain: true
          };
        } else {
          const scheme = getSecondarySchemeForPower();
          return {
            label,
            name,
            setsReps: scheme.setsReps,
            tempo: uses1010Tempo ? '1010' : scheme.tempo,
            rest: scheme.rest,
            schemeName: scheme.name,
            schemeDescription: scheme.description,
            isMain: false
          };
        }
      } else {
        // Other goals (v02-max) use standard schemes
        let sets, reps, tempo, rest;
        sets = 5;
        reps = '12-15';
        tempo = uses1010Tempo ? '1010' : '10X0';
        rest = '45 sec';
        return {
          label,
          name,
          setsReps: `${sets} × ${reps}`,
          tempo,
          rest,
          isMain
        };
      }
    };
    
    if (settings.equipment === 'no-equipment') {
      const shuffled = [...exercises].sort(() => Math.random() - 0.5);
      
      if (settings.workoutStyle === 'paired') {
        for (let i = 0; i < 6 && i < shuffled.length; i += 2) {
          const pairLetter = String.fromCharCode(65 + Math.floor(i / 2));
          const isMainPair = i === 0;
          if (shuffled[i]) pairs.push(createExercise(`${pairLetter}1`, shuffled[i], isMainPair));
          if (shuffled[i + 1]) pairs.push(createExercise(`${pairLetter}2`, shuffled[i + 1], isMainPair));
        }
      } else {
        for (let i = 0; i < numStraight && i < shuffled.length; i++) {
          const letter = String.fromCharCode(65 + i);
          pairs.push(createExercise(letter, shuffled[i], i === 0));
        }
      }
    } else {
      const focusData = exerciseDatabase[settings.goal][settings.equipment][settings.focus];
      
      if (settings.workoutStyle === 'paired') {
        if (settings.focus === 'chest-back') {
          // Power + Chest&Back uses 3-tier A/B/C structure
          if (settings.goal === 'fat-loss' && focusData.plyometric) {
            const plyoList = [...focusData.plyometric];
            const mainPowerList = [...focusData.mainPowerLift];
            const speedStrengthList = [...focusData.speedStrength];
            
            // A = Plyometric (3×3)
            if (plyoList.length > 0) {
              const plyoEx = plyoList[Math.floor(Math.random() * plyoList.length)];
              pairs.push(createExercise('A', plyoEx, false));
            }
            
            // B = Main Power Lift (gets MAIN power scheme)
            let chosenMainEx = null;
            if (mainPowerList.length > 0) {
              chosenMainEx = mainPowerList[Math.floor(Math.random() * mainPowerList.length)];
              pairs.push(createExercise('B', chosenMainEx, true));
            }
            
            // C = Speed-Strength Lift (gets secondary power scheme) — avoid same exercise as B
            if (speedStrengthList.length > 0) {
              const filteredSpeed = chosenMainEx ? speedStrengthList.filter(ex => ex !== chosenMainEx) : speedStrengthList;
              const speedPool = filteredSpeed.length > 0 ? filteredSpeed : speedStrengthList;
              const speedEx = speedPool[Math.floor(Math.random() * speedPool.length)];
              pairs.push(createExercise('C', speedEx, false));
            }
            
            // D = Posterior Chain Accessory (gets secondary power scheme)
            const posteriorList = focusData.posteriorAccessory ? [...focusData.posteriorAccessory] : [];
            if (posteriorList.length > 0) {
              const postEx = posteriorList[Math.floor(Math.random() * posteriorList.length)];
              pairs.push(createExercise('D', postEx, false));
            }
          } else {
            // Non-Power workouts: Regular chest/back paired logic
            const chestMain = [...focusData.chest.main];
            const chestSecondary = [...focusData.chest.secondary];
            const backMain = [...focusData.back.main];
            const backSecondary = [...focusData.back.secondary];
            
            for (let i = 0; i < numPairs; i++) {
              const pairLetter = String.fromCharCode(65 + i);
              const isMainPair = i === 0;
              
              if (isMainPair) {
                const chestEx = chestMain[Math.floor(Math.random() * chestMain.length)];
                const backEx = backMain[Math.floor(Math.random() * backMain.length)];
                pairs.push(createExercise(`${pairLetter}1`, chestEx, true));
                pairs.push(createExercise(`${pairLetter}2`, backEx, true));
              } else {
                const chestEx = chestSecondary.length > 0 ? chestSecondary[Math.floor(Math.random() * chestSecondary.length)] : chestMain[Math.floor(Math.random() * chestMain.length)];
                const backEx = backSecondary.length > 0 ? backSecondary[Math.floor(Math.random() * backSecondary.length)] : backMain[Math.floor(Math.random() * backMain.length)];
                pairs.push(createExercise(`${pairLetter}1`, chestEx, false));
                pairs.push(createExercise(`${pairLetter}2`, backEx, false));
              }
            }
          }
        } else if (settings.focus === 'legs') {
          // Power + Legs uses special 3-tier A/B/C structure (regardless of paired/straight setting)
          if (settings.goal === 'fat-loss' && focusData.plyometric) {
            const plyoList = [...focusData.plyometric];
            const mainPowerList = [...focusData.mainPowerLift];
            const speedStrengthList = [...focusData.speedStrength];
            
            // A = Plyometric (3×3)
            if (plyoList.length > 0) {
              const plyoEx = plyoList[Math.floor(Math.random() * plyoList.length)];
              pairs.push(createExercise('A', plyoEx, false));
            }
            
            // B = Main Power Lift (gets MAIN power scheme)
            if (mainPowerList.length > 0) {
              const mainEx = mainPowerList[Math.floor(Math.random() * mainPowerList.length)];
              pairs.push(createExercise('B', mainEx, true));
            }
            
            // C = Speed-Strength Lift (gets secondary power scheme)
            if (speedStrengthList.length > 0) {
              const speedEx = speedStrengthList[Math.floor(Math.random() * speedStrengthList.length)];
              pairs.push(createExercise('C', speedEx, false));
            }
            
            // D = Posterior Chain Accessory (gets secondary power scheme)
            const posteriorList = focusData.posteriorAccessory ? [...focusData.posteriorAccessory] : [];
            if (posteriorList.length > 0) {
              const postEx = posteriorList[Math.floor(Math.random() * posteriorList.length)];
              pairs.push(createExercise('D', postEx, false));
            }
          } else {
            // Non-Power workouts: Regular quads/hamstrings paired logic
            const quadsMain = [...focusData.quads.main];
            const quadsSecondary = [...focusData.quads.secondary];
            const hamstringsMain = [...focusData.hamstrings.main];
            const hamstringsSecondary = [...focusData.hamstrings.secondary];
            
            for (let i = 0; i < numPairs; i++) {
              const pairLetter = String.fromCharCode(65 + i);
              const isMainPair = i === 0;
              
              if (isMainPair) {
                const quadEx = quadsMain[Math.floor(Math.random() * quadsMain.length)];
                const hamEx = hamstringsMain[Math.floor(Math.random() * hamstringsMain.length)];
                pairs.push(createExercise(`${pairLetter}1`, quadEx, true));
                pairs.push(createExercise(`${pairLetter}2`, hamEx, true));
              } else {
                const quadEx = quadsSecondary.length > 0 ? quadsSecondary[Math.floor(Math.random() * quadsSecondary.length)] : quadsMain[Math.floor(Math.random() * quadsMain.length)];
                const hamEx = hamstringsSecondary.length > 0 ? hamstringsSecondary[Math.floor(Math.random() * hamstringsSecondary.length)] : hamstringsMain[Math.floor(Math.random() * hamstringsMain.length)];
                pairs.push(createExercise(`${pairLetter}1`, quadEx, false));
                pairs.push(createExercise(`${pairLetter}2`, hamEx, false));
              }
            }
          }
        } else if (settings.focus === 'arms') {
          // Power + Arms uses 3-tier A/B/C/D structure
          if (settings.goal === 'fat-loss' && focusData.plyometric) {
            const plyoList = [...focusData.plyometric];
            const mainPowerList = [...focusData.mainPowerLift];
            const speedStrengthList = [...focusData.speedStrength];
            
            // A = Plyometric (3×3)
            if (plyoList.length > 0) {
              const plyoEx = plyoList[Math.floor(Math.random() * plyoList.length)];
              pairs.push(createExercise('A', plyoEx, false));
            }
            
            // B = Main Power Lift (gets MAIN power scheme)
            let chosenMainEx = null;
            if (mainPowerList.length > 0) {
              chosenMainEx = mainPowerList[Math.floor(Math.random() * mainPowerList.length)];
              pairs.push(createExercise('B', chosenMainEx, true));
            }
            
            // C = Speed-Strength Lift — avoid same exercise as B
            if (speedStrengthList.length > 0) {
              const filteredSpeed = chosenMainEx ? speedStrengthList.filter(ex => ex !== chosenMainEx) : speedStrengthList;
              const speedPool = filteredSpeed.length > 0 ? filteredSpeed : speedStrengthList;
              const speedEx = speedPool[Math.floor(Math.random() * speedPool.length)];
              pairs.push(createExercise('C', speedEx, false));
            }
            
            // D = Rotator Cuff Accessory
            const posteriorList = focusData.posteriorAccessory ? [...focusData.posteriorAccessory] : [];
            if (posteriorList.length > 0) {
              const postEx = posteriorList[Math.floor(Math.random() * posteriorList.length)];
              pairs.push(createExercise('D', postEx, false));
            }
          } else {
          // Non-Power workouts: Regular biceps/triceps/shoulders paired logic
          const bicepsMain = [...focusData.biceps.main];
          const bicepsSecondary = [...focusData.biceps.secondary];
          const tricepsMain = [...focusData.triceps.main];
          const tricepsSecondary = [...focusData.triceps.secondary];
          const shouldersMain = focusData.shoulders ? [...focusData.shoulders.main] : [];
          const shouldersSecondary = focusData.shoulders ? [...focusData.shoulders.secondary] : [];
          
          // Randomly choose between two workout structures
          const workoutOption = Math.random() < 0.5 ? 1 : 2;
          
          if (workoutOption === 1) {
            // Option 1: A1 Biceps Main + A2 Triceps Main, B1 Shoulders Main (secondary scheme) + B2 Biceps Secondary, C1/C2 Secondary
            for (let i = 0; i < numPairs; i++) {
              const pairLetter = String.fromCharCode(65 + i);
              
              if (i === 0) {
                const biEx = bicepsMain.length > 0 ? bicepsMain[Math.floor(Math.random() * bicepsMain.length)] : bicepsSecondary[Math.floor(Math.random() * bicepsSecondary.length)];
                const triEx = tricepsMain.length > 0 ? tricepsMain[Math.floor(Math.random() * tricepsMain.length)] : tricepsSecondary[Math.floor(Math.random() * tricepsSecondary.length)];
                pairs.push(createExercise(`${pairLetter}1`, biEx, true));
                pairs.push(createExercise(`${pairLetter}2`, triEx, true));
              } else if (i === 1 && shouldersMain.length > 0) {
                const shoulderEx = shouldersMain[Math.floor(Math.random() * shouldersMain.length)];
                const biEx = bicepsSecondary.length > 0 ? bicepsSecondary[Math.floor(Math.random() * bicepsSecondary.length)] : bicepsMain[Math.floor(Math.random() * bicepsMain.length)];
                pairs.push(createExercise(`${pairLetter}1`, shoulderEx, false));
                pairs.push(createExercise(`${pairLetter}2`, biEx, false));
              } else {
                const biEx = bicepsSecondary.length > 0 ? bicepsSecondary[Math.floor(Math.random() * bicepsSecondary.length)] : bicepsMain[Math.floor(Math.random() * bicepsMain.length)];
                const triEx = tricepsSecondary.length > 0 ? tricepsSecondary[Math.floor(Math.random() * tricepsSecondary.length)] : tricepsMain[Math.floor(Math.random() * tricepsMain.length)];
                pairs.push(createExercise(`${pairLetter}1`, biEx, false));
                pairs.push(createExercise(`${pairLetter}2`, triEx, false));
              }
            }
          } else {
            // Option 2: A1 Shoulder Main + A2 Biceps Main, B1 Triceps (secondary scheme) + B2 Biceps Secondary, C1/C2 Secondary
            for (let i = 0; i < numPairs; i++) {
              const pairLetter = String.fromCharCode(65 + i);
              
              if (i === 0 && shouldersMain.length > 0) {
                const shoulderEx = shouldersMain[Math.floor(Math.random() * shouldersMain.length)];
                const biEx = bicepsMain.length > 0 ? bicepsMain[Math.floor(Math.random() * bicepsMain.length)] : bicepsSecondary[Math.floor(Math.random() * bicepsSecondary.length)];
                pairs.push(createExercise(`${pairLetter}1`, shoulderEx, true));
                pairs.push(createExercise(`${pairLetter}2`, biEx, true));
              } else if (i === 1) {
                const triEx = tricepsMain.length > 0 ? tricepsMain[Math.floor(Math.random() * tricepsMain.length)] : tricepsSecondary[Math.floor(Math.random() * tricepsSecondary.length)];
                const biEx = bicepsSecondary.length > 0 ? bicepsSecondary[Math.floor(Math.random() * bicepsSecondary.length)] : bicepsMain[Math.floor(Math.random() * bicepsMain.length)];
                pairs.push(createExercise(`${pairLetter}1`, triEx, false));
                pairs.push(createExercise(`${pairLetter}2`, biEx, false));
              } else {
                const triEx = tricepsSecondary.length > 0 ? tricepsSecondary[Math.floor(Math.random() * tricepsSecondary.length)] : tricepsMain[Math.floor(Math.random() * tricepsMain.length)];
                const shoulderEx = shouldersSecondary.length > 0 ? shouldersSecondary[Math.floor(Math.random() * shouldersSecondary.length)] : (tricepsSecondary.length > 0 ? tricepsSecondary[Math.floor(Math.random() * tricepsSecondary.length)] : bicepsSecondary[Math.floor(Math.random() * bicepsSecondary.length)]);
                pairs.push(createExercise(`${pairLetter}1`, triEx, false));
                pairs.push(createExercise(`${pairLetter}2`, shoulderEx, false));
              }
            }
          }
          }
        } else {
          // Power + Full Body / Upper Body with 3-tier structure
          if (settings.goal === 'fat-loss' && focusData.plyometric) {
            const plyoList = [...focusData.plyometric];
            const mainPowerList = [...focusData.mainPowerLift];
            const speedStrengthList = [...focusData.speedStrength];
            
            // A = Plyometric (3×3)
            if (plyoList.length > 0) {
              const plyoEx = plyoList[Math.floor(Math.random() * plyoList.length)];
              pairs.push(createExercise('A', plyoEx, false));
            }
            
            // B = Main Power Lift (gets MAIN power scheme)
            let chosenMainEx = null;
            if (mainPowerList.length > 0) {
              chosenMainEx = mainPowerList[Math.floor(Math.random() * mainPowerList.length)];
              pairs.push(createExercise('B', chosenMainEx, true));
            }
            
            // C = Speed-Strength Lift (gets secondary power scheme) — avoid same exercise as B
            if (speedStrengthList.length > 0) {
              const filteredSpeed = chosenMainEx ? speedStrengthList.filter(ex => ex !== chosenMainEx) : speedStrengthList;
              const speedPool = filteredSpeed.length > 0 ? filteredSpeed : speedStrengthList;
              const speedEx = speedPool[Math.floor(Math.random() * speedPool.length)];
              pairs.push(createExercise('C', speedEx, false));
            }
            
            // D = Posterior Chain Accessory (gets secondary power scheme)
            const posteriorList = focusData.posteriorAccessory ? [...focusData.posteriorAccessory] : [];
            if (posteriorList.length > 0) {
              const postEx = posteriorList[Math.floor(Math.random() * posteriorList.length)];
              pairs.push(createExercise('D', postEx, false));
            }
          } else {
          const main = [...focusData.main];
          const secondary = [...focusData.secondary];
          
          // For Power workouts (upper-body etc.): Plyometric is standalone A, main programming starts at B
          if (settings.goal === 'fat-loss') {
            const nonPlyoMain = main.filter(ex => !plyometricExercises.includes(ex));
            const nonPlyoSecondary = secondary.filter(ex => !plyometricExercises.includes(ex));
            
            // A = Standalone plyometric exercise (3×3, not main)
            if (plyoExercises.length > 0) {
              const plyoEx = plyoExercises[Math.floor(Math.random() * plyoExercises.length)];
              pairs.push(createExercise('A', plyoEx, false));
            }
            
            const shuffledMain = nonPlyoMain.sort(() => Math.random() - 0.5);
            const shuffledSecondary = nonPlyoSecondary.sort(() => Math.random() - 0.5);
            
            // B1/B2 = First MAIN pair (gets main power scheme)
            // C1/C2, D1/D2 = Secondary pairs
            let mainIndex = 0;
            let secIndex = 0;
            
            for (let pairNum = 0; pairNum < numPairs; pairNum++) {
              const pairLetter = String.fromCharCode(66 + pairNum); // Start at B
              const isMainPair = pairNum === 0;
              
              // Pick first exercise of pair
              let ex1 = null;
              if (mainIndex < shuffledMain.length) {
                ex1 = shuffledMain[mainIndex];
                mainIndex++;
              } else if (secIndex < shuffledSecondary.length) {
                ex1 = shuffledSecondary[secIndex];
                secIndex++;
              }
              
              // Pick second exercise of pair
              let ex2 = null;
              if (mainIndex < shuffledMain.length) {
                ex2 = shuffledMain[mainIndex];
                mainIndex++;
              } else if (secIndex < shuffledSecondary.length) {
                ex2 = shuffledSecondary[secIndex];
                secIndex++;
              }
              
              if (ex1) pairs.push(createExercise(`${pairLetter}1`, ex1, isMainPair));
              if (ex2) pairs.push(createExercise(`${pairLetter}2`, ex2, isMainPair));
            }
          } else {
            // Non-Power workouts: Regular logic
            const shuffledMain = main.sort(() => Math.random() - 0.5);
            const shuffledSecondary = secondary.sort(() => Math.random() - 0.5);
            
            // First pair (A) uses main exercises
            if (shuffledMain.length >= 2) {
              pairs.push(createExercise('A1', shuffledMain[0], true));
              pairs.push(createExercise('A2', shuffledMain[1], true));
            } else if (shuffledMain.length === 1) {
              pairs.push(createExercise('A1', shuffledMain[0], true));
              if (shuffledSecondary.length > 0) {
                pairs.push(createExercise('A2', shuffledSecondary[0], true));
              }
            }
            
            // Remaining pairs (B, C) use secondary exercises
            let secondaryIndex = shuffledMain.length < 2 ? 1 : 0;
            for (let pairNum = 1; pairNum < numPairs; pairNum++) {
              const pairLetter = String.fromCharCode(65 + pairNum);
              if (secondaryIndex < shuffledSecondary.length) {
                pairs.push(createExercise(`${pairLetter}1`, shuffledSecondary[secondaryIndex], false));
                secondaryIndex++;
              }
              if (secondaryIndex < shuffledSecondary.length) {
                pairs.push(createExercise(`${pairLetter}2`, shuffledSecondary[secondaryIndex], false));
                secondaryIndex++;
              }
            }
          }
          }
        }
      } else {
        // Straight sets
        
        // Power + Legs/Full-Body/Upper-Body/Chest-Back uses the 3-tier A/B/C structure regardless of paired/straight
        if (settings.goal === 'fat-loss' && (settings.focus === 'legs' || settings.focus === 'full-body' || settings.focus === 'upper-body' || settings.focus === 'chest-back' || settings.focus === 'arms') && focusData.plyometric) {
          const plyoList = [...focusData.plyometric];
          const mainPowerList = [...focusData.mainPowerLift];
          const speedStrengthList = [...focusData.speedStrength];
          
          // A = Plyometric (3×3)
          if (plyoList.length > 0) {
            const plyoEx = plyoList[Math.floor(Math.random() * plyoList.length)];
            pairs.push(createExercise('A', plyoEx, false));
          }
          
          // B = Main Power Lift (gets MAIN power scheme)
          let chosenMainEx = null;
          if (mainPowerList.length > 0) {
            chosenMainEx = mainPowerList[Math.floor(Math.random() * mainPowerList.length)];
            pairs.push(createExercise('B', chosenMainEx, true));
          }
          
          // C = Speed-Strength Lift (gets secondary power scheme) — avoid same exercise as B
          if (speedStrengthList.length > 0) {
            const filteredSpeed = chosenMainEx ? speedStrengthList.filter(ex => ex !== chosenMainEx) : speedStrengthList;
            const speedPool = filteredSpeed.length > 0 ? filteredSpeed : speedStrengthList;
            const speedEx = speedPool[Math.floor(Math.random() * speedPool.length)];
            pairs.push(createExercise('C', speedEx, false));
          }
          
          // D = Posterior Chain Accessory (gets secondary power scheme)
          const posteriorList = focusData.posteriorAccessory ? [...focusData.posteriorAccessory] : [];
          if (posteriorList.length > 0) {
            const postEx = posteriorList[Math.floor(Math.random() * posteriorList.length)];
            pairs.push(createExercise('D', postEx, false));
          }
        } else if (settings.focus === 'chest-back' || settings.focus === 'legs' || settings.focus === 'arms') {
          let mainExercises = [];
          let secondaryExercises = [];
          
          if (settings.focus === 'chest-back') {
            if (focusData.chest) {
              mainExercises = [...focusData.chest.main, ...focusData.back.main];
              secondaryExercises = [...focusData.chest.secondary, ...focusData.back.secondary];
            }
          } else if (settings.focus === 'legs') {
            if (focusData.quads) {
              mainExercises = [...focusData.quads.main, ...focusData.hamstrings.main];
              secondaryExercises = [...focusData.quads.secondary, ...focusData.hamstrings.secondary];
            }
          } else if (settings.focus === 'arms') {
            if (focusData.biceps) {
              mainExercises = [...focusData.biceps.main, ...focusData.triceps.main];
              secondaryExercises = [...focusData.biceps.secondary, ...focusData.triceps.secondary];
              if (focusData.shoulders) {
                mainExercises = [...mainExercises, ...focusData.shoulders.main];
                secondaryExercises = [...secondaryExercises, ...focusData.shoulders.secondary];
              }
            }
          }
          
          // For Power workouts: Plyometric is standalone A, main programming starts at B
          if (settings.goal === 'fat-loss') {
            const plyoExercises = [...mainExercises, ...secondaryExercises].filter(ex => plyometricExercises.includes(ex));
            const nonPlyoMain = mainExercises.filter(ex => !plyometricExercises.includes(ex));
            const nonPlyoSecondary = secondaryExercises.filter(ex => !plyometricExercises.includes(ex));
            
            // A = Standalone plyometric exercise (3×3, not main)
            if (plyoExercises.length > 0) {
              const plyoEx = plyoExercises[Math.floor(Math.random() * plyoExercises.length)];
              pairs.push(createExercise('A', plyoEx, false));
            }
            
            const shuffledMain = nonPlyoMain.sort(() => Math.random() - 0.5);
            const shuffledSecondary = nonPlyoSecondary.sort(() => Math.random() - 0.5);
            
            // B = First MAIN exercise (gets main power scheme)
            // C, D = Secondary exercises
            let letterIndex = 1; // Start at B (66 = 'B')
            if (shuffledMain.length > 0) {
              const letter = String.fromCharCode(65 + letterIndex);
              pairs.push(createExercise(letter, shuffledMain[0], true));
              letterIndex++;
            }
            
            // Add more main if available
            for (let i = 1; i < shuffledMain.length && letterIndex < 4; i++) {
              const letter = String.fromCharCode(65 + letterIndex);
              pairs.push(createExercise(letter, shuffledMain[i], false));
              letterIndex++;
            }
            
            // Add secondary exercises
            for (let i = 0; i < shuffledSecondary.length && letterIndex < 5; i++) {
              const letter = String.fromCharCode(65 + letterIndex);
              pairs.push(createExercise(letter, shuffledSecondary[i], false));
              letterIndex++;
            }
          } else {
            // Non-Power workouts: Regular logic
            const shuffledMain = mainExercises.sort(() => Math.random() - 0.5);
            const shuffledSecondary = secondaryExercises.sort(() => Math.random() - 0.5);
            
            if (shuffledMain.length > 0) {
              pairs.push(createExercise('A', shuffledMain[0], true));
            }
            
            let letterIndex = 1;
            for (let i = 0; i < 3 && i < shuffledSecondary.length; i++) {
              const letter = String.fromCharCode(65 + letterIndex);
              pairs.push(createExercise(letter, shuffledSecondary[i], false));
              letterIndex++;
            }
          }
        } else {
          const main = [...focusData.main];
          const secondary = [...focusData.secondary];
          
          // For Power workouts: Plyometric is standalone A, main programming starts at B
          if (settings.goal === 'fat-loss') {
            const plyoExercises = [...main, ...secondary].filter(ex => plyometricExercises.includes(ex));
            const nonPlyoMain = main.filter(ex => !plyometricExercises.includes(ex));
            const nonPlyoSecondary = secondary.filter(ex => !plyometricExercises.includes(ex));
            
            // A = Standalone plyometric exercise (3×3, not main)
            if (plyoExercises.length > 0) {
              const plyoEx = plyoExercises[Math.floor(Math.random() * plyoExercises.length)];
              pairs.push(createExercise('A', plyoEx, false));
            }
            
            const shuffledMain = nonPlyoMain.sort(() => Math.random() - 0.5);
            const shuffledSecondary = nonPlyoSecondary.sort(() => Math.random() - 0.5);
            
            // B = First MAIN exercise (gets main power scheme)
            // C, D = Secondary exercises
            let letterIndex = 1; // Start at B
            if (shuffledMain.length > 0) {
              const letter = String.fromCharCode(65 + letterIndex);
              pairs.push(createExercise(letter, shuffledMain[0], true));
              letterIndex++;
            }
            
            // Add more main if available
            for (let i = 1; i < shuffledMain.length && letterIndex < 4; i++) {
              const letter = String.fromCharCode(65 + letterIndex);
              pairs.push(createExercise(letter, shuffledMain[i], false));
              letterIndex++;
            }
            
            // Add secondary exercises
            for (let i = 0; i < shuffledSecondary.length && letterIndex < 5; i++) {
              const letter = String.fromCharCode(65 + letterIndex);
              pairs.push(createExercise(letter, shuffledSecondary[i], false));
              letterIndex++;
            }
          } else {
            // Non-Power workouts: Regular logic
            const shuffledMain = main.sort(() => Math.random() - 0.5);
            const shuffledSecondary = secondary.sort(() => Math.random() - 0.5);
            
            if (shuffledMain.length > 0) {
              pairs.push(createExercise('A', shuffledMain[0], true));
            }
            
            let letterIndex = 1;
            for (let i = 0; i < 3 && i < shuffledSecondary.length; i++) {
              const letter = String.fromCharCode(65 + letterIndex);
              pairs.push(createExercise(letter, shuffledSecondary[i], false));
              letterIndex++;
            }
          }
        }
      }
    }
    
    setWorkout(pairs);
    setShowWorkout(true);
    window.scrollTo(0, 0);
  };

  // Get exercise-specific tempo phase descriptions
  const getTempoPhases = (exerciseName) => {
    const name = exerciseName.toLowerCase();
    // Squat variations — eccentric first (lowering down)
    if (name.includes('squat') || name.includes('lunge') || name.includes('bulgarian') || name.includes('leg press') || name.includes('step up') || name.includes('belt squat')) {
      return { concentricFirst: false, eccentric: '— lowering into the squat', bottom: '— at the bottom of the squat', concentric: '— standing back up', top: '— at the top, standing' };
    }
    // Deadlift / RDL — CONCENTRIC FIRST (pulling from floor)
    if (name.includes('deadlift') || name.includes('rdl') || name.includes('romanian') || name.includes('trap bar dead')) {
      return { concentricFirst: true, concentric: '— pulling the bar up from the floor', top: '— at lockout, standing tall', eccentric: '— lowering the bar back down', bottom: '— bar back at starting position' };
    }
    // Good morning / Back extensions / Reverse hyper — eccentric first
    if (name.includes('good morning') || name.includes('back extension') || name.includes('reverse hyper') || name.includes('snatch grip deficit')) {
      return { concentricFirst: false, eccentric: '— lowering the torso down', bottom: '— at the bottom stretch', concentric: '— raising the torso back up', top: '— at the top, torso upright' };
    }
    // Bench / Press (horizontal push) — eccentric first
    if (name.includes('bench') || name.includes('chest press') || name.includes('dumbbell press') || (name.includes('incline') && name.includes('press')) || name.includes('plate-loaded')) {
      return { concentricFirst: false, eccentric: '— lowering the bar to your chest', bottom: '— bar on chest / stretched position', concentric: '— pressing the bar up', top: '— at lockout, arms extended' };
    }
    // Push-ups — eccentric first
    if (name.includes('push-up') || name.includes('push up')) {
      return { concentricFirst: false, eccentric: '— lowering your body down', bottom: '— chest near the floor', concentric: '— pushing back up', top: '— at the top, arms extended' };
    }
    // Pull-ups / Chin-ups — CONCENTRIC FIRST (pulling up)
    if (name.includes('pull-up') || name.includes('chin up') || name.includes('chin-up')) {
      return { concentricFirst: true, concentric: '— pulling yourself up', top: '— at the top, chin over bar', eccentric: '— lowering yourself down', bottom: '— at the bottom, arms fully extended' };
    }
    // Lat pulldown — CONCENTRIC FIRST (pulling down)
    if (name.includes('pulldown') || name.includes('lat pull')) {
      return { concentricFirst: true, concentric: '— pulling the bar down to chest', top: '— bar at chest, lats squeezed', eccentric: '— letting the bar back up', bottom: '— arms fully extended overhead' };
    }
    // Rows — CONCENTRIC FIRST (pulling toward you)
    if (name.includes('row') || name.includes('face pull') || name.includes('pull-apart')) {
      return { concentricFirst: true, concentric: '— pulling the weight toward you', top: '— at peak contraction, squeezed', eccentric: '— lowering the weight away', bottom: '— arms extended, stretched position' };
    }
    // Curls — CONCENTRIC FIRST (curling up)
    if (name.includes('curl') || name.includes('bicep')) {
      return { concentricFirst: true, concentric: '— curling the weight up', top: '— at the top, biceps squeezed', eccentric: '— lowering the weight down', bottom: '— arms fully extended' };
    }
    // Triceps pushdown — CONCENTRIC FIRST
    if (name.includes('pushdown') || name.includes('cable tricep')) {
      return { concentricFirst: true, concentric: '— pushing the weight down', top: '— at full extension, triceps squeezed', eccentric: '— letting the weight back up', bottom: '— at the stretched position' };
    }
    // Triceps (other) — eccentric first
    if (name.includes('tricep') || name.includes('skull crush') || name.includes('kickback') || name.includes('dip') || name.includes('close-grip bench')) {
      return { concentricFirst: false, eccentric: '— lowering / extending the weight', bottom: '— at the stretched position', concentric: '— pressing / extending up', top: '— at lockout, triceps squeezed' };
    }
    // Overhead press — eccentric first
    if (name.includes('overhead') || name.includes('shoulder press') || name.includes('landmine press') || name.includes('clean & press')) {
      return { concentricFirst: false, eccentric: '— lowering the weight down', bottom: '— at shoulder level', concentric: '— pressing overhead', top: '— at lockout, arms overhead' };
    }
    // Olympic lifts / Cleans / Snatches / Pulls — CONCENTRIC FIRST
    if (name.includes('clean') || name.includes('snatch') || name.includes('halting pull') || name.includes('high pull')) {
      return { concentricFirst: true, concentric: '— pulling / catching the bar explosively', top: '— at the catch / finish position', eccentric: '— lowering the bar back down', bottom: '— bar at starting position' };
    }
    // Leg curl / Nordic — eccentric first
    if (name.includes('leg curl') || name.includes('nordic') || name.includes('glute ham')) {
      return { concentricFirst: false, eccentric: '— lowering (extending the legs)', bottom: '— legs extended / stretched', concentric: '— curling the weight up', top: '— at peak contraction' };
    }
    // Leg extension — CONCENTRIC FIRST
    if (name.includes('leg extension')) {
      return { concentricFirst: true, concentric: '— extending the legs up', top: '— at full extension, quads squeezed', eccentric: '— lowering the weight down', bottom: '— legs bent at the bottom' };
    }
    // Cable flies — eccentric first
    if (name.includes('fly') || name.includes('flies')) {
      return { concentricFirst: false, eccentric: '— opening arms / stretching', bottom: '— arms wide, chest stretched', concentric: '— bringing arms together', top: '— arms together, chest squeezed' };
    }
    // Default — eccentric first
    return { concentricFirst: false, eccentric: '— lowering phase', bottom: '— at the bottom position', concentric: '— lifting phase', top: '— at the top position' };
  };

  // Exercise Video Lookup — Google Drive file IDs
  // To add a video: upload to Google Drive → Share → Anyone with link → copy the file ID from the URL
  // URL format: https://drive.google.com/file/d/FILE_ID/view → just paste the FILE_ID below
  const exerciseVideos = {
    'Back Squat': '15WzZz9LNEw7mFWWS9DDKgyTYBRae9GzE',
    // 'Bench Press': 'YOUR_GOOGLE_DRIVE_FILE_ID_HERE',
    // 'Deadlift': 'YOUR_GOOGLE_DRIVE_FILE_ID_HERE',
    // Add more exercises as needed...
  };

  // Convert Google Drive file ID to embeddable video URL
  const getVideoUrl = (exerciseName) => {
    const fileId = exerciseVideos[exerciseName];
    if (!fileId) return null;
    return `https://drive.google.com/file/d/${fileId}/preview`;
  };

  // Animated Stick Figure Exercise Demo Component
  const ExerciseDemo = ({ exerciseName, onClose }) => {
    const [frame, setFrame] = useState(0);
    const [videoError, setVideoError] = useState(false);
    const totalFrames = 60;
    const videoUrl = getVideoUrl(exerciseName);
    const hasVideo = videoUrl && !videoError;
    
    useEffect(() => {
      if (!hasVideo) {
        const interval = setInterval(() => {
          setFrame(f => (f + 1) % totalFrames);
        }, 50);
        return () => clearInterval(interval);
      }
    }, [hasVideo]);
    
    // Progress cycles 0→1→0 for smooth back-and-forth
    const cycle = Math.abs((frame / (totalFrames / 2)) - 1);
    // progress: 0 = start position, 1 = end position
    const progress = cycle;
    
    const getExerciseAnimation = (name) => {
      const n = name.toLowerCase();
      
      // SQUAT PATTERN (standing → deep squat)
      if (n.includes('squat') || n.includes('lunge') || n.includes('bulgarian') || n.includes('leg press') || n.includes('belt squat')) {
        const kneeAngle = progress * 70;
        const hipDrop = progress * 45;
        const torsoLean = progress * 15;
        return {
          category: 'Squat Pattern',
          cues: ['Feet shoulder-width apart', 'Brace core, chest up', 'Push knees out over toes', 'Hips below parallel'],
          render: (
            <svg viewBox="0 0 200 260" className="w-full h-full">
              {/* Bar on back */}
              <line x1={70} y1={65 + hipDrop * 0.3 - torsoLean} x2={130} y2={65 + hipDrop * 0.3 - torsoLean} stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
              {/* Head */}
              <circle cx={100} cy={45 + hipDrop * 0.3} r={12} fill="none" stroke="white" strokeWidth="2.5" />
              {/* Torso */}
              <line x1={100} y1={57 + hipDrop * 0.3} x2={100 - torsoLean * 0.3} y2={120 + hipDrop * 0.5} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Upper arms (holding bar) */}
              <line x1={100} y1={70 + hipDrop * 0.3} x2={75} y2={65 + hipDrop * 0.3 - torsoLean} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={100} y1={70 + hipDrop * 0.3} x2={125} y2={65 + hipDrop * 0.3 - torsoLean} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Left leg */}
              <line x1={100 - torsoLean * 0.3} y1={120 + hipDrop * 0.5} x2={80 - progress * 10} y2={150 + hipDrop * 0.2} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={80 - progress * 10} y1={150 + hipDrop * 0.2} x2={75 - progress * 5} y2={210} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Right leg */}
              <line x1={100 - torsoLean * 0.3} y1={120 + hipDrop * 0.5} x2={120 + progress * 10} y2={150 + hipDrop * 0.2} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={120 + progress * 10} y1={150 + hipDrop * 0.2} x2={125 + progress * 5} y2={210} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Feet */}
              <line x1={70 - progress * 5} y1={210} x2={85 - progress * 5} y2={210} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={120 + progress * 5} y1={210} x2={135 + progress * 5} y2={210} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Floor */}
              <line x1={30} y1={212} x2={170} y2={212} stroke="#3f3f46" strokeWidth="1" />
            </svg>
          )
        };
      }
      
      // BENCH PRESS PATTERN (arms extended → bar to chest)
      if (n.includes('bench') || n.includes('chest press') || n.includes('dumbbell press') || (n.includes('incline') && n.includes('press')) || n.includes('plate-loaded')) {
        const armBend = progress * 50;
        const barDrop = progress * 35;
        return {
          category: 'Horizontal Press',
          cues: ['Retract shoulder blades', 'Feet flat on floor', 'Lower bar to mid-chest', 'Drive feet and press'],
          render: (
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Bench */}
              <rect x={50} y={130} width={100} height={8} rx={3} fill="#3f3f46" />
              <rect x={60} y={138} width={5} height={25} fill="#3f3f46" />
              <rect x={135} y={138} width={5} height={25} fill="#3f3f46" />
              {/* Body on bench */}
              <circle cx={125} cy={115} r={10} fill="none" stroke="white" strokeWidth="2.5" />
              <line x1={115} y1={120} x2={65} y2={128} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Legs */}
              <line x1={65} y1={128} x2={55} y2={150} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={55} y1={150} x2={50} y2={163} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Arms */}
              <line x1={105} y1={122} x2={105 - armBend * 0.2} y2={90 + barDrop} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={90} y1={125} x2={90 - armBend * 0.15} y2={90 + barDrop} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Bar */}
              <line x1={65} y1={88 + barDrop} x2={135} y2={88 + barDrop} stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
              {/* Floor */}
              <line x1={30} y1={164} x2={170} y2={164} stroke="#3f3f46" strokeWidth="1" />
            </svg>
          )
        };
      }
      
      // PUSH-UP PATTERN
      if (n.includes('push-up') || n.includes('push up') || n.includes('diamond')) {
        const bodyDrop = progress * 25;
        const armBend = progress * 30;
        return {
          category: 'Push Pattern',
          cues: ['Hands shoulder-width apart', 'Body in straight line', 'Core braced throughout', 'Chest touches floor'],
          render: (
            <svg viewBox="0 0 200 180" className="w-full h-full">
              {/* Head */}
              <circle cx={155} cy={75 + bodyDrop * 0.6} r={9} fill="none" stroke="white" strokeWidth="2.5" />
              {/* Torso (plank position) */}
              <line x1={148} y1={82 + bodyDrop * 0.6} x2={55} y2={90 + bodyDrop * 0.2} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Arms */}
              <line x1={140} y1={85 + bodyDrop * 0.5} x2={140} y2={115 + armBend * 0.1} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={140} y1={115 + armBend * 0.1} x2={140} y2={140} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Legs */}
              <line x1={55} y1={90 + bodyDrop * 0.2} x2={30} y2={95 + bodyDrop * 0.1} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Feet */}
              <circle cx={28} cy={95 + bodyDrop * 0.1} r={3} fill="white" />
              {/* Hands on ground */}
              <circle cx={140} cy={140} r={3} fill="#f97316" />
              {/* Floor */}
              <line x1={15} y1={142} x2={185} y2={142} stroke="#3f3f46" strokeWidth="1" />
            </svg>
          )
        };
      }
      
      // DEADLIFT PATTERN (bent over → standing)
      if (n.includes('deadlift') || n.includes('rdl') || n.includes('romanian') || n.includes('trap bar dead')) {
        const standUp = progress;
        const hipAngle = 60 - standUp * 55;
        const torsoAngle = hipAngle * 0.9;
        return {
          category: 'Hip Hinge',
          cues: ['Hinge at hips, flat back', 'Bar close to body', 'Drive through heels', 'Squeeze glutes at top'],
          render: (
            <svg viewBox="0 0 200 240" className="w-full h-full">
              {/* Head */}
              <circle cx={100 + torsoAngle * 0.6} cy={50 + (1 - standUp) * 40} r={11} fill="none" stroke="white" strokeWidth="2.5" />
              {/* Torso */}
              <line x1={100 + torsoAngle * 0.4} y1={60 + (1 - standUp) * 38} x2={100} y2={120 + (1 - standUp) * 10} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Arms hanging with bar */}
              <line x1={100 + torsoAngle * 0.5} y1={75 + (1 - standUp) * 30} x2={95 + torsoAngle * 0.2} y2={130 + (1 - standUp) * 40} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={100 + torsoAngle * 0.5} y1={75 + (1 - standUp) * 30} x2={105 + torsoAngle * 0.2} y2={130 + (1 - standUp) * 40} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Bar */}
              <line x1={70} y1={132 + (1 - standUp) * 42} x2={130} y2={132 + (1 - standUp) * 42} stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
              {/* Legs */}
              <line x1={100} y1={120 + (1 - standUp) * 10} x2={85} y2={160 + (1 - standUp) * 5} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={85} y1={160 + (1 - standUp) * 5} x2={80} y2={200} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={100} y1={120 + (1 - standUp) * 10} x2={115} y2={160 + (1 - standUp) * 5} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={115} y1={160 + (1 - standUp) * 5} x2={120} y2={200} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Feet */}
              <line x1={72} y1={200} x2={88} y2={200} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={112} y1={200} x2={128} y2={200} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Floor */}
              <line x1={30} y1={202} x2={170} y2={202} stroke="#3f3f46" strokeWidth="1" />
            </svg>
          )
        };
      }
      
      // PULL-UP / CHIN-UP PATTERN
      if (n.includes('pull-up') || n.includes('chin up') || n.includes('chin-up') || n.includes('pulldown') || n.includes('lat pull')) {
        const pullUp = progress;
        const armBend = pullUp * 55;
        const bodyRise = pullUp * 50;
        return {
          category: 'Vertical Pull',
          cues: ['Full grip on bar', 'Initiate with lats', 'Drive elbows down', 'Chin over bar at top'],
          render: (
            <svg viewBox="0 0 200 260" className="w-full h-full">
              {/* Bar */}
              <line x1={50} y1={30} x2={150} y2={30} stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
              {/* Hands */}
              <circle cx={80} cy={30} r={4} fill="white" />
              <circle cx={120} cy={30} r={4} fill="white" />
              {/* Arms */}
              <line x1={80} y1={30} x2={85 + armBend * 0.1} y2={55 + (1 - pullUp) * 15 - bodyRise} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={120} y1={30} x2={115 - armBend * 0.1} y2={55 + (1 - pullUp) * 15 - bodyRise} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Head */}
              <circle cx={100} cy={60 + (1 - pullUp) * 15 - bodyRise} r={11} fill="none" stroke="white" strokeWidth="2.5" />
              {/* Torso */}
              <line x1={100} y1={72 + (1 - pullUp) * 15 - bodyRise} x2={100} y2={135 + (1 - pullUp) * 15 - bodyRise} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Legs */}
              <line x1={100} y1={135 + (1 - pullUp) * 15 - bodyRise} x2={88} y2={185 + (1 - pullUp) * 15 - bodyRise} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={100} y1={135 + (1 - pullUp) * 15 - bodyRise} x2={112} y2={185 + (1 - pullUp) * 15 - bodyRise} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Feet */}
              <circle cx={88} cy={188 + (1 - pullUp) * 15 - bodyRise} r={3} fill="white" />
              <circle cx={112} cy={188 + (1 - pullUp) * 15 - bodyRise} r={3} fill="white" />
            </svg>
          )
        };
      }
      
      // ROW PATTERN
      if (n.includes('row') || n.includes('face pull') || n.includes('pull-apart')) {
        const pullBack = progress;
        return {
          category: 'Horizontal Pull',
          cues: ['Hinge forward ~45°', 'Retract shoulder blades', 'Pull to lower chest', 'Squeeze at the top'],
          render: (
            <svg viewBox="0 0 200 220" className="w-full h-full">
              {/* Head */}
              <circle cx={130} cy={55} r={10} fill="none" stroke="white" strokeWidth="2.5" />
              {/* Torso (bent over) */}
              <line x1={125} y1={64} x2={95} y2={115} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Arms pulling */}
              <line x1={118} y1={80} x2={115 - pullBack * 20} y2={100 + pullBack * 5} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={115 - pullBack * 20} y1={100 + pullBack * 5} x2={110 - pullBack * 30} y2={120 - pullBack * 20} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Bar */}
              <line x1={100 - pullBack * 30} y1={118 - pullBack * 18} x2={120 - pullBack * 30} y2={122 - pullBack * 20} stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
              {/* Legs */}
              <line x1={95} y1={115} x2={80} y2={155} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={80} y1={155} x2={78} y2={195} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={95} y1={115} x2={110} y2={155} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={110} y1={155} x2={112} y2={195} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Feet */}
              <line x1={70} y1={195} x2={86} y2={195} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={104} y1={195} x2={120} y2={195} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Floor */}
              <line x1={30} y1={197} x2={170} y2={197} stroke="#3f3f46" strokeWidth="1" />
            </svg>
          )
        };
      }
      
      // CURL PATTERN
      if (n.includes('curl') || n.includes('bicep')) {
        const curlUp = progress;
        const forearmAngle = curlUp * 130;
        return {
          category: 'Elbow Flexion',
          cues: ['Elbows pinned to sides', 'Control the negative', 'Squeeze at the top', 'Full extension at bottom'],
          render: (
            <svg viewBox="0 0 200 240" className="w-full h-full">
              {/* Head */}
              <circle cx={100} cy={35} r={11} fill="none" stroke="white" strokeWidth="2.5" />
              {/* Torso */}
              <line x1={100} y1={47} x2={100} y2={120} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Upper arms */}
              <line x1={100} y1={60} x2={75} y2={105} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={100} y1={60} x2={125} y2={105} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Forearms with curl */}
              <line x1={75} y1={105} x2={75 - Math.cos(forearmAngle * Math.PI / 180) * 40} y2={105 - Math.sin(forearmAngle * Math.PI / 180) * 40 + 40} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={125} y1={105} x2={125 + Math.cos(forearmAngle * Math.PI / 180) * 40} y2={105 - Math.sin(forearmAngle * Math.PI / 180) * 40 + 40} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Dumbbells */}
              <rect x={75 - Math.cos(forearmAngle * Math.PI / 180) * 40 - 5} y={105 - Math.sin(forearmAngle * Math.PI / 180) * 40 + 37} width={10} height={6} rx={2} fill="#f97316" />
              <rect x={125 + Math.cos(forearmAngle * Math.PI / 180) * 40 - 5} y={105 - Math.sin(forearmAngle * Math.PI / 180) * 40 + 37} width={10} height={6} rx={2} fill="#f97316" />
              {/* Legs */}
              <line x1={100} y1={120} x2={88} y2={175} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={88} y1={175} x2={85} y2={210} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={100} y1={120} x2={112} y2={175} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={112} y1={175} x2={115} y2={210} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Floor */}
              <line x1={30} y1={212} x2={170} y2={212} stroke="#3f3f46" strokeWidth="1" />
            </svg>
          )
        };
      }
      
      // DIPS PATTERN
      if (n.includes('dip')) {
        const dipDown = progress;
        const bodyDrop = dipDown * 35;
        return {
          category: 'Vertical Press',
          cues: ['Slight forward lean', 'Lower until upper arms parallel', 'Drive up through palms', 'Lock out at top'],
          render: (
            <svg viewBox="0 0 200 260" className="w-full h-full">
              {/* Parallel bars */}
              <line x1={60} y1={70} x2={60} y2={200} stroke="#3f3f46" strokeWidth="3" />
              <line x1={140} y1={70} x2={140} y2={200} stroke="#3f3f46" strokeWidth="3" />
              <line x1={50} y1={70} x2={70} y2={70} stroke="#3f3f46" strokeWidth="4" strokeLinecap="round" />
              <line x1={130} y1={70} x2={150} y2={70} stroke="#3f3f46" strokeWidth="4" strokeLinecap="round" />
              {/* Head */}
              <circle cx={100} cy={40 + bodyDrop} r={11} fill="none" stroke="white" strokeWidth="2.5" />
              {/* Arms on bars */}
              <line x1={100} y1={55 + bodyDrop} x2={65} y2={70} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={100} y1={55 + bodyDrop} x2={135} y2={70} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Hands */}
              <circle cx={65} cy={70} r={3} fill="#f97316" />
              <circle cx={135} cy={70} r={3} fill="#f97316" />
              {/* Torso */}
              <line x1={100} y1={55 + bodyDrop} x2={100} y2={120 + bodyDrop} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Legs */}
              <line x1={100} y1={120 + bodyDrop} x2={95} y2={170 + bodyDrop * 0.5} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={100} y1={120 + bodyDrop} x2={105} y2={170 + bodyDrop * 0.5} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx={95} cy={173 + bodyDrop * 0.5} r={3} fill="white" />
              <circle cx={105} cy={173 + bodyDrop * 0.5} r={3} fill="white" />
            </svg>
          )
        };
      }
      
      // DEFAULT — standing figure with generic movement
      const bob = progress * 15;
      return {
        category: 'Exercise',
        cues: ['Maintain proper form', 'Control the movement', 'Breathe steadily', 'Full range of motion'],
        render: (
          <svg viewBox="0 0 200 240" className="w-full h-full">
            <circle cx={100} cy={40 + bob * 0.3} r={11} fill="none" stroke="white" strokeWidth="2.5" />
            <line x1={100} y1={52 + bob * 0.3} x2={100} y2={120 + bob * 0.3} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={100} y1={70 + bob * 0.3} x2={70 - bob * 0.5} y2={100 + bob * 0.5} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={100} y1={70 + bob * 0.3} x2={130 + bob * 0.5} y2={100 + bob * 0.5} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={100} y1={120 + bob * 0.3} x2={85} y2={180} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={100} y1={120 + bob * 0.3} x2={115} y2={180} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={78} y1={180} x2={92} y2={180} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={108} y1={180} x2={122} y2={180} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={30} y1={182} x2={170} y2={182} stroke="#3f3f46" strokeWidth="1" />
          </svg>
        )
      };
    };
    
    const anim = getExerciseAnimation(exerciseName);
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-700">
            <div>
              <div className="text-white font-bold text-lg">{exerciseName}</div>
              <div className="text-orange-400 text-sm">{anim.category}</div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white flex items-center justify-center text-lg transition-colors">×</button>
          </div>
          {/* Animation / Video area */}
          {hasVideo ? (
            <div className="bg-zinc-800/50 flex justify-center">
              <iframe
                src={videoUrl}
                allow="autoplay"
                allowFullScreen
                onError={() => setVideoError(true)}
                className="w-full border-0"
                style={{ height: '300px' }}
              />
            </div>
          ) : (
          <div className="p-6 flex justify-center bg-zinc-800/50" style={{ height: '260px' }}>
            <div style={{ width: '200px', height: '240px' }}>
              {anim.render}
            </div>
          </div>
          )}
          {/* Form cues */}
          <div className="p-4 space-y-2">
            <div className="text-orange-400 font-semibold text-sm mb-2">Form Cues</div>
            {anim.cues.map((cue, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="text-orange-400 mt-0.5">•</span>
                <span>{cue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const OptionButton = ({ isSelected, onClick, title, subtitle }) => (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={`w-full rounded-3xl p-4 text-left transition-all ${
        isSelected
          ? 'scale-[1.01] border border-orange-200/50 bg-orange-300/[0.12] text-white shadow-[0_18px_70px_rgba(249,115,22,0.22)]'
          : 'border border-white/10 bg-white/[0.035] text-zinc-300 hover:-translate-y-1 hover:bg-white/[0.06]'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-bold text-lg tracking-tight">{title}</div>
          {subtitle && <div className="text-sm opacity-80 mt-1">{subtitle}</div>}
        </div>
        {isSelected && <CheckCircle2 className="h-5 w-5 text-orange-200" />}
      </div>
    </button>
  );

  const Logo = () => (
    <div className="relative grid h-12 w-12 place-items-center rounded-[1.35rem] bg-white/[0.05] shadow-[0_18px_70px_rgba(245,158,11,0.18)] ring-1 ring-white/12 backdrop-blur-xl">
      <div className="absolute inset-0 rounded-[1.35rem] bg-gradient-to-br from-amber-200 via-orange-300 to-orange-500 opacity-95" />
      <div className="absolute inset-[1px] rounded-[1.25rem] bg-gradient-to-br from-white/30 via-transparent to-black/20" />
      <Flame className="relative h-6 w-6 text-zinc-950" />
    </div>
  );

  const label = {
    goal: {
      'build-muscle': 'Build Muscle',
      strength: 'Strength',
      'fat-loss': 'Power',
      'v02-max': 'Conditioning'
    },
    experience: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' },
    equipment: {
      'full-gym': 'Full Gym',
      'barbells-only': 'Barbells Only',
      'dumbbells-only': 'Dumbbells / Kettlebells',
      'no-equipment': 'Bodyweight'
    },
    focus: {
      'full-body': 'Full Body',
      'upper-body': 'Upper Body',
      legs: 'Legs',
      'chest-back': 'Chest & Back',
      arms: 'Arms'
    },
    workoutStyle: { paired: 'Paired', straight: 'Straight Sets' },
    conditioningType: { cardio: 'Zone 2 Cardio', vo2max: 'VO2 Max Intervals' }
  };

  const goalOptions = [
    { value: 'build-muscle', title: 'Build Muscle', subtitle: 'Hypertrophy, density, controlled volume', icon: Layers },
    { value: 'strength', title: 'Strength', subtitle: 'Heavy loading, longer rest, neural output', icon: Trophy },
    { value: 'fat-loss', title: 'Power', subtitle: 'Explosive lifts and athletic intent', icon: Zap },
    { value: 'v02-max', title: 'Conditioning', subtitle: 'Aerobic base or VO2 max intervals', icon: Waves }
  ];

  const conditioningOptions = [
    { value: 'cardio', title: 'Zone 2 Cardio', subtitle: 'Steady aerobic capacity', icon: Activity },
    { value: 'vo2max', title: 'VO2 Max', subtitle: 'High-intensity interval protocol', icon: Gauge }
  ];

  const experienceOptions = [
    { value: 'beginner', title: 'Beginner', subtitle: '0-1 years training', icon: User },
    { value: 'intermediate', title: 'Intermediate', subtitle: '1-3 years training', icon: BarChart3 },
    { value: 'advanced', title: 'Advanced', subtitle: '3+ years training', icon: Trophy }
  ];

  const equipmentOptions = [
    { value: 'full-gym', title: 'Full Gym', subtitle: 'Machines, barbells, dumbbells', icon: Dumbbell },
    { value: 'barbells-only', title: 'Barbells Only', subtitle: 'Racks, plates, straight bars', icon: Activity },
    { value: 'dumbbells-only', title: 'DB / KB Only', subtitle: 'Portable load, high versatility', icon: Dumbbell },
    { value: 'no-equipment', title: 'No Equipment', subtitle: 'Bodyweight-only session', icon: Zap }
  ];

  const focusOptions = [
    { value: 'full-body', title: 'Full Body' },
    { value: 'upper-body', title: 'Upper Body' },
    { value: 'legs', title: 'Legs' },
    { value: 'chest-back', title: 'Chest & Back' },
    { value: 'arms', title: 'Arms' }
  ];

  const styleOptions = [
    { value: 'paired', title: 'Paired Workout', subtitle: 'Antagonist pairings for dense, elegant flow', icon: Repeat },
    { value: 'straight', title: 'Straight Sets', subtitle: 'One movement at a time with focused output', icon: Target }
  ];

  const goalLabel = label.goal[settings.goal];
  const intensityLabel = settings.goal === 'v02-max'
    ? (settings.conditioningType === 'vo2max' ? 'Very High' : 'Moderate')
    : settings.goal === 'strength'
      ? 'High'
      : settings.goal === 'fat-loss'
        ? 'Explosive'
        : settings.experience === 'advanced'
          ? 'High Volume'
          : 'Balanced';
  const volumeEstimate = settings.goal === 'v02-max'
    ? (settings.conditioningType === 'vo2max' ? 'Interval biased' : 'Aerobic biased')
    : settings.duration === '20m'
      ? 'Compact'
      : settings.duration === '60m'
        ? 'Expansive'
        : 'Balanced';

  const profileItems = [
    { label: 'Goal', value: goalLabel, icon: Target },
    {
      label: settings.goal === 'v02-max' ? 'Protocol' : 'Experience',
      value: settings.goal === 'v02-max' ? label.conditioningType[settings.conditioningType] : label.experience[settings.experience],
      icon: settings.goal === 'v02-max' ? Activity : User
    },
    { label: 'Duration', value: settings.goal === 'v02-max' ? 'Protocol led' : settings.duration, icon: Clock },
    {
      label: settings.goal === 'v02-max' ? 'System' : 'Equipment',
      value: settings.goal === 'v02-max' ? 'Engine / Bike / Rower' : label.equipment[settings.equipment],
      icon: Dumbbell
    },
    { label: 'Intensity', value: intensityLabel, icon: Gauge },
    { label: 'Volume', value: workout ? `${workout.length} blocks` : volumeEstimate, icon: BarChart3 }
  ];

  const parseSetCount = (exercise) => {
    const prescription = String(exercise?.setsReps || exercise?.vo2Protocol?.rounds || '').replace(/Ã—/g, 'x').replace(/×/g, 'x');
    const beforeMultiplier = prescription.match(/(\d+)(?:\s*-\s*\d+)?\s*x/i);
    if (beforeMultiplier) return Math.max(1, parseInt(beforeMultiplier[1], 10));

    const rounds = prescription.match(/(\d+)\s*(?:rounds|sets)/i);
    if (rounds) return Math.max(1, parseInt(rounds[1], 10));

    return 3;
  };

  const parseDefaultReps = (exercise) => {
    const prescription = String(exercise?.setsReps || '').replace(/Ã—/g, 'x').replace(/×/g, 'x');
    const afterMultiplier = prescription.split(/x/i)[1];
    if (!afterMultiplier) return '';

    const reps = afterMultiplier.match(/(\d+)/);
    return reps ? reps[1] : '';
  };

  const formatDuration = (seconds) => {
    const total = Math.max(0, Math.floor(seconds || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  const calculateSessionStats = (logs) => {
    const allSets = Object.values(logs || {}).flat();
    const completed = allSets.filter(set => set.completed);
    const volume = completed.reduce((total, set) => {
      const weight = parseFloat(set.weight);
      const reps = parseInt(set.reps, 10);
      if (Number.isNaN(weight) || Number.isNaN(reps)) return total;
      return total + weight * reps;
    }, 0);
    const completedExercises = Object.values(logs || {}).filter(sets => sets.some(set => set.completed)).length;

    return {
      volume,
      completedSets: completed.length,
      completedExercises
    };
  };

  const createInitialSetLogs = (generatedWorkout) => (
    (generatedWorkout || []).reduce((logs, exercise, exerciseIndex) => {
      const setCount = parseSetCount(exercise);
      const defaultReps = parseDefaultReps(exercise);
      logs[exerciseIndex] = Array.from({ length: setCount }, (_, setIndex) => ({
        setNumber: setIndex + 1,
        weight: '',
        reps: defaultReps,
        completed: false
      }));
      return logs;
    }, {})
  );

  const startWorkoutSession = () => {
    if (!workout?.length) return;
    setSetLogs(createInitialSetLogs(workout));
    setElapsedSeconds(0);
    setSessionStartTime(Date.now());
    setActiveExerciseIndex(null);
    setShowFinishSummary(false);
    setShowAddExerciseModal(false);
    setIsWorkoutSessionActive(true);
  };

  const updateSetLog = (exerciseIndex, setIndex, updates) => {
    setSetLogs(current => ({
      ...current,
      [exerciseIndex]: (current[exerciseIndex] || []).map((set, index) => (
        index === setIndex ? { ...set, ...updates } : set
      ))
    }));
  };

  const finishWorkoutSession = () => {
    setSessionStartTime(null);
    setShowFinishSummary(true);
  };

  const endWorkoutSession = () => {
    const stats = calculateSessionStats(setLogs);
    if (stats.completedSets > 0) {
      const summary = {
        id: Date.now(),
        name: `${goalLabel || 'ForgeAI'} Session`,
        date: new Date().toISOString(),
        duration: elapsedSeconds,
        volume: stats.volume,
        completedSets: stats.completedSets,
        completedExercises: stats.completedExercises,
        exercises: (workout || []).map(exercise => ({
          name: exercise.name,
          label: exercise.label,
          setsReps: exercise.setsReps
        }))
      };
      setActiveSessionSummary(summary);
      setWorkoutLogs(current => [summary, ...current]);
    }
    setIsWorkoutSessionActive(false);
    setSessionStartTime(null);
    setElapsedSeconds(0);
    setSetLogs({});
    setActiveExerciseIndex(null);
    setShowFinishSummary(false);
    setShowAddExerciseModal(false);
  };

  const IconBubble = ({ icon: Icon, tone = 'orange' }) => {
    const tones = {
      orange: 'from-amber-200/20 to-orange-400/8 text-amber-100 ring-amber-200/18',
      blue: 'from-sky-300/14 to-cyan-300/6 text-sky-100 ring-sky-200/14',
      green: 'from-emerald-300/14 to-lime-300/6 text-emerald-100 ring-emerald-200/14',
      quiet: 'from-white/8 to-white/[0.02] text-zinc-300 ring-white/10'
    };
    return (
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${tones[tone]} ring-1 backdrop-blur-xl`}>
        <Icon className="h-5 w-5" />
      </div>
    );
  };

  const PremiumCard = ({ children, className = '', delay = 0, variant = 'primary' }) => {
    const variants = {
      hero: 'border-amber-100/14 bg-[linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-6 shadow-[0_38px_160px_rgba(0,0,0,0.46),0_0_120px_rgba(245,158,11,0.10)] md:p-8',
      primary: 'border-white/10 bg-white/[0.038] p-6 shadow-[0_28px_110px_rgba(0,0,0,0.32)] md:p-8',
      workout: 'border-white/[0.085] bg-[linear-gradient(145deg,rgba(255,255,255,0.044),rgba(255,255,255,0.018))] p-6 shadow-[0_22px_90px_rgba(0,0,0,0.30)] md:p-8',
      secondary: 'border-white/[0.075] bg-white/[0.026] p-5 shadow-[0_16px_60px_rgba(0,0,0,0.20)] md:p-6',
      flat: 'border-white/[0.07] bg-black/18 p-5 shadow-none md:p-6'
    };

    return (
      <section
        className={`premium-card rounded-[2rem] border backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-white/16 ${variants[variant]} ${className}`}
        style={{ '--delay': `${delay}ms` }}
      >
        {children}
      </section>
    );
  };

  const SectionHeader = ({ icon: Icon, eyebrow, title, subtitle }) => (
    <div className="mb-7 flex items-start gap-4">
      <IconBubble icon={Icon} tone="quiet" />
      <div>
        {eyebrow && <div className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-amber-100/55">{eyebrow}</div>}
        <h2 className="text-2xl font-semibold tracking-[-0.035em] text-white md:text-[2rem]">{title}</h2>
        {subtitle && <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400 md:text-[0.95rem]">{subtitle}</p>}
      </div>
    </div>
  );

  const ChoiceCard = ({ isSelected, onClick, title, subtitle, icon: Icon = Target }) => (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-[1.7rem] p-5 text-left transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black md:p-6 ${
        isSelected
          ? 'scale-[1.012] border border-amber-100/45 bg-amber-200/[0.085] shadow-[0_20px_80px_rgba(245,158,11,0.16),inset_0_1px_0_rgba(255,255,255,0.12)]'
          : 'border border-white/[0.075] bg-white/[0.026] hover:-translate-y-1 hover:border-white/16 hover:bg-white/[0.048]'
      }`}
    >
      <span className={`absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(251,191,36,0.16),transparent_42%)] transition ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}`} />
      {isSelected && <span className="selected-glow absolute inset-px rounded-[1.65rem] border border-amber-100/18" />}
      <span className="relative flex items-start gap-4">
        <IconBubble icon={Icon} tone={isSelected ? 'orange' : 'quiet'} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-[1.05rem] font-semibold tracking-[-0.025em] text-white">
            {title}
            {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0 text-orange-200" aria-hidden="true" />}
          </span>
          {subtitle && <span className="mt-2 block text-sm leading-6 text-zinc-400">{subtitle}</span>}
          <span className="mt-4 block text-[0.65rem] font-medium uppercase tracking-[0.2em] text-zinc-500">{isSelected ? 'Selected' : 'Choose'}</span>
        </span>
      </span>
    </button>
  );

  const ChipButton = ({ isSelected, onClick, children }) => (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={`rounded-full px-5 py-3 text-sm font-semibold transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
        isSelected
          ? 'bg-amber-100 text-zinc-950 shadow-[0_14px_42px_rgba(245,158,11,0.16)]'
          : 'border border-white/[0.08] bg-white/[0.028] text-zinc-300 hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.06]'
      }`}
    >
      {children}
    </button>
  );

  const MetricTile = ({ icon: Icon, label: metricLabel, value, tone = 'orange', quiet = false }) => (
    <div className={`${quiet ? 'rounded-2xl border-white/[0.065] bg-white/[0.018] p-4' : 'rounded-[1.55rem] border-white/[0.08] bg-black/22 p-5'} border backdrop-blur-xl`}>
      <div className="mb-4 flex items-center gap-3">
        <IconBubble icon={Icon} tone={tone} />
        <div className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">{metricLabel}</div>
      </div>
      <div className={`${quiet ? 'text-base' : 'text-xl'} font-semibold tracking-[-0.03em] text-white`}>{value}</div>
    </div>
  );

  const Background = () => (
    <>
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[#050506]" />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-22rem] h-[48rem] w-[82rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.20),rgba(217,119,6,0.075)_36%,transparent_72%)] blur-3xl" />
        <div className="absolute bottom-[-26rem] left-[-18rem] h-[52rem] w-[52rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12),transparent_68%)] blur-3xl" />
        <div className="absolute bottom-[-22rem] right-[-14rem] h-[46rem] w-[46rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.10),transparent_68%)] blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045),transparent_65%)] blur-2xl" />
        <div
          className="absolute inset-0 opacity-[0.045] mix-blend-screen"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.45) 1px, transparent 0)',
            backgroundSize: '18px 18px'
          }}
        />
      </div>
    </>
  );

  const StatChip = ({ label: chipLabel, value, className = '' }) => (
    <div className={`rounded-full border border-white/10 bg-black/30 px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl ${className}`}>
      <div className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">{chipLabel}</div>
      <div className="mt-0.5 text-sm font-semibold tracking-[-0.02em] text-white">{value}</div>
    </div>
  );

  const SignatureOrb = () => (
    <div className="signature-orb relative mx-auto aspect-square w-full max-w-[28rem]">
      <div className="absolute inset-6 rounded-full bg-[radial-gradient(circle_at_50%_42%,rgba(253,230,138,0.32),rgba(251,146,60,0.13)_32%,rgba(255,255,255,0.035)_56%,transparent_72%)] blur-xl" />
      <div className="absolute inset-10 rounded-full border border-amber-100/15 bg-white/[0.025] shadow-[inset_0_0_80px_rgba(245,158,11,0.08),0_30px_120px_rgba(0,0,0,0.36)] backdrop-blur-2xl" />
      <div className="orb-ring absolute inset-14 rounded-full border border-amber-100/25" />
      <div className="orb-ring-slow absolute inset-24 rounded-full border border-white/10" />
      <div className="absolute left-1/2 top-1/2 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/12 bg-zinc-950/72 shadow-[0_0_70px_rgba(245,158,11,0.20)] backdrop-blur-2xl">
        <div className="text-center">
          <Brain className="mx-auto mb-2 h-8 w-8 text-amber-100" />
          <div className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-zinc-500">Session AI</div>
          <div className="mt-1 text-2xl font-black tracking-[-0.05em] text-white">94</div>
        </div>
      </div>
      <StatChip label="Adaptive" value={goalLabel} className="absolute left-0 top-14" />
      <StatChip label="Readiness" value={intensityLabel} className="absolute right-0 top-28" />
      <StatChip label="Volume" value={volumeEstimate} className="absolute bottom-16 left-8" />
      <StatChip label="Tempo" value="Smart" className="absolute bottom-6 right-10" />
    </div>
  );

  const Hero = () => (
    <header className="grid gap-12 py-12 md:py-20 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:py-28">
      <div>
        <div className="mb-8 flex items-center gap-3">
          {Logo()}
          <div>
            <div className="text-lg font-semibold tracking-[-0.035em] text-white">ForgeAI</div>
            <div className="text-[0.66rem] font-medium uppercase tracking-[0.26em] text-amber-100/58">Performance Studio</div>
          </div>
        </div>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-100/12 bg-white/[0.035] px-4 py-2 text-sm text-zinc-300 shadow-[0_16px_60px_rgba(0,0,0,0.20)] backdrop-blur-xl">
          <Sparkles className="h-4 w-4 text-amber-100" />
          Adaptive training intelligence
        </div>
        <h1 className="max-w-5xl text-6xl font-black leading-[0.88] tracking-[-0.075em] text-white md:text-8xl xl:text-[6.8rem]">
          Train With Precision
        </h1>
        <div className="mt-6 h-px w-28 bg-gradient-to-r from-amber-200 via-orange-300 to-transparent" />
        <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-300/88 md:text-xl">
          Configure your goal, equipment, time, and training level. ForgeAI builds a personalized session with smart volume, tempo, rest, and exercise sequencing.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={generateWorkout}
            className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-amber-200 via-orange-300 to-orange-400 px-7 py-4 text-base font-black text-zinc-950 shadow-[0_20px_80px_rgba(245,158,11,0.24)] transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_28px_100px_rgba(245,158,11,0.31)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-100 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Generate Elite Workout
            <ChevronRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
          </button>
          <a
            href="#preferences"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.085] bg-white/[0.03] px-6 py-4 text-base font-semibold text-zinc-200 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.055] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Tune Preferences
          </a>
        </div>
      </div>
      {SignatureOrb()}
    </header>
  );

  const TrainingInsights = ({ compact = false }) => (
    <PremiumCard className={compact ? '' : 'mt-12'} delay={compact ? 0 : 120} variant="secondary">
      <SectionHeader
        icon={Brain}
        eyebrow="Training Intelligence"
        title="Session Intelligence"
        subtitle={compact ? null : 'A compact readout of the current prescription before the workout is forged.'}
      />
      <div className={`${compact ? 'space-y-3' : 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3'}`}>
        {profileItems.map(({ label: itemLabel, value, icon }, index) => (
          <MetricTile
            key={itemLabel}
            label={itemLabel}
            value={value}
            icon={icon}
            tone={index % 3 === 1 ? 'blue' : index % 3 === 2 ? 'green' : 'orange'}
            quiet={compact}
          />
        ))}
      </div>
    </PremiumCard>
  );

  const Preferences = () => (
    <div id="preferences" className="space-y-8 md:space-y-10">
      <PremiumCard delay={60} variant="primary">
        <SectionHeader icon={Target} eyebrow="Step 01" title="Choose Your Training Goal" subtitle="Each goal keeps the same generation engine underneath, tuned for a different adaptation." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {goalOptions.map(option => (
            <ChoiceCard key={option.value} {...option} isSelected={settings.goal === option.value} onClick={() => setSettings({ ...settings, goal: option.value })} />
          ))}
        </div>
      </PremiumCard>

      {settings.goal === 'v02-max' ? (
        <PremiumCard delay={120} variant="primary">
          <SectionHeader icon={Activity} eyebrow="Step 02" title="Conditioning Mode" subtitle="Choose steady aerobic development or high-intensity interval work." />
          <div className="grid gap-4 md:grid-cols-2">
            {conditioningOptions.map(option => (
              <ChoiceCard key={option.value} {...option} isSelected={settings.conditioningType === option.value} onClick={() => setSettings({ ...settings, conditioningType: option.value })} />
            ))}
          </div>
        </PremiumCard>
      ) : (
        <PremiumCard delay={120} variant="primary">
          <SectionHeader icon={User} eyebrow="Step 02" title="Experience Level" subtitle="Training age adjusts complexity, intensity, and advanced loading methods." />
          <div className="grid gap-4 md:grid-cols-3">
            {experienceOptions.map(option => (
              <ChoiceCard key={option.value} {...option} isSelected={settings.experience === option.value} onClick={() => setSettings({ ...settings, experience: option.value })} />
            ))}
          </div>
        </PremiumCard>
      )}

      {settings.goal !== 'v02-max' && (
        <>
          <PremiumCard delay={180} variant="primary">
            <SectionHeader icon={Dumbbell} eyebrow="Step 03" title="Equipment Access" subtitle="Select the tools available today. The session stays inside those constraints." />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {equipmentOptions.map(option => (
                <ChoiceCard key={option.value} {...option} isSelected={settings.equipment === option.value} onClick={() => setSettings({ ...settings, equipment: option.value })} />
              ))}
            </div>
          </PremiumCard>

          <PremiumCard delay={240} variant="secondary">
            <SectionHeader icon={Activity} eyebrow="Step 04" title="Session Focus" subtitle="Bias the workout toward a full-body stimulus or a specific regional emphasis." />
            <div className="flex flex-wrap gap-3 md:gap-4">
              {focusOptions.map(option => (
                <ChipButton key={option.value} isSelected={settings.focus === option.value} onClick={() => setSettings({ ...settings, focus: option.value })}>
                  {option.title}
                </ChipButton>
              ))}
            </div>
          </PremiumCard>

          <div className="grid gap-8 lg:grid-cols-[1fr_0.82fr]">
            <PremiumCard delay={300} variant="primary">
              <SectionHeader icon={Repeat} eyebrow="Step 05" title="Workout Style" subtitle="Choose dense paired supersets or a composed straight-set structure." />
              <div className="grid gap-4 md:grid-cols-2">
                {styleOptions.map(option => (
                  <ChoiceCard key={option.value} {...option} isSelected={settings.workoutStyle === option.value} onClick={() => setSettings({ ...settings, workoutStyle: option.value })} />
                ))}
              </div>
            </PremiumCard>

            <PremiumCard delay={360} variant="secondary">
              <SectionHeader icon={Clock} eyebrow="Step 06" title="Time Available" subtitle="The generator scales density to fit your training window." />
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {['20m', '30m', '45m', '60m'].map(duration => (
                  <ChipButton key={duration} isSelected={settings.duration === duration} onClick={() => setSettings({ ...settings, duration })}>
                    {duration}
                  </ChipButton>
                ))}
              </div>
            </PremiumCard>
          </div>
        </>
      )}

      <PremiumCard className="overflow-hidden" delay={420} variant="hero">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/70">Ready when you are</div>
            <h2 className="text-3xl font-black tracking-[-0.055em] text-white md:text-5xl">Generate your elite session.</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-400">
              You will get exercise order, sets, reps, tempo, rest, and muscle details in a polished training card stack.
            </p>
          </div>
          <button
            type="button"
            onClick={generateWorkout}
            className="group inline-flex min-h-16 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-amber-200 via-orange-300 to-orange-400 px-8 py-5 text-lg font-black text-zinc-950 shadow-[0_20px_80px_rgba(245,158,11,0.24)] transition duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:shadow-[0_26px_110px_rgba(245,158,11,0.32)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-100 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Generate Elite Workout
            <ChevronRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </button>
        </div>
      </PremiumCard>
    </div>
  );

  const TempoPopover = ({ exercise, idx }) => {
    if (showTempoInfo !== idx) return null;
    const hasTempo = exercise.tempo && exercise.tempo !== '---' && exercise.tempo !== 'random';
    const phases = hasTempo ? getTempoPhases(exercise.name) : null;
    const t = exercise.tempo || '';
    const digit = (value, fallback) => value === 'X' ? 'Explosive' : value ? `${value}s` : fallback;
    const d1 = digit(t[0], 'N/A');
    const d2 = t[1] === '0' ? 'No pause' : digit(t[1], 'N/A pause');
    const d3 = digit(t[2], 'N/A');
    const d4 = t[3] === '0' ? 'No pause' : digit(t[3], 'N/A pause');

    return (
      <>
        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setShowTempoInfo(null)} />
        <div className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-zinc-950/95 p-5 text-sm shadow-[0_30px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
          <div className="mb-3 flex items-center gap-3">
            <IconBubble icon={Timer} />
            <div>
              <div className="font-bold text-white">Tempo Intelligence</div>
              <div className="text-xs text-zinc-500">Rep speed and positional control</div>
            </div>
          </div>
          <p className="mb-4 leading-6 text-zinc-300">A 4-digit code defining the speed of each phase of a rep, measured in seconds. X means explosive intent.</p>
          <div className="space-y-2 text-zinc-300">
            <div><span className="font-semibold text-white">1st</span> Eccentric lowering phase.</div>
            <div><span className="font-semibold text-white">2nd</span> Pause in the stretched position.</div>
            <div><span className="font-semibold text-white">3rd</span> Concentric lifting phase.</div>
            <div><span className="font-semibold text-white">4th</span> Pause at lockout.</div>
          </div>
          {hasTempo && phases && (
            <div className="mt-4 rounded-2xl border border-orange-300/20 bg-orange-300/[0.08] p-4">
              <div className="mb-2 font-semibold text-orange-100">{exercise.name} / {exercise.tempo}</div>
              {phases.concentricFirst && (
                <div className="mb-2 text-xs font-semibold text-yellow-200">This movement begins with the concentric phase.</div>
              )}
              <div className="space-y-1 text-xs leading-5 text-zinc-300">
                <div><span className="font-semibold text-white">1st ({d1})</span> {phases.eccentric}</div>
                <div><span className="font-semibold text-white">2nd ({d2})</span> {phases.bottom}</div>
                <div><span className="font-semibold text-white">3rd ({d3})</span> {phases.concentric}</div>
                <div><span className="font-semibold text-white">4th ({d4})</span> {phases.top}</div>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowTempoInfo(null)}
            className="mt-5 w-full rounded-full bg-white px-4 py-3 text-sm font-bold text-black transition hover:bg-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-200"
          >
            Close
          </button>
        </div>
      </>
    );
  };

  const ExerciseCard = ({ exercise, idx }) => {
    const muscles = muscleData[exercise.name] || { primary: '', secondary: '', stabilizers: '' };
    const badge = exercise.isConditioning
      ? (exercise.isVo2Max ? 'VO2 Max' : 'Zone 2')
      : exercise.isMain
        ? 'Main Lift'
        : exercise.schemeName || 'Accessory';
    const category = exercise.isConditioning ? 'Conditioning' : muscles.primary || 'Strength';

    return (
      <article
        className="workout-card group relative overflow-hidden rounded-[2.1rem] border border-white/[0.085] bg-[linear-gradient(145deg,rgba(255,255,255,0.046),rgba(255,255,255,0.018))] p-6 shadow-[0_22px_90px_rgba(0,0,0,0.30)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-white/14 hover:bg-white/[0.048] md:p-8"
        style={{ '--delay': `${idx * 70}ms` }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(245,158,11,0.09),transparent_34%)] opacity-80" />
        <div className="relative mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-amber-100/18 bg-amber-200/[0.075] px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-amber-100">{exercise.label}</span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-zinc-400">{badge}</span>
              <span className="rounded-full border border-white/[0.08] bg-black/20 px-3 py-1 text-xs font-medium text-zinc-400">{category}</span>
            </div>
            <h3 className="max-w-3xl text-3xl font-black leading-[0.95] tracking-[-0.055em] text-white md:text-5xl">{exercise.name}</h3>
          </div>
          {!exercise.isConditioning && (
            <button
              type="button"
              onClick={() => setShowExerciseDemo(exercise.name)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:-translate-y-0.5 hover:bg-white/[0.065] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              title="View exercise demo"
            >
              <PlayCircle className="h-4 w-4 text-amber-100" />
              Form
            </button>
          )}
        </div>

        {exercise.schemeName && (
          <div className="relative mb-6 rounded-[1.6rem] border border-white/[0.07] bg-black/18 p-5">
            <div className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-amber-100/65">{exercise.schemeName}</div>
            {exercise.schemeDescription && <div className="text-sm leading-6 text-zinc-400">{exercise.schemeDescription}</div>}
            {exercise.schemeExample && (
              <div className="mt-4 rounded-[1.25rem] border border-white/[0.06] bg-white/[0.025] p-4 text-sm text-zinc-400">
                <div className="mb-2 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-zinc-500">Example prescription</div>
                <div className="leading-6">{exercise.schemeExample}</div>
              </div>
            )}
          </div>
        )}

        {exercise.isConditioning ? (
          exercise.vo2Protocol ? (
            <div className="relative space-y-5">
              <div className="rounded-[1.65rem] border border-amber-100/16 bg-amber-200/[0.055] p-5">
                <div className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-amber-100">Protocol</div>
                <div className="text-sm leading-6 text-zinc-200">{exercise.vo2Protocol.howTo}</div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricTile icon={Zap} label="Sprint" value={exercise.vo2Protocol.sprint} />
                <MetricTile icon={Timer} label="Recover" value={exercise.vo2Protocol.recovery} tone="blue" />
                <MetricTile icon={Repeat} label="Rounds" value={exercise.vo2Protocol.rounds} tone="green" />
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <details className="rounded-[1.5rem] border border-white/[0.07] bg-black/18 p-5 text-sm text-zinc-300">
                  <summary className="cursor-pointer font-bold text-emerald-200">Benefits</summary>
                  <div className="mt-3 space-y-2 leading-6">
                    {exercise.vo2Protocol.benefits.split('. ').filter(Boolean).map((benefit, i) => (
                      <div key={i}>{benefit.replace(/\.$/, '')}</div>
                    ))}
                  </div>
                </details>
                <details className="rounded-[1.5rem] border border-white/[0.07] bg-black/18 p-5 text-sm text-zinc-300">
                  <summary className="cursor-pointer font-bold text-sky-200">Who it fits</summary>
                  <div className="mt-3 space-y-2 leading-6">
                    {exercise.vo2Protocol.whoFor.split('. ').filter(Boolean).map((who, i) => (
                      <div key={i}>{who.replace(/\.$/, '')}</div>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          ) : (
            <MetricTile icon={Activity} label="Protocol" value={exercise.setsReps} tone="green" />
          )
        ) : (
          <>
            <div className="relative grid gap-4 sm:grid-cols-3">
              <MetricTile icon={Layers} label="Sets x Reps" value={exercise.setsReps} />
              <div className="rounded-[1.55rem] border border-white/[0.08] bg-black/22 p-5 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <IconBubble icon={Timer} tone="blue" />
                    <div className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">Tempo</div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowTempoInfo(showTempoInfo === idx ? null : idx); }}
                    className="grid h-8 w-8 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04] text-zinc-300 transition hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                    aria-label={`Explain tempo for ${exercise.name}`}
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-xl font-semibold tracking-[-0.03em] text-white">{exercise.tempo}</div>
                <TempoPopover exercise={exercise} idx={idx} />
              </div>
              <MetricTile icon={Clock} label="Rest" value={exercise.rest} tone="green" />
            </div>

            {muscles.primary && (
              <div className="relative mt-6 rounded-[1.55rem] border border-white/[0.065] bg-black/14 p-5 text-sm text-zinc-300">
                <div className="mb-4 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-zinc-500">Muscle profile</div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div><span className="block text-xs uppercase tracking-[0.14em] text-orange-200/70">Primary</span><span className="mt-1 block leading-6">{muscles.primary}</span></div>
                  {muscles.secondary && <div><span className="block text-xs uppercase tracking-[0.14em] text-sky-200/70">Secondary</span><span className="mt-1 block leading-6">{muscles.secondary}</span></div>}
                  {muscles.stabilizers && <div><span className="block text-xs uppercase tracking-[0.14em] text-emerald-200/70">Stabilizers</span><span className="mt-1 block leading-6">{muscles.stabilizers}</span></div>}
                </div>
              </div>
            )}
          </>
        )}
      </article>
    );
  };

  const SessionStatsCard = ({ stats }) => {
    const formattedVolume = Number.isInteger(stats.volume) ? stats.volume : Number(stats.volume.toFixed(1));

    return (
      <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.035] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[1.4rem] bg-black/24 p-4">
            <div className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">Duration</div>
            <div className="text-xl font-black tracking-[-0.04em] text-white">{formatDuration(elapsedSeconds)}</div>
          </div>
          <div className="rounded-[1.4rem] bg-black/24 p-4">
            <div className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">Volume</div>
            <div className="text-xl font-black tracking-[-0.04em] text-white">{formattedVolume} kg</div>
          </div>
          <div className="rounded-[1.4rem] bg-black/24 p-4">
            <div className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">Sets</div>
            <div className="text-xl font-black tracking-[-0.04em] text-white">{stats.completedSets}</div>
          </div>
        </div>
      </div>
    );
  };

  const SessionExerciseRow = ({ exercise, index }) => {
    const logs = setLogs[index] || [];
    const completed = logs.filter(set => set.completed).length;
    const total = logs.length || parseSetCount(exercise);

    return (
      <button
        type="button"
        onClick={() => setActiveExerciseIndex(index)}
        className="group flex w-full items-center gap-4 rounded-[1.75rem] border border-white/[0.075] bg-white/[0.03] p-4 text-left transition hover:-translate-y-0.5 hover:border-white/14 hover:bg-white/[0.052] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[1.35rem] border border-amber-100/12 bg-gradient-to-br from-amber-200/[0.13] to-white/[0.025]">
          <Dumbbell className="h-6 w-6 text-amber-100" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-xs font-black uppercase tracking-[0.16em] text-amber-100/70">{exercise.label || index + 1}</span>
            <span className="truncate text-lg font-bold tracking-[-0.035em] text-white">{exercise.name}</span>
          </div>
          <div className="mt-1 text-sm text-zinc-500">{completed}/{total} done</div>
        </div>
        <div className="text-2xl leading-none text-zinc-500 transition group-hover:text-zinc-300" aria-hidden="true">...</div>
      </button>
    );
  };

  const ExerciseSetDetail = () => {
    const exercise = workout?.[activeExerciseIndex];
    if (!exercise) return null;

    const logs = setLogs[activeExerciseIndex] || [];
    const completed = logs.filter(set => set.completed).length;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setActiveExerciseIndex(null)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-zinc-200 transition hover:bg-white/[0.065] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            aria-label="Back to exercise list"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-sm font-semibold text-zinc-400">{completed}/{logs.length} done</div>
        </div>

        <div>
          <div className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-amber-100/58">Exercise</div>
          <h2 className="text-4xl font-black leading-none tracking-[-0.06em] text-white md:text-5xl">{exercise.name}</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile icon={Layers} label="Sets x Reps" value={exercise.setsReps || 'Protocol'} quiet />
          <MetricTile icon={Timer} label="Tempo" value={exercise.tempo || 'Open'} tone="blue" quiet />
          <MetricTile icon={Clock} label="Rest" value={exercise.rest || 'As needed'} tone="green" quiet />
        </div>

        <div className="space-y-3">
          {logs.map((set, setIndex) => (
            <div
              key={set.setNumber}
              className={`grid gap-3 rounded-[1.5rem] border p-4 transition sm:grid-cols-[auto_1fr_1fr_auto] sm:items-center ${
                set.completed
                  ? 'border-amber-100/24 bg-amber-200/[0.07]'
                  : 'border-white/[0.075] bg-white/[0.03]'
              }`}
            >
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-400">Set {set.setNumber}</div>
              <label className="block">
                <span className="sr-only">Weight for set {set.setNumber}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={set.weight}
                  onChange={(event) => updateSetLog(activeExerciseIndex, setIndex, { weight: event.target.value })}
                  placeholder="Weight kg"
                  className="w-full rounded-2xl border border-white/[0.08] bg-black/24 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-100/40 focus:ring-2 focus:ring-amber-100/20"
                  aria-label={`Weight in kilograms for set ${set.setNumber}`}
                />
              </label>
              <label className="block">
                <span className="sr-only">Reps for set {set.setNumber}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={set.reps}
                  onChange={(event) => updateSetLog(activeExerciseIndex, setIndex, { reps: event.target.value })}
                  placeholder="Reps"
                  className="w-full rounded-2xl border border-white/[0.08] bg-black/24 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-100/40 focus:ring-2 focus:ring-amber-100/20"
                  aria-label={`Reps for set ${set.setNumber}`}
                />
              </label>
              <button
                type="button"
                aria-pressed={set.completed}
                onClick={() => updateSetLog(activeExerciseIndex, setIndex, { completed: !set.completed })}
                className={`rounded-full px-5 py-3 text-sm font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                  set.completed
                    ? 'bg-amber-100 text-zinc-950 shadow-[0_12px_42px_rgba(245,158,11,0.18)]'
                    : 'border border-white/[0.08] bg-white/[0.035] text-zinc-300 hover:bg-white/[0.065]'
                }`}
              >
                {set.completed ? 'Done' : 'Mark Done'}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const FinishSummaryModal = ({ stats }) => {
    const formattedVolume = Number.isInteger(stats.volume) ? stats.volume : Number(stats.volume.toFixed(1));

    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/72 p-4 backdrop-blur-xl">
        <div className="w-full max-w-md rounded-[2rem] border border-white/[0.1] bg-zinc-950/94 p-6 shadow-[0_34px_140px_rgba(0,0,0,0.62)]">
          <div className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-amber-100/58">Session Complete</div>
          <h2 className="text-4xl font-black tracking-[-0.06em] text-white">Workout Summary</h2>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <MetricTile icon={Timer} label="Duration" value={formatDuration(elapsedSeconds)} quiet />
            <MetricTile icon={BarChart3} label="Volume" value={`${formattedVolume} kg`} quiet />
            <MetricTile icon={CheckCircle2} label="Sets" value={stats.completedSets} tone="green" quiet />
            <MetricTile icon={Dumbbell} label="Exercises" value={stats.completedExercises} tone="blue" quiet />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setShowFinishSummary(false)}
              className="rounded-full border border-white/[0.08] bg-white/[0.035] px-5 py-3 font-bold text-zinc-200 transition hover:bg-white/[0.065] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              Back to Workout
            </button>
            <button
              type="button"
              onClick={endWorkoutSession}
              className="rounded-full bg-amber-100 px-5 py-3 font-black text-zinc-950 shadow-[0_14px_48px_rgba(245,158,11,0.20)] transition hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              End Session
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AddExerciseModal = () => (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-xl">
      <div className="w-full max-w-sm rounded-[2rem] border border-white/[0.1] bg-zinc-950/94 p-6 text-center shadow-[0_34px_140px_rgba(0,0,0,0.62)]">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-zinc-950">
          <Dumbbell className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-black tracking-[-0.055em] text-white">Add Exercises</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">Exercise library coming soon.</p>
        <button
          type="button"
          onClick={() => setShowAddExerciseModal(false)}
          className="mt-6 w-full rounded-full bg-white px-5 py-3 font-black text-zinc-950 transition hover:bg-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
        >
          Close
        </button>
      </div>
    </div>
  );

  const WorkoutSessionView = () => {
    const stats = calculateSessionStats(setLogs);
    const canFinish = stats.completedSets > 0;

    return (
      <div className="relative min-h-screen overflow-hidden text-white antialiased">
        <Background />
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-5 sm:px-6 lg:px-8">
          <header className="mb-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveExerciseIndex(null);
                setIsWorkoutSessionActive(false);
              }}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-zinc-200 transition hover:bg-white/[0.065] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              aria-label="Return to generated workout"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-sky-300/[0.12] text-sky-100 ring-1 ring-sky-200/12">
                <Timer className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">Workout Session</div>
                <div className="text-lg font-black tracking-[-0.035em] text-white">{formatDuration(elapsedSeconds)}</div>
              </div>
            </div>
            <button
              type="button"
              disabled={!canFinish}
              onClick={finishWorkoutSession}
              className={`rounded-full px-5 py-3 text-sm font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                canFinish
                  ? 'bg-amber-100 text-zinc-950 shadow-[0_14px_48px_rgba(245,158,11,0.18)] hover:bg-amber-200'
                  : 'cursor-not-allowed border border-white/[0.06] bg-white/[0.025] text-zinc-600'
              }`}
            >
              Finish
            </button>
          </header>

          {SessionStatsCard({ stats })}

          <section className="mt-6 flex-1">
            {activeExerciseIndex === null ? (
              <div className="space-y-3">
                {(workout || []).map((exercise, index) => (
                  <React.Fragment key={`${exercise.label}-${exercise.name}-session-${index}`}>
                    {SessionExerciseRow({ exercise, index })}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              ExerciseSetDetail()
            )}
          </section>

          {activeExerciseIndex === null && (
            <button
              type="button"
              onClick={() => setShowAddExerciseModal(true)}
              className="mt-6 w-full rounded-full border border-white/[0.08] bg-white/[0.04] px-6 py-5 text-base font-black text-white shadow-[0_20px_80px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Add Exercises
            </button>
          )}
        </main>

        {showFinishSummary && FinishSummaryModal({ stats })}
        {showAddExerciseModal && AddExerciseModal()}
      </div>
    );
  };

  const BottomNav = () => {
    const tabs = [
      { id: 'workout', label: 'Workout', icon: Dumbbell },
      { id: 'log', label: 'Log', icon: NotebookText },
      { id: 'ai', label: 'AI', icon: Brain, special: true },
      { id: 'pro', label: 'PRO', icon: Crown },
      { id: 'you', label: 'You', icon: UserCircle }
    ];

    return (
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-xl px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="grid grid-cols-5 items-end rounded-[2rem] border border-white/[0.08] bg-black/72 px-2 py-2 shadow-[0_-18px_80px_rgba(0,0,0,0.46)] backdrop-blur-2xl">
          {tabs.map(({ id, label: tabLabel, icon: Icon, special }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                aria-label={`Open ${tabLabel} tab`}
                aria-pressed={active}
                aria-current={active ? 'page' : undefined}
                onClick={() => setActiveTab(id)}
                className={`group flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${
                  special
                    ? '-mt-7'
                    : active
                      ? 'text-white'
                      : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                <span className={`${special ? 'grid h-14 w-14 place-items-center rounded-full border border-amber-100/20 bg-gradient-to-br from-amber-200 via-orange-300 to-orange-400 text-zinc-950 shadow-[0_14px_58px_rgba(245,158,11,0.28)]' : `grid h-8 w-8 place-items-center rounded-xl ${active ? 'bg-amber-100/12 text-amber-100 shadow-[0_0_32px_rgba(245,158,11,0.16)]' : 'text-zinc-500'}`}`}>
                  <Icon className={special ? 'h-6 w-6' : 'h-5 w-5'} />
                </span>
                <span className={`${special ? active ? 'text-amber-100' : 'text-zinc-400' : ''}`}>{tabLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  };

  const ScreenHeader = ({ eyebrow, title, subtitle, icon: Icon }) => (
    <div className="mb-7 flex items-start justify-between gap-4">
      <div>
        {eyebrow && <div className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-amber-100/55">{eyebrow}</div>}
        <h1 className="text-4xl font-black leading-none tracking-[-0.06em] text-white">{title}</h1>
        {subtitle && <p className="mt-3 text-sm leading-6 text-zinc-400">{subtitle}</p>}
      </div>
      {Icon && <IconBubble icon={Icon} />}
    </div>
  );

  const LogTab = () => {
    const mockLogs = [
      {
        id: 'mock-1',
        name: 'Upper Strength / Chest & Back',
        date: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
        duration: 3180,
        volume: 7420,
        completedSets: 18,
        completedExercises: 6,
        exercises: [
          { label: 'A1', name: 'Bench Press' },
          { label: 'A2', name: 'Pull-ups' },
          { label: 'B1', name: 'Incline DB Press' },
          { label: 'B2', name: 'Barbell Row' }
        ]
      }
    ];
    const logs = workoutLogs.length ? workoutLogs : mockLogs;

    return (
      <div className="space-y-5">
        <ScreenHeader eyebrow="Training Log" title="Your Workouts" subtitle="A premium record of sessions, volume, sets, and progress." icon={ClipboardList} />
        {activeSessionSummary && (
          <PremiumCard variant="hero">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-amber-100/60">Latest Session</div>
                <div className="mt-2 text-xl font-black tracking-[-0.04em] text-white">{activeSessionSummary.name}</div>
                <div className="mt-1 text-sm text-zinc-400">{formatDuration(activeSessionSummary.duration)} / {activeSessionSummary.completedSets} sets</div>
              </div>
              <Award className="h-9 w-9 text-amber-100" />
            </div>
          </PremiumCard>
        )}
        {logs.map(log => {
          const formattedVolume = Number.isInteger(log.volume) ? log.volume : Number(log.volume.toFixed(1));
          return (
            <PremiumCard key={log.id} variant="workout" className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-zinc-950 font-black">MJ</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-lg font-black tracking-[-0.04em] text-white">{log.name}</div>
                  <div className="text-sm text-zinc-500">{new Date(log.date).toLocaleString()}</div>
                </div>
                <MoreHorizontal className="h-5 w-5 text-zinc-500" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <MetricTile icon={Timer} label="Duration" value={formatDuration(log.duration)} quiet />
                <MetricTile icon={BarChart3} label="Volume" value={`${formattedVolume} kg`} quiet />
                <MetricTile icon={Award} label="Records" value={log.completedSets > 12 ? '3 PRs' : '1 PR'} tone="green" quiet />
              </div>
              <div className="rounded-[1.5rem] border border-amber-100/12 bg-amber-100/[0.055] p-4">
                <div className="text-sm font-bold text-amber-100">Achievement unlocked</div>
                <div className="mt-1 text-sm text-zinc-400">Completed {log.completedExercises} exercises with {log.completedSets} tracked sets.</div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(log.exercises || []).slice(0, 4).map((exercise, index) => (
                  <div key={`${log.id}-${exercise.name}-${index}`} className="rounded-2xl border border-white/[0.07] bg-black/20 p-3 text-center">
                    <Dumbbell className="mx-auto mb-2 h-5 w-5 text-amber-100" />
                    <div className="truncate text-xs font-bold text-zinc-300">{exercise.label || index + 1}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-around border-t border-white/[0.07] pt-4 text-sm font-semibold text-zinc-400">
                <button type="button" className="inline-flex items-center gap-2 hover:text-white"><Heart className="h-4 w-4" />Like</button>
                <button type="button" className="inline-flex items-center gap-2 hover:text-white"><MessageCircle className="h-4 w-4" />Comment</button>
                <button type="button" className="inline-flex items-center gap-2 hover:text-white"><Share2 className="h-4 w-4" />Share</button>
              </div>
            </PremiumCard>
          );
        })}
      </div>
    );
  };

  const AITab = () => {
    const promptChips = ['Build me a push day', 'Fix my weak chest', 'Analyze my workout', 'Make this harder', 'Deload this week'];
    const promptLimit = 500;
    const outputLimit = 900;
    const settingLabels = {
      goal: label.goal[settings.goal],
      experience: label.experience[settings.experience],
      equipment: label.equipment[settings.equipment],
      focus: label.focus[settings.focus],
      duration: settings.duration,
      workoutStyle: label.workoutStyle[settings.workoutStyle],
      conditioningType: label.conditioningType[settings.conditioningType]
    };

    const buildDemoCoachResponse = (prompt) => {
      const lowerPrompt = prompt.toLowerCase();
      const exerciseCount = workout?.exercises?.length || 0;
      const firstMain = workout?.exercises?.[0]?.name || 'your main lift';
      const secondMove = workout?.exercises?.[1]?.name || 'your secondary movement';
      const contextLine = `Context: ${settingLabels.goal}, ${settingLabels.experience}, ${settingLabels.focus}, ${settingLabels.duration}, ${settingLabels.equipment}.`;
      let plan = `Start with ${firstMain} as the quality anchor, keep 1-2 reps in reserve on early sets, and use ${secondMove} to build volume without rushing the tempo.`;

      if (lowerPrompt.includes('push')) {
        plan = 'Run an upper push emphasis: heavy press first, incline or machine press second, then lateral delts and triceps. Keep chest work controlled and stop accessory sets when joint position or rep speed drops.';
      } else if (lowerPrompt.includes('weak chest') || lowerPrompt.includes('chest')) {
        plan = 'Bias chest by using a slight incline, a 2-3 second eccentric, and a hard pause near the stretched position. Add one back-off set after the main press instead of adding random extra exercises.';
      } else if (lowerPrompt.includes('harder')) {
        plan = 'Make it harder by adding one top set at the same reps, then one controlled back-off set at 90% of that load. Keep main-lift rest intact and increase density only on accessories.';
      } else if (lowerPrompt.includes('deload')) {
        plan = 'Deload by cutting working sets by 35-45%, keeping technique crisp, and holding intensity around 60-70%. Leave the gym feeling better than when you arrived.';
      } else if (lowerPrompt.includes('analyze')) {
        plan = exerciseCount
          ? `This session has ${exerciseCount} movements. The structure is strongest if ${firstMain} gets the most neurological focus, then accessories stay clean and repeatable.`
          : 'Generate a workout first and I can analyze exercise order, volume, intensity, and weak-link coverage more specifically.';
      }

      return [
        'ForgeAI Coach · Demo AI',
        contextLine,
        '',
        plan,
        '',
        'Prescription: keep main work at RPE 7-8, rest long enough to repeat quality, and progress only when the final set still looks technically identical to the first.'
      ].join('\n').slice(0, outputLimit);
    };

    const sendPrompt = async (prompt = aiPrompt) => {
      const cleanPrompt = prompt.trim().slice(0, promptLimit);
      if (!cleanPrompt || aiLoading) return;
      setAiPrompt('');
      setAiLoading(true);
      setAiError('');

      const demoResponse = buildDemoCoachResponse(cleanPrompt);
      const context = {
        settings: settingLabels,
        rawSettings: settings,
        workout: workout ? {
          title: workout.title || 'Generated Workout',
          exercises: (workout.exercises || []).slice(0, 12).map(exercise => ({
            name: exercise.name,
            category: exercise.category,
            muscle: exercise.muscle,
            setsReps: exercise.setsReps,
            tempo: exercise.tempo,
            rest: exercise.rest,
            intensity: exercise.intensity || exercise.schemeName
          }))
        } : null
      };

      try {
        const response = await fetch('/api/ai-coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: cleanPrompt, context, demoResponse })
        });

        if (!response.ok) throw new Error('AI coach request failed');
        const data = await response.json();
        setAiResponse(String(data.answer || demoResponse).slice(0, outputLimit));
        setAiMode(data.mode === 'live' ? 'live' : 'demo');
        if (data.error) setAiError(data.error);
      } catch (error) {
        setAiMode('demo');
        setAiResponse(demoResponse);
        setAiError('Live AI unavailable. Demo AI answered with local workout context.');
      } finally {
        setAiLoading(false);
      }
    };

    return (
      <div className="space-y-5">
        <PremiumCard variant="hero">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-amber-200 via-orange-300 to-orange-400 text-zinc-950 shadow-[0_18px_70px_rgba(245,158,11,0.24)]">
              <Brain className="h-8 w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-amber-100/60">Central Coach</div>
              <h1 className="mt-1 text-4xl font-black tracking-[-0.06em] text-white">ForgeAI Coach</h1>
              <p className="mt-2 text-sm leading-6 text-zinc-400">Ask for programming, progression, recovery, or workout analysis.</p>
            </div>
            <span className={`shrink-0 rounded-full border px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em] ${aiMode === 'live' ? 'border-emerald-300/25 bg-emerald-300/[0.08] text-emerald-200' : 'border-amber-200/25 bg-amber-200/[0.08] text-amber-100'}`}>
              {aiMode === 'live' ? 'Live AI' : 'Demo AI'}
            </span>
          </div>
        </PremiumCard>
        <PremiumCard variant="primary" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {promptChips.map(chip => (
              <button key={chip} type="button" onClick={() => sendPrompt(chip)} className="rounded-full border border-white/[0.08] bg-white/[0.035] px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.065] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200">
                {chip}
              </button>
            ))}
          </div>
          <div className="flex gap-2 rounded-[1.5rem] border border-white/[0.08] bg-black/22 p-2">
            <input
              value={aiPrompt}
              onChange={(event) => setAiPrompt(event.target.value)}
              maxLength={promptLimit}
              placeholder="Ask ForgeAI Coach..."
              aria-label="Ask ForgeAI Coach"
              className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-white outline-none placeholder:text-zinc-600"
            />
            <button type="button" onClick={() => sendPrompt()} disabled={aiLoading || !aiPrompt.trim()} className="grid h-11 w-11 place-items-center rounded-full bg-amber-100 text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-45 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200" aria-label="Send prompt to ForgeAI Coach">
              {aiLoading ? <Repeat className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
          <div className="flex items-center justify-between text-[0.66rem] font-bold uppercase tracking-[0.16em] text-zinc-600">
            <span>{aiPrompt.length}/{promptLimit}</span>
            <span>{aiMode === 'live' ? 'OpenAI backend' : 'Local demo fallback'}</span>
          </div>
        </PremiumCard>
        <PremiumCard variant="secondary">
          <SectionHeader icon={Sparkles} eyebrow="Coach Response" title="Live Insight" subtitle={null} />
          {aiError && <div className="mb-4 rounded-2xl border border-amber-200/15 bg-amber-200/[0.06] px-4 py-3 text-xs font-semibold leading-5 text-amber-100/85">{aiError}</div>}
          <p className="whitespace-pre-line text-sm leading-7 text-zinc-300">{aiLoading ? 'ForgeAI Coach is analyzing your training context...' : aiResponse}</p>
        </PremiumCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricTile icon={Gauge} label="Readiness" value="Moderate / Green" />
          <MetricTile icon={Zap} label="Suggestion" value="Add 1 back-off set" tone="green" />
        </div>
      </div>
    );
  };

  const ProTab = () => {
    const proSports = [
      { id: 'bodybuilding', label: 'Bodybuilding', desc: 'Hypertrophy-focused periodization with volume waves.', icon: Layers },
      { id: 'powerlifting', label: 'Powerlifting', desc: 'Peaking programs for squat, bench and deadlift.', icon: Trophy },
      { id: 'weightlifting', label: 'Weightlifting', desc: 'Olympic lift periodization for snatch and clean + jerk.', icon: Zap },
      { id: 'trackField', label: 'Track & Field', desc: 'Sprint and jump performance with CNS management.', icon: Gauge },
      { id: 'generalFitness', label: 'General Fitness', desc: 'Balanced strength, muscle and conditioning.', icon: Activity },
      { id: 'fatLoss', label: 'Fat Loss', desc: 'Metabolic resistance training with deficit-friendly volume.', icon: Flame }
    ];

    const proSchedules = [
      { id: '3', label: '3 Days', days: ['Mon', 'Wed', 'Fri'] },
      { id: '4', label: '4 Days', days: ['Mon', 'Tue', 'Thu', 'Fri'] },
      { id: '5', label: '5 Days', days: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat'] },
      { id: '6', label: '6 Days', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }
    ];

    const proDurations = [
      { weeks: 4, label: '4 Weeks', desc: 'Short focused block' },
      { weeks: 6, label: '6 Weeks', desc: 'Compact progression block' },
      { weeks: 8, label: '8 Weeks', desc: 'Balanced full cycle' },
      { weeks: 12, label: '12 Weeks', desc: 'Complete periodized macrocycle' }
    ];

    const proCurves = [
      { id: 'linear', label: 'Linear Loading', desc: 'Linear increase each week, deload every 4th week.', bars: [32, 48, 64, 38, 72, 86] },
      { id: 'step', label: 'Step Loading', desc: 'Two weeks hold, then a bigger jump on week 3.', bars: [40, 40, 62, 62, 82, 82] },
      { id: 'variable', label: 'Variable Loading', desc: 'Wave undulation with heavy, light and medium rotation.', bars: [72, 44, 60, 78, 50, 68] }
    ];

    const proStepLabels = ['Sport', 'Schedule', 'Duration', 'Curve', 'Goals', 'Summary'];
    const selectedSport = proSports.find(sport => sport.id === proConfig.sport);
    const selectedSchedule = proSchedules.find(schedule => schedule.id === proConfig.schedule);
    const selectedCurve = proCurves.find(curve => curve.id === proConfig.overloadCurve);

    const getProPhases = (weeks = proConfig.durationWeeks) => {
      if (weeks === 4) return ['Accumulation', 'Intensification', 'Deload'];
      if (weeks === 6) return ['GPP', 'Hypertrophy', 'Strength', 'Deload'];
      if (weeks === 8) return ['GPP', 'Hypertrophy', 'Strength', 'Peaking', 'Deload'];
      return ['GPP', 'Hypertrophy', 'Strength', 'Intensification', 'Peaking', 'Deload'];
    };

    const getPhaseForWeek = (week, weeks) => {
      if (weeks === 4) {
        if (week <= 2) return 'Accumulation';
        if (week === 3) return 'Intensification';
        return 'Deload';
      }
      if (weeks === 6) {
        if (week === 1) return 'GPP';
        if (week <= 3) return 'Hypertrophy';
        if (week <= 5) return 'Strength';
        return 'Deload';
      }
      if (weeks === 8) {
        if (week === 1) return 'GPP';
        if (week <= 3) return 'Hypertrophy';
        if (week <= 5) return 'Strength';
        if (week <= 7) return 'Peaking';
        return 'Deload';
      }
      if (week <= 2) return 'GPP';
      if (week <= 4) return 'Hypertrophy';
      if (week <= 7) return 'Strength';
      if (week <= 9) return 'Intensification';
      if (week <= 11) return 'Peaking';
      return 'Deload';
    };

    const getProjectionPercent = () => {
      const weeks = proConfig.durationWeeks || 4;
      let projection = weeks === 4 ? 2.5 : weeks === 6 ? 4 : weeks === 8 ? 5 : 7.5;
      if (proConfig.overloadCurve === 'step') projection += 0.5;
      if (proConfig.overloadCurve === 'variable') projection -= 0.5;
      if (['bodybuilding', 'generalFitness', 'fatLoss'].includes(proConfig.sport)) projection *= 0.72;
      if (['weightlifting', 'trackField'].includes(proConfig.sport)) projection *= 0.84;
      return Math.max(1, Number(projection.toFixed(1)));
    };

    const getProTargets = () => {
      const projection = getProjectionPercent();
      return Object.entries(proConfig.goals).reduce((targets, [key, value]) => {
        const current = Number(value.current) || 0;
        targets[key] = {
          current,
          target: current ? Math.round(current * (1 + projection / 100) * 2) / 2 : 0,
          projection
        };
        return targets;
      }, {});
    };

    const getWeekIntensity = (week, weeks, curve, phase) => {
      if (phase === 'Deload') return 62;
      if (curve === 'step') return Math.min(91, 68 + Math.floor((week - 1) / 2) * 6 + (week % 4 === 0 ? -6 : 0));
      if (curve === 'variable') {
        const wave = [76, 68, 72, 64];
        return Math.min(91, wave[(week - 1) % wave.length] + Math.floor(week / 4) * 4);
      }
      return Math.min(92, 68 + (week - 1) * 3 + (week % 4 === 0 ? -7 : 0));
    };

    const getDayFocus = (sport, dayIndex) => {
      const map = {
        powerlifting: ['Squat', 'Bench', 'Deadlift', 'Upper / Accessories', 'Squat Volume', 'Bench Volume'],
        bodybuilding: ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Arms / Delts'],
        weightlifting: ['Snatch', 'Clean & Jerk', 'Squat', 'Pulls', 'Technique', 'Power'],
        trackField: ['Acceleration', 'Max Velocity', 'Plyometrics', 'Strength', 'Tempo Runs', 'Mobility'],
        generalFitness: ['Full Body A', 'Conditioning', 'Full Body B', 'Upper', 'Lower', 'Zone 2'],
        fatLoss: ['Metabolic A', 'Intervals', 'Metabolic B', 'Upper Circuit', 'Lower Circuit', 'Zone 2']
      };
      return (map[sport] || map.generalFitness)[dayIndex % (map[sport] || map.generalFitness).length];
    };

    const schemeForPhase = (phase, main = false) => {
      if (phase === 'Deload') return main ? { setsReps: '3 x 5', tempo: '3010', rest: '90s' } : { setsReps: '2 x 10', tempo: '3010', rest: '60s' };
      if (phase === 'GPP') return main ? { setsReps: '4 x 10', tempo: '3010', rest: '90s' } : { setsReps: '3 x 12-15', tempo: '3010', rest: '60s' };
      if (phase === 'Hypertrophy' || phase === 'Accumulation') return main ? { setsReps: '4 x 8-10', tempo: '3010', rest: '90s' } : { setsReps: '3 x 10-12', tempo: '3010', rest: '60s' };
      if (phase === 'Strength' || phase === 'Intensification') return main ? { setsReps: '5 x 4-6', tempo: '20X0', rest: '150s' } : { setsReps: '3 x 6-8', tempo: '3010', rest: '90s' };
      return main ? { setsReps: '4 x 3-5', tempo: '20X0', rest: '180s' } : { setsReps: '3 x 8-10', tempo: '3010', rest: '75s' };
    };

    const getProgramExercises = (sport, focus, phase, intensity) => {
      const S = (main = false) => schemeForPhase(phase, main);
      const mainIntensity = `${intensity}%`;
      const secondaryIntensity = `${Math.max(50, intensity - 8)}%`;
      const rowsByFocus = {
        Squat: ['Back Squat', 'Pause Squat', 'Dumbbell Row', 'Leg Press', 'Pull-ups'],
        Bench: ['Bench Press', 'Incline Dumbbell Press', 'Chest Supported Row', 'Triceps Pushdown', 'Lateral Raise'],
        Deadlift: ['Deadlift', 'Romanian Deadlift', 'Front Squat', 'Hamstring Curl', 'Plank'],
        'Upper / Accessories': ['Overhead Press', 'Pull-up', 'Close-Grip Bench', 'Cable Row', 'Face Pull'],
        'Squat Volume': ['Pin Squat', 'Bulgarian Split Squat', 'Seated Row', 'Leg Extension', 'Hanging Knee Raise'],
        'Bench Volume': ['Paused Bench Press', 'Dumbbell Bench Press', 'Lat Pulldown', 'Skull Crusher', 'Rear Delt Fly'],
        Push: ['Incline Press', 'Machine Chest Press', 'Seated Shoulder Press', 'Cable Fly', 'Rope Pressdown'],
        Pull: ['Weighted Pull-up', 'Chest Supported Row', 'Lat Pulldown', 'Rear Delt Fly', 'Hammer Curl'],
        Legs: ['Hack Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Curl', 'Standing Calf Raise'],
        Upper: ['Bench Press', 'Barbell Row', 'Overhead Press', 'Pull-up', 'Cable Lateral Raise'],
        Lower: ['Front Squat', 'Hip Thrust', 'Walking Lunge', 'Hamstring Curl', 'Calf Raise'],
        'Arms / Delts': ['Close-Grip Bench', 'EZ-Bar Curl', 'Cable Lateral Raise', 'Overhead Extension', 'Preacher Curl'],
        Snatch: ['Snatch', 'Snatch Pull', 'Overhead Squat', 'Back Extension', 'Hollow Hold'],
        'Clean & Jerk': ['Clean & Jerk', 'Clean Pull', 'Front Squat', 'Push Press', 'Tall Clean'],
        Pulls: ['Clean Pull', 'Snatch High Pull', 'Romanian Deadlift', 'Back Squat', 'Pallof Press'],
        Technique: ['Power Snatch', 'Power Clean', 'Jerk Balance', 'Tall Snatch', 'Front Rack Mobility'],
        Power: ['Power Clean', 'Push Jerk', 'Jump Squat', 'Box Jump', 'Med Ball Slam'],
        Acceleration: ['Block Start', 'Sled Sprint', 'Bounds', 'Trap Bar Deadlift', 'Core Brace'],
        'Max Velocity': ['Flying Sprint', 'Wicket Runs', 'A-Skip', 'Nordic Curl', 'Hip Flexor March'],
        Plyometrics: ['Depth Jump', 'Pogo Jump', 'Broad Jump', 'Split Squat Jump', 'Med Ball Throw'],
        Strength: ['Back Squat', 'Romanian Deadlift', 'Bench Press', 'Row', 'Copenhagen Plank'],
        'Tempo Runs': ['Tempo Run Intervals', 'Step-up', 'Push-up', 'Band Row', 'Dead Bug'],
        Mobility: ['Tempo Bike', 'Cossack Squat', 'Thoracic Rotation', 'Hip Airplane', 'Breathing Drill'],
        'Full Body A': ['Goblet Squat', 'Bench Press', 'Cable Row', 'Romanian Deadlift', 'Farmer Carry'],
        Conditioning: ['Bike Intervals', 'Kettlebell Swing', 'Push-up', 'Sled Push', 'Side Plank'],
        'Full Body B': ['Trap Bar Deadlift', 'Incline Press', 'Lat Pulldown', 'Split Squat', 'Cable Chop'],
        Zone2: ['Incline Walk', 'Goblet Squat', 'TRX Row', 'Step-up', 'Breathing Reset'],
        'Metabolic A': ['Kettlebell Swing', 'Goblet Squat', 'Push Press', 'Renegade Row', 'Bike Sprint'],
        Intervals: ['Rower Sprint', 'Walking Lunge', 'Push-up', 'Battle Rope', 'Plank'],
        'Metabolic B': ['Sled Push', 'Dumbbell Thruster', 'Pull-down', 'Step-up', 'Dead Bug'],
        'Upper Circuit': ['Incline Push-up', 'Cable Row', 'Lateral Raise', 'Rope Pressdown', 'Hammer Curl'],
        'Lower Circuit': ['Leg Press', 'Hip Thrust', 'Hamstring Curl', 'Walking Lunge', 'Calf Raise']
      };
      const names = rowsByFocus[focus] || rowsByFocus['Full Body A'];
      return names.map((name, index) => {
        const main = index === 0;
        const scheme = S(main);
        return {
          label: String.fromCharCode(65 + index),
          name,
          setsReps: scheme.setsReps,
          intensity: main ? mainIntensity : secondaryIntensity,
          tempo: scheme.tempo,
          rest: scheme.rest,
          main
        };
      });
    };

    const generateProProgram = () => {
      const weeks = proConfig.durationWeeks || 4;
      const schedule = selectedSchedule || proSchedules[0];
      const programWeeks = Array.from({ length: weeks }, (_, index) => {
        const weekNumber = index + 1;
        const phase = getPhaseForWeek(weekNumber, weeks);
        const intensity = getWeekIntensity(weekNumber, weeks, proConfig.overloadCurve, phase);
        return {
          weekNumber,
          phase,
          intensity,
          isDeload: phase === 'Deload' || intensity <= 64,
          days: schedule.days.map((day, dayIndex) => {
            const focus = getDayFocus(proConfig.sport, dayIndex);
            return {
              day,
              focus,
              intensity,
              exercises: getProgramExercises(proConfig.sport, focus, phase, intensity)
            };
          })
        };
      });

      const generated = {
        sport: selectedSport?.label || 'ForgeAI Pro',
        schedule,
        durationWeeks: weeks,
        overload: selectedCurve?.label || 'Progressive Loading',
        totalSessions: schedule.days.length * weeks,
        targets: getProTargets(),
        phases: getProPhases(weeks),
        weeks: programWeeks
      };

      setProGeneratedProgram(generated);
      setExpandedWeek(1);
      setExpandedDay('1-0');
      setProStep(8);
    };

    const resetProFlow = () => {
      setProStep(1);
      setProGeneratedProgram(null);
      setExpandedWeek(null);
      setExpandedDay(null);
      setProConfig({
        sport: null,
        schedule: null,
        durationWeeks: null,
        overloadCurve: null,
        goals: {
          squat: { current: 150, target: null },
          bench: { current: 150, target: null },
          deadlift: { current: 200, target: null }
        }
      });
    };

    const canContinue = () => {
      if (proStep === 1) return !!proConfig.sport;
      if (proStep === 2) return !!proConfig.schedule;
      if (proStep === 3) return !!proConfig.durationWeeks;
      if (proStep === 4) return !!proConfig.overloadCurve;
      if (proStep === 5) return Object.values(proConfig.goals).every(goal => Number(goal.current) > 0);
      return true;
    };

    const nextProStep = () => {
      if (!canContinue()) return;
      if (proStep === 6) {
        if (proUnlocked) generateProProgram();
        else setProStep(7);
        return;
      }
      setProStep(step => Math.min(step + 1, 6));
    };

    const previousProStep = () => {
      if (proStep === 7) setProStep(6);
      else setProStep(step => Math.max(1, step - 1));
    };

    const updateGoalCurrent = (key, value) => {
      setProConfig(config => ({
        ...config,
        goals: {
          ...config.goals,
          [key]: { ...config.goals[key], current: value }
        }
      }));
    };

    const OptionCard = ({ selected, icon: Icon, title, subtitle, onClick, children }) => (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={`group min-h-[148px] rounded-[1.65rem] border p-4 text-left transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${
          selected
            ? 'selected-glow border-amber-200/45 bg-amber-200/[0.08] shadow-[0_24px_70px_rgba(245,158,11,0.13)]'
            : 'border-white/[0.08] bg-white/[0.035] hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.06]'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className={`grid h-11 w-11 place-items-center rounded-2xl border ${selected ? 'border-amber-200/35 bg-amber-200/[0.14] text-amber-100' : 'border-white/[0.08] bg-black/20 text-zinc-400'}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className={`grid h-6 w-6 place-items-center rounded-full border text-[0.65rem] ${selected ? 'border-amber-200/50 bg-amber-100 text-zinc-950' : 'border-white/[0.08] text-zinc-600'}`}>
            {selected ? '✓' : ''}
          </div>
        </div>
        <div className="mt-5 text-lg font-black tracking-[-0.045em] text-white">{title}</div>
        <p className="mt-2 text-xs leading-5 text-zinc-400">{subtitle}</p>
        {children}
      </button>
    );

    const ProStepper = () => (
      <div className="overflow-hidden rounded-[1.45rem] border border-white/[0.07] bg-black/25 p-3 backdrop-blur">
        <div className="grid grid-cols-6 gap-2">
          {proStepLabels.map((label, index) => {
            const stepNumber = index + 1;
            const complete = proStep > stepNumber;
            const current = proStep === stepNumber;
            return (
              <div key={label} className="min-w-0 text-center">
                <div className={`mx-auto grid h-8 w-8 place-items-center rounded-full border text-xs font-black transition ${
                  complete ? 'border-emerald-300/40 bg-emerald-300/15 text-emerald-200' :
                  current ? 'border-amber-200/50 bg-amber-100 text-zinc-950 shadow-[0_0_30px_rgba(245,158,11,0.28)]' :
                  'border-white/[0.08] bg-white/[0.03] text-zinc-600'
                }`}>
                  {complete ? '✓' : stepNumber}
                </div>
                <div className={`mt-2 truncate text-[0.58rem] font-bold uppercase tracking-[0.14em] ${current ? 'text-amber-100' : 'text-zinc-600'}`}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>
    );

    const ProStickyActions = ({ primary = 'Next', onPrimary = nextProStep, disabled = !canContinue(), showBack = proStep > 1 }) => (
      <div className="sticky bottom-28 z-20 mt-6 rounded-[1.7rem] border border-white/[0.08] bg-zinc-950/82 p-2 shadow-[0_-18px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="grid grid-cols-[0.8fr_1.2fr] gap-2">
          <button
            type="button"
            onClick={previousProStep}
            disabled={!showBack}
            className="rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-4 text-sm font-black text-zinc-300 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-35 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onPrimary}
            disabled={disabled}
            className="rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 px-5 py-4 text-sm font-black text-zinc-950 shadow-[0_18px_60px_rgba(245,158,11,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
          >
            {primary}
          </button>
        </div>
      </div>
    );

    const ProGoalTargets = () => {
      const targets = getProTargets();
      const labels = { squat: 'Back Squat 1RM', bench: 'Bench Press 1RM', deadlift: 'Deadlift 1RM' };
      return (
        <div className="space-y-4">
          {Object.entries(labels).map(([key, label]) => (
            <PremiumCard key={key} variant="secondary" className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</div>
                  <div className="mt-2 flex items-end gap-3">
                    <span className="text-3xl font-black tracking-[-0.06em] text-white">{targets[key].current || 0} kg</span>
                    <ChevronRight className="mb-2 h-5 w-5 text-zinc-600" />
                    <span className="text-3xl font-black tracking-[-0.06em] text-emerald-200">{targets[key].target || 0} kg</span>
                  </div>
                </div>
                <div className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-1 text-xs font-black text-emerald-200">+{targets[key].projection}%</div>
              </div>
              <label className="block">
                <span className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-zinc-500">Current max</span>
                <input
                  type="number"
                  min="0"
                  value={proConfig.goals[key].current}
                  onChange={(event) => updateGoalCurrent(key, event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-base font-bold text-white outline-none transition focus:border-amber-200/50 focus:ring-2 focus:ring-amber-200/20"
                  aria-label={`${label} current max`}
                />
              </label>
            </PremiumCard>
          ))}
        </div>
      );
    };

    const ProSummary = () => {
      const phases = getProPhases();
      const totalSessions = (selectedSchedule?.days.length || 0) * (proConfig.durationWeeks || 0);
      const rows = [
        ['Sport', selectedSport?.label, Dumbbell],
        ['Schedule', selectedSchedule?.days.join(' / '), Clock],
        ['Duration', `${proConfig.durationWeeks} Weeks`, CalendarIcon],
        ['Overload', selectedCurve?.label, BarChart3],
        ['Total Sessions', `${totalSessions} workouts`, ClipboardList],
        ['Phases', phases.join(' → '), Layers]
      ];
      return (
        <div className="space-y-4">
          <PremiumCard variant="hero">
            <div className="text-[0.64rem] font-bold uppercase tracking-[0.24em] text-amber-100/60">Program Summary</div>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.065em] text-white">{selectedSport?.label} Block</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">ForgeAI will generate a phase-based program with sport-specific days, progression logic, and goal targets.</p>
          </PremiumCard>
          <div className="space-y-3">
            {rows.map(([label, value, Icon]) => (
              <div key={label} className="flex items-center gap-4 rounded-[1.35rem] border border-white/[0.07] bg-white/[0.035] p-4">
                <IconBubble icon={Icon} />
                <div className="min-w-0 flex-1">
                  <div className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-zinc-500">{label}</div>
                  <div className="mt-1 truncate text-sm font-bold text-white">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };

    const ProPaywall = () => {
      const totalSessions = (selectedSchedule?.days.length || 0) * (proConfig.durationWeeks || 0);
      const features = ['Phase-based periodization', 'Progressive overload logic', 'Sport-specific exercise selection', 'Tempo & rest prescriptions per phase', 'Auto-calculated deload weeks', 'Realistic goal projections', 'Weekly structured workouts'];
      return (
        <div className="space-y-5">
          <PremiumCard variant="hero" className="relative overflow-hidden">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-300/15 blur-3xl" />
            <div className="relative">
              <div className="inline-flex rounded-full border border-amber-100/20 bg-amber-100/[0.08] px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.22em] text-amber-100">PRO Program</div>
              <h2 className="mt-5 text-4xl font-black tracking-[-0.065em] text-white">ForgeAI PRO Program</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">Your fully periodized {proConfig.durationWeeks} Weeks {selectedSport?.label} program with {totalSessions} sessions is ready to generate.</p>
              <div className="mt-6 space-y-3">
                {features.map(feature => (
                  <div key={feature} className="flex items-center gap-3 text-sm font-semibold text-zinc-200">
                    <CheckCircle2 className="h-5 w-5 text-emerald-200" />
                    {feature}
                  </div>
                ))}
              </div>
              <div className="mt-7 rounded-[1.4rem] border border-white/[0.08] bg-black/28 p-5">
                <div className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-zinc-500">One-time unlock</div>
                <div className="mt-2 text-5xl font-black tracking-[-0.07em] text-white">€14.99</div>
              </div>
            </div>
          </PremiumCard>
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => {
                setProUnlocked(true);
                generateProProgram();
              }}
              className="rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 px-6 py-4 text-sm font-black text-zinc-950 shadow-[0_18px_70px_rgba(245,158,11,0.28)] transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              Unlock & Generate Program
            </button>
            <button
              type="button"
              onClick={() => setProStep(6)}
              className="rounded-full border border-white/[0.08] bg-white/[0.04] px-6 py-4 text-sm font-black text-zinc-300 transition hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    };

    const phaseTone = (phase) => {
      if (phase === 'Deload') return 'border-sky-300/20 bg-sky-300/[0.08] text-sky-200';
      if (phase === 'Peaking') return 'border-amber-200/25 bg-amber-200/[0.08] text-amber-100';
      if (phase === 'Strength' || phase === 'Intensification') return 'border-orange-300/20 bg-orange-300/[0.08] text-orange-100';
      if (phase === 'Hypertrophy' || phase === 'Accumulation') return 'border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-200';
      return 'border-violet-300/20 bg-violet-300/[0.08] text-violet-200';
    };

    const ProgramExerciseRow = ({ exercise }) => (
      <div className="rounded-[1.2rem] border border-white/[0.06] bg-black/22 p-3">
        <div className="flex items-start gap-3">
          <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-black ${exercise.main ? 'border-amber-200/45 bg-amber-100 text-zinc-950' : 'border-white/[0.08] bg-white/[0.04] text-zinc-300'}`}>{exercise.label}</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base font-black tracking-[-0.035em] text-white">{exercise.name}</h4>
              {exercise.main && <span className="rounded-full border border-amber-200/20 bg-amber-200/[0.08] px-2 py-0.5 text-[0.58rem] font-black uppercase tracking-[0.16em] text-amber-100">Main</span>}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              {[
                ['Sets', exercise.setsReps],
                ['Load', exercise.intensity],
                ['Tempo', exercise.tempo],
                ['Rest', exercise.rest]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/[0.05] bg-white/[0.035] px-2 py-2">
                  <div className="text-[0.52rem] font-bold uppercase tracking-[0.16em] text-zinc-600">{label}</div>
                  <div className="mt-1 text-xs font-black text-zinc-100">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );

    const ProgramDayCard = ({ day, weekNumber, dayIndex }) => {
      const id = `${weekNumber}-${dayIndex}`;
      const open = expandedDay === id;
      return (
        <div className="rounded-[1.45rem] border border-white/[0.07] bg-white/[0.035]">
          <button
            type="button"
            onClick={() => setExpandedDay(open ? null : id)}
            className="flex w-full items-center justify-between gap-3 p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            aria-expanded={open}
          >
            <div>
              <div className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-zinc-500">{day.day}</div>
              <div className="mt-1 text-lg font-black tracking-[-0.04em] text-white">{day.focus}</div>
            </div>
            <ChevronRight className={`h-5 w-5 text-zinc-500 transition ${open ? 'rotate-90' : ''}`} />
          </button>
          {open && (
            <div className="space-y-3 border-t border-white/[0.06] p-3">
              {day.exercises.map(exercise => <ProgramExerciseRow key={`${day.day}-${exercise.label}`} exercise={exercise} />)}
            </div>
          )}
        </div>
      );
    };

    const ProgramWeekCard = ({ week }) => {
      const open = expandedWeek === week.weekNumber;
      return (
        <PremiumCard variant="secondary" className="p-0">
          <button
            type="button"
            onClick={() => setExpandedWeek(open ? null : week.weekNumber)}
            className="flex w-full items-center justify-between gap-4 p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            aria-expanded={open}
          >
            <div className="flex items-center gap-4">
              <div className={`grid h-12 w-12 place-items-center rounded-2xl border text-sm font-black ${phaseTone(week.phase)}`}>W{week.weekNumber}</div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-black tracking-[-0.045em] text-white">{week.phase}</h3>
                  {week.isDeload && <span className="rounded-full border border-sky-300/20 bg-sky-300/[0.08] px-2 py-0.5 text-[0.58rem] font-black uppercase tracking-[0.16em] text-sky-200">Deload</span>}
                </div>
                <p className="mt-1 text-xs font-semibold text-zinc-500">{week.days.length} sessions</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black tracking-[-0.05em] text-amber-100">{week.intensity}%</div>
              <div className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-zinc-600">Intensity</div>
            </div>
          </button>
          {open && (
            <div className="space-y-3 border-t border-white/[0.06] p-4">
              {week.days.map((day, dayIndex) => (
                <ProgramDayCard key={`${week.weekNumber}-${day.day}`} day={day} weekNumber={week.weekNumber} dayIndex={dayIndex} />
              ))}
            </div>
          )}
        </PremiumCard>
      );
    };

    const ProGeneratedProgram = () => {
      if (!proGeneratedProgram) return null;
      const targetLabels = { squat: 'Back Squat', bench: 'Bench Press', deadlift: 'Deadlift' };
      return (
        <div className="space-y-5">
          <PremiumCard variant="hero" className="relative overflow-hidden">
            <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-amber-300/12 blur-3xl" />
            <div className="relative">
              <div className="inline-flex rounded-full border border-amber-100/20 bg-amber-100/[0.08] px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.22em] text-amber-100">ForgeAI PRO</div>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.065em] text-white">{proGeneratedProgram.sport} — {proGeneratedProgram.durationWeeks} Weeks</h1>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-zinc-300">
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">{proGeneratedProgram.schedule.days.join(' / ')}</span>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">{proGeneratedProgram.overload}</span>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">{proGeneratedProgram.totalSessions} sessions</span>
              </div>
            </div>
          </PremiumCard>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(proGeneratedProgram.targets).map(([key, target]) => (
              <div key={key} className="rounded-[1.35rem] border border-white/[0.07] bg-white/[0.035] p-3 text-center">
                <div className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-zinc-600">{targetLabels[key]}</div>
                <div className="mt-2 text-lg font-black tracking-[-0.04em] text-emerald-200">{target.target} kg</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {proGeneratedProgram.phases.map(phase => (
              <span key={phase} className={`rounded-full border px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.16em] ${phaseTone(phase)}`}>{phase}</span>
            ))}
          </div>
          <div className="space-y-4">
            {proGeneratedProgram.weeks.map(week => <ProgramWeekCard key={week.weekNumber} week={week} />)}
          </div>
          <button
            type="button"
            onClick={resetProFlow}
            className="w-full rounded-full border border-white/[0.08] bg-white/[0.04] px-6 py-4 text-sm font-black text-white transition hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
          >
            Create New Program
          </button>
        </div>
      );
    };

    const renderStep = () => {
      if (proStep === 1) {
        return (
          <>
            <ScreenHeader eyebrow="ForgeAI Pro" title="Choose Your Sport" subtitle="Select the performance system your periodized block should optimize for." icon={Crown} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {proSports.map(sport => (
                <OptionCard
                  key={sport.id}
                  selected={proConfig.sport === sport.id}
                  icon={sport.icon}
                  title={sport.label}
                  subtitle={sport.desc}
                  onClick={() => setProConfig(config => ({ ...config, sport: sport.id }))}
                />
              ))}
            </div>
            <ProStickyActions showBack={false} />
          </>
        );
      }
      if (proStep === 2) {
        return (
          <>
            <ScreenHeader eyebrow="Weekly Schedule" title="Training Rhythm" subtitle="Choose the weekly structure ForgeAI should build around." icon={Clock} />
            <div className="space-y-3">
              {proSchedules.map(schedule => (
                <button
                  key={schedule.id}
                  type="button"
                  onClick={() => setProConfig(config => ({ ...config, schedule: schedule.id }))}
                  aria-pressed={proConfig.schedule === schedule.id}
                  className={`w-full rounded-[1.55rem] border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${proConfig.schedule === schedule.id ? 'selected-glow border-amber-200/45 bg-amber-200/[0.08]' : 'border-white/[0.08] bg-white/[0.035] hover:bg-white/[0.06]'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-black tracking-[-0.045em] text-white">{schedule.label}</div>
                    <div className="text-xs font-bold text-zinc-500">{schedule.days.length} sessions/week</div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {schedule.days.map(day => <span key={day} className="rounded-full border border-white/[0.08] bg-black/24 px-3 py-1.5 text-xs font-bold text-zinc-300">{day}</span>)}
                  </div>
                </button>
              ))}
            </div>
            <ProStickyActions />
          </>
        );
      }
      if (proStep === 3) {
        return (
          <>
            <ScreenHeader eyebrow="Program Duration" title="Pick The Block Length" subtitle="Short blocks move fast. Longer cycles create more room for phases." icon={CalendarIcon} />
            <div className="grid grid-cols-2 gap-3">
              {proDurations.map(duration => (
                <button
                  key={duration.weeks}
                  type="button"
                  onClick={() => setProConfig(config => ({ ...config, durationWeeks: duration.weeks }))}
                  aria-pressed={proConfig.durationWeeks === duration.weeks}
                  className={`rounded-[1.55rem] border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${proConfig.durationWeeks === duration.weeks ? 'selected-glow border-amber-200/45 bg-amber-200/[0.08]' : 'border-white/[0.08] bg-white/[0.035] hover:bg-white/[0.06]'}`}
                >
                  <div className="text-3xl font-black tracking-[-0.06em] text-white">{duration.weeks}</div>
                  <div className="mt-1 text-sm font-black uppercase tracking-[0.16em] text-amber-100/70">Weeks</div>
                  <p className="mt-4 text-xs leading-5 text-zinc-400">{duration.desc}</p>
                </button>
              ))}
            </div>
            <ProStickyActions />
          </>
        );
      }
      if (proStep === 4) {
        return (
          <>
            <ScreenHeader eyebrow="Progressive Overload" title="Choose The Curve" subtitle="ForgeAI will use this loading model to organize intensity across the block." icon={BarChart3} />
            <div className="space-y-3">
              {proCurves.map(curve => (
                <button
                  key={curve.id}
                  type="button"
                  onClick={() => setProConfig(config => ({ ...config, overloadCurve: curve.id }))}
                  aria-pressed={proConfig.overloadCurve === curve.id}
                  className={`w-full rounded-[1.55rem] border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${proConfig.overloadCurve === curve.id ? 'selected-glow border-amber-200/45 bg-amber-200/[0.08]' : 'border-white/[0.08] bg-white/[0.035] hover:bg-white/[0.06]'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-black tracking-[-0.04em] text-white">{curve.label}</div>
                      <p className="mt-2 text-xs leading-5 text-zinc-400">{curve.desc}</p>
                    </div>
                    <div className="flex h-14 items-end gap-1 rounded-2xl border border-white/[0.06] bg-black/22 px-3 py-2">
                      {curve.bars.map((height, index) => <span key={index} className="w-2 rounded-full bg-gradient-to-t from-amber-500/70 to-amber-100" style={{ height: `${height}%` }} />)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <ProStickyActions />
          </>
        );
      }
      if (proStep === 5) {
        return (
          <>
            <ScreenHeader eyebrow="Goal Targets" title="Realistic Projections" subtitle="Edit your current maxes. ForgeAI recalculates targets from sport, duration and overload." icon={Target} />
            <ProGoalTargets />
            <ProStickyActions />
          </>
        );
      }
      if (proStep === 6) {
        return (
          <>
            <ProSummary />
            <ProStickyActions primary="Generate My Program" />
          </>
        );
      }
      if (proStep === 7) return <ProPaywall />;
      return <ProGeneratedProgram />;
    };

    return (
      <div className="space-y-5">
        {proStep <= 6 && <ProStepper />}
        {renderStep()}
      </div>
    );
  };

  const YouTab = () => (
    <div className="space-y-5">
      <PremiumCard variant="hero">
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-20 place-items-center rounded-[1.7rem] bg-amber-100 text-2xl font-black text-zinc-950">MJ</div>
          <div>
            <div className="rounded-full border border-amber-100/16 bg-amber-100/[0.08] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-100">Pro Member</div>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-white">Martin Jancar</h1>
            <p className="mt-1 text-sm text-zinc-400">Performance-focused training profile</p>
          </div>
        </div>
      </PremiumCard>
      <div className="grid grid-cols-3 gap-3">
        <MetricTile icon={Flame} label="Streak" value="12d" />
        <MetricTile icon={Dumbbell} label="Week" value="4 sessions" tone="blue" />
        <MetricTile icon={Trophy} label="PRs" value="18" tone="green" />
      </div>
      <PremiumCard variant="secondary">
        <SectionHeader icon={Award} eyebrow="Records" title="Personal Records" subtitle={null} />
        <div className="space-y-3 text-sm">
          {['Bench Press 120 kg', 'Back Squat 165 kg', 'Deadlift 205 kg'].map(record => (
            <div key={record} className="flex items-center justify-between rounded-2xl bg-black/20 p-4">
              <span className="font-semibold text-white">{record}</span>
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            </div>
          ))}
        </div>
      </PremiumCard>
      <PremiumCard variant="flat">
        <div className="space-y-2">
          {['Training Preferences', 'Units & Equipment', 'Notifications', 'Privacy', 'Export Data'].map(setting => (
            <button key={setting} type="button" className="flex w-full items-center justify-between rounded-2xl p-4 text-left font-semibold text-zinc-300 transition hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200">
              <span className="inline-flex items-center gap-3"><Settings className="h-4 w-4 text-zinc-500" />{setting}</span>
              <ChevronRight className="h-4 w-4 text-zinc-600" />
            </button>
          ))}
        </div>
      </PremiumCard>
    </div>
  );

  const PremiumShell = () => {
    if (isWorkoutSessionActive) return WorkoutSessionView();

    return (
    <div className="relative min-h-screen overflow-hidden text-white antialiased">
      <Background />
      <style>{`
        @keyframes premiumFadeUp {
          from { opacity: 0; transform: translateY(18px) scale(.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes orbRotate {
          to { transform: rotate(360deg); }
        }
        @keyframes orbPulse {
          0%, 100% { opacity: .62; transform: scale(.985); }
          50% { opacity: 1; transform: scale(1.015); }
        }
        .premium-reveal {
          opacity: 0;
          animation: premiumFadeUp .72s cubic-bezier(.2,.8,.2,1) forwards;
          animation-delay: var(--delay, 0ms);
        }
        .workout-card {
          opacity: 0;
          animation: premiumFadeUp .62s cubic-bezier(.2,.8,.2,1) forwards;
          animation-delay: var(--delay, 0ms);
        }
        .orb-ring {
          animation: orbRotate 18s linear infinite, orbPulse 5s ease-in-out infinite;
          border-style: dashed;
        }
        .orb-ring-slow {
          animation: orbRotate 30s linear infinite reverse;
          border-style: dashed;
        }
        .selected-glow {
          box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 0 44px rgba(245,158,11,.10);
        }
        @media (prefers-reduced-motion: reduce) {
          .premium-reveal,
          .workout-card,
          .orb-ring,
          .orb-ring-slow {
            opacity: 1;
            animation: none;
            transform: none;
          }
        }
      `}</style>

      <main className={`relative mx-auto w-full px-4 pb-36 sm:px-6 lg:px-8 ${activeTab === 'workout' ? 'max-w-7xl' : 'max-w-xl'}`}>
        {activeTab === 'workout' ? (!showWorkout ? (
          <>
            {Hero()}
            {Preferences()}
            {TrainingInsights({})}
          </>
        ) : (
          <div className="py-10 md:py-16">
            <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                {Logo()}
                <div>
                  <div className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-amber-100/58">ForgeAI</div>
                  <h1 className="text-5xl font-black leading-none tracking-[-0.065em] text-white md:text-7xl">Elite Session</h1>
                  <p className="mt-2 text-base leading-7 text-zinc-400">Your personalized workout session is ready.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWorkout(false)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.085] bg-white/[0.035] px-5 py-3 text-sm font-bold text-zinc-200 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/[0.065] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Preferences
              </button>
            </div>

            {workout && (
              <div className="grid gap-10 xl:grid-cols-[0.72fr_1.28fr] xl:items-start">
                <div className="space-y-6 xl:sticky xl:top-6">
                  {TrainingInsights({ compact: true })}
                  <PremiumCard delay={160} variant="flat">
                    <SectionHeader icon={Sparkles} eyebrow="Coach Notes" title="Training Insights" subtitle="Move with intent, keep tempo honest, and let the programmed rest preserve quality." />
                    <div className="space-y-3 text-sm leading-6 text-zinc-300">
                      <p>Prioritize clean reps over chasing load. The session is built to match your selected goal and available time.</p>
                      <p>Use the tempo prompts for control, and open each muscle profile when you want a fast intent check before a set.</p>
                    </div>
                  </PremiumCard>
                </div>

                <section className="space-y-5">
                  <div className="mb-2">
                    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-amber-100/58">Generated Workout</div>
                    <h2 className="mt-2 text-4xl font-black tracking-[-0.06em] text-white md:text-6xl">Precision Blocks</h2>
                  </div>
                  {workout.map((exercise, idx) => (
                    <React.Fragment key={`${exercise.label}-${exercise.name}-${idx}`}>
                      {ExerciseCard({ exercise, idx })}
                    </React.Fragment>
                  ))}
                  <button
                    type="button"
                    onClick={startWorkoutSession}
                    className="group mt-3 inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-amber-200 via-orange-300 to-orange-400 px-8 py-5 text-lg font-black text-zinc-950 shadow-[0_20px_80px_rgba(245,158,11,0.24)] transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_26px_110px_rgba(245,158,11,0.32)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-100 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    Start Workout
                    <Timer className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={generateWorkout}
                    className="group inline-flex w-full items-center justify-center gap-3 rounded-full border border-white/[0.085] bg-white/[0.035] px-8 py-5 text-lg font-black text-white shadow-[0_18px_70px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:bg-white/[0.065] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-100 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    Generate New Workout
                    <ChevronRight className="h-5 w-5 transition group-hover:translate-x-1" />
                  </button>
                </section>
              </div>
            )}
          </div>
        )) : (
          <div className="py-10 md:py-14">
            {activeTab === 'log' && LogTab()}
            {activeTab === 'ai' && AITab()}
            {activeTab === 'pro' && ProTab()}
            {activeTab === 'you' && YouTab()}
          </div>
        )}
      </main>

      {BottomNav()}

      {showExerciseDemo && (
        <ExerciseDemo exerciseName={showExerciseDemo} onClose={() => setShowExerciseDemo(null)} />
      )}
    </div>
    );
  };

  const LegacyApp = () => (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {!showWorkout ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <Logo />
                <h1 className="text-4xl md:text-5xl font-bold">ForgeAI</h1>
              </div>
              <p className="text-zinc-400 text-lg">Configure your parameters. The AI will construct your optimal session.</p>
            </div>

            {/* Select Your Goal */}
            <div className="bg-zinc-900 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold">Select Your Goal</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <OptionButton
                  isSelected={settings.goal === 'build-muscle'}
                  onClick={() => setSettings({...settings, goal: 'build-muscle'})}
                  title="Build Muscle"
                  subtitle="Hypertrophy focus"
                />
                <OptionButton
                  isSelected={settings.goal === 'strength'}
                  onClick={() => setSettings({...settings, goal: 'strength'})}
                  title="Strength"
                  subtitle="Heavy weights, low reps"
                />
                <OptionButton
                  isSelected={settings.goal === 'fat-loss'}
                  onClick={() => setSettings({...settings, goal: 'fat-loss'})}
                  title="Power"
                  subtitle="Sport performance, explosive main lifts"
                />
                <OptionButton
                  isSelected={settings.goal === 'v02-max'}
                  onClick={() => setSettings({...settings, goal: 'v02-max'})}
                  title="Conditioning"
                  subtitle="V02 max, aerobic conditioning"
                />
              </div>
            </div>

            {/* Experience Level or Conditioning Type */}
            {settings.goal === 'v02-max' ? (
            <div className="bg-zinc-900 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold">Conditioning Type</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <OptionButton
                  isSelected={settings.conditioningType === 'cardio'}
                  onClick={() => setSettings({...settings, conditioningType: 'cardio'})}
                  title="Cardio"
                  subtitle="Zone 2, steady state"
                />
                <OptionButton
                  isSelected={settings.conditioningType === 'vo2max'}
                  onClick={() => setSettings({...settings, conditioningType: 'vo2max'})}
                  title="VO2 Max"
                  subtitle="High-intensity intervals"
                />
              </div>
            </div>
            ) : (
            <div className="bg-zinc-900 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold">Experience Level</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <OptionButton
                  isSelected={settings.experience === 'beginner'}
                  onClick={() => setSettings({...settings, experience: 'beginner'})}
                  title="Beginner"
                  subtitle="0-1 years exp"
                />
                <OptionButton
                  isSelected={settings.experience === 'intermediate'}
                  onClick={() => setSettings({...settings, experience: 'intermediate'})}
                  title="Intermediate"
                  subtitle="1-3 years exp"
                />
                <OptionButton
                  isSelected={settings.experience === 'advanced'}
                  onClick={() => setSettings({...settings, experience: 'advanced'})}
                  title="Advanced"
                  subtitle="3+ years exp"
                />
              </div>
            </div>
            )}

            {/* Equipment Access — hidden for Conditioning */}
            {settings.goal !== 'v02-max' && (
            <div className="bg-zinc-900 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Dumbbell className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold">Equipment Access</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <OptionButton
                  isSelected={settings.equipment === 'full-gym'}
                  onClick={() => setSettings({...settings, equipment: 'full-gym'})}
                  title="Full Gym"
                  subtitle="Machines, Barbells, Dumbbells"
                />
                <OptionButton
                  isSelected={settings.equipment === 'barbells-only'}
                  onClick={() => setSettings({...settings, equipment: 'barbells-only'})}
                  title="Barbells Only"
                  subtitle="Racks and plates required"
                />
                <OptionButton
                  isSelected={settings.equipment === 'dumbbells-only'}
                  onClick={() => setSettings({...settings, equipment: 'dumbbells-only'})}
                  title="Dumbbell/Kettlebells Only"
                  subtitle="Portable weights only"
                />
                <OptionButton
                  isSelected={settings.equipment === 'no-equipment'}
                  onClick={() => setSettings({...settings, equipment: 'no-equipment'})}
                  title="No Equipment"
                  subtitle="Bodyweight only"
                />
              </div>
            </div>
            )}

            {/* Session Focus — hidden for Conditioning */}
            {settings.goal !== 'v02-max' && (
            <div className="bg-zinc-900 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold">Session Focus</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <OptionButton
                  isSelected={settings.focus === 'full-body'}
                  onClick={() => setSettings({...settings, focus: 'full-body'})}
                  title="Full Body"
                />
                <OptionButton
                  isSelected={settings.focus === 'upper-body'}
                  onClick={() => setSettings({...settings, focus: 'upper-body'})}
                  title="Upper Body (Chest, Back, Shoulders)"
                />
                <OptionButton
                  isSelected={settings.focus === 'legs'}
                  onClick={() => setSettings({...settings, focus: 'legs'})}
                  title="Legs"
                />
                <OptionButton
                  isSelected={settings.focus === 'chest-back'}
                  onClick={() => setSettings({...settings, focus: 'chest-back'})}
                  title="Chest & Back"
                />
                <OptionButton
                  isSelected={settings.focus === 'arms'}
                  onClick={() => setSettings({...settings, focus: 'arms'})}
                  title="Arms"
                />
              </div>
            </div>
            )}

            {/* Workout Style — hidden for Conditioning */}
            {settings.goal !== 'v02-max' && (
            <div className="bg-zinc-900 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold">Workout Style</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <OptionButton
                  isSelected={settings.workoutStyle === 'paired'}
                  onClick={() => setSettings({...settings, workoutStyle: 'paired'})}
                  title="Paired Workout"
                  subtitle="Antagonist muscles (A1/A2, B1/B2)"
                />
                <OptionButton
                  isSelected={settings.workoutStyle === 'straight'}
                  onClick={() => setSettings({...settings, workoutStyle: 'straight'})}
                  title="Straight Sets"
                  subtitle="One exercise at a time (A, B, C, D)"
                />
              </div>
            </div>
            )}

            {/* Duration — hidden for Conditioning */}
            {settings.goal !== 'v02-max' && (
            <div className="bg-zinc-900 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold">Time available</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['20m', '30m', '45m', '60m'].map(duration => (
                  <OptionButton
                    key={duration}
                    isSelected={settings.duration === duration}
                    onClick={() => setSettings({...settings, duration})}
                    title={duration}
                  />
                ))}
              </div>
            </div>
            )}

            {/* Forge Workout Button */}
            <button
              onClick={generateWorkout}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-5 rounded-xl font-bold text-xl hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              FORGE WORKOUT
              <span className="text-2xl">›</span>
            </button>
          </>
        ) : (
          <>
            {/* Workout Page */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Logo />
                  <h1 className="text-4xl md:text-5xl font-bold">ForgeAI</h1>
                </div>
                <button
                  onClick={() => setShowWorkout(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  ← Back
                </button>
              </div>
              <p className="text-zinc-400 text-lg">Your personalized workout session</p>
            </div>

            {/* Workout Results */}
            {workout && (
              <div className="bg-zinc-900 rounded-2xl p-6 md:p-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2">Your Workout</h2>
                  <div className="flex flex-wrap gap-3 text-sm text-zinc-400">
                    <span className="bg-zinc-800 px-3 py-1 rounded-lg">
                      Goal: {settings.goal === 'v02-max' ? 'Conditioning' : settings.goal === 'fat-loss' ? 'Power' : settings.goal.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                    <span className="bg-zinc-800 px-3 py-1 rounded-lg">
                      {settings.goal === 'v02-max' ? (settings.conditioningType === 'vo2max' ? 'VO2 Max' : 'Steady State Cardio') : (settings.experience.charAt(0).toUpperCase() + settings.experience.slice(1))}
                    </span>
                    {settings.goal !== 'v02-max' && (
                    <span className="bg-zinc-800 px-3 py-1 rounded-lg">
                      Time available: {settings.duration}
                    </span>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  {workout.map((exercise, idx) => {
                    const muscles = muscleData[exercise.name] || { primary: '', secondary: '', stabilizers: '' };
                    return (
                      <div key={idx} className="bg-zinc-800 rounded-lg p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <span className="font-bold text-orange-500 text-xl">{exercise.label}.</span>{' '}
                            <span className="font-semibold text-white text-xl">{exercise.name}</span>
                            {exercise.isMain && (
                              <span className="ml-2 px-2 py-0.5 bg-orange-600 text-white text-xs rounded-full">MAIN</span>
                            )}
                            {exercise.isConditioning && !exercise.isVo2Max && (
                              <span className="ml-2 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">ZONE 2</span>
                            )}
                            {exercise.isVo2Max && (
                              <span className="ml-2 px-2 py-0.5 bg-orange-600 text-white text-xs rounded-full">MAIN</span>
                            )}
                          </div>
                          {!exercise.isConditioning && (
                            <button
                              onClick={() => setShowExerciseDemo(exercise.name)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-400 hover:text-white transition-colors text-xs"
                              title="View exercise demo"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                              </svg>
                              Form
                            </button>
                          )}
                        </div>
                        
                        {/* Scheme Name - V2 Style */}
                        {exercise.schemeName && (
                          <div className="mb-3 p-2 bg-zinc-700/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-orange-400 font-semibold text-sm">{exercise.schemeName}</span>
                              {exercise.schemeDescription && !exercise.vo2Protocol && (
                                <span className="text-zinc-400 text-xs">- {exercise.schemeDescription}</span>
                              )}
                            </div>
                            {exercise.vo2Protocol && exercise.schemeDescription && (
                              <div className="mt-1 text-zinc-300 text-xs leading-relaxed">{exercise.schemeDescription}</div>
                            )}
                            {exercise.schemeExample && (
                              <div className="mt-1 text-xs text-zinc-500 italic">
                                Example: {exercise.schemeExample}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {exercise.isConditioning ? (
                          exercise.vo2Protocol ? (
                            <div className="space-y-4 text-sm">
                              <div className="p-4 bg-orange-900/20 border border-orange-700/30 rounded-lg">
                                <div className="text-orange-400 font-bold mb-2 text-base">How To</div>
                                <div className="text-white leading-relaxed text-sm">{exercise.vo2Protocol.howTo}</div>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="bg-zinc-700/50 rounded-lg p-3 text-center">
                                  <div className="text-zinc-400 mb-1">Sprint</div>
                                  <div className="text-white font-bold text-base">{exercise.vo2Protocol.sprint}</div>
                                </div>
                                <div className="bg-zinc-700/50 rounded-lg p-3 text-center">
                                  <div className="text-zinc-400 mb-1">Rest</div>
                                  <div className="text-white font-bold text-base">{exercise.vo2Protocol.recovery}</div>
                                </div>
                                <div className="bg-zinc-700/50 rounded-lg p-3 text-center">
                                  <div className="text-zinc-400 mb-1">Sets</div>
                                  <div className="text-white font-bold text-base">{exercise.vo2Protocol.rounds}</div>
                                </div>
                              </div>
                              <div className="bg-zinc-700/50 rounded-lg p-3">
                                <div className="text-green-400 font-semibold mb-2">Benefits</div>
                                <div className="text-zinc-300 leading-relaxed">
                                  {exercise.vo2Protocol.benefits.split('. ').filter(b => b.trim()).map((benefit, i) => (
                                    <div key={i} className="flex gap-2 mb-1">
                                      <span className="text-green-400">-</span>
                                      <span>{benefit.replace(/\.$/, '')}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="bg-zinc-700/50 rounded-lg p-3">
                                <div className="text-purple-400 font-semibold mb-2">Who's It For</div>
                                <div className="text-zinc-300 leading-relaxed">
                                  {exercise.vo2Protocol.whoFor.split('. ').filter(w => w.trim()).map((who, i) => (
                                    <div key={i} className="flex gap-2 mb-1">
                                      <span className="text-purple-400">-</span>
                                      <span>{who.replace(/\.$/, '')}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                          <div className="text-sm mb-3">
                            <div className="text-zinc-400 mb-1">Protocol</div>
                            <div className="text-white font-semibold text-lg">{exercise.setsReps}</div>
                          </div>
                          )
                        ) : (
                        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                          <div>
                            <div className="text-zinc-400 mb-1">Sets × Reps</div>
                            <div className="text-white font-semibold">{exercise.setsReps}</div>
                          </div>
                          <div className="relative">
                            <div className="text-zinc-400 mb-1 flex items-center gap-1">
                              Tempo
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowTempoInfo(showTempoInfo === idx ? null : idx); }}
                                className="w-4 h-4 rounded-full bg-zinc-600 text-zinc-300 text-xs flex items-center justify-center hover:bg-zinc-500 transition-colors"
                              >?</button>
                            </div>
                            {showTempoInfo === idx && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowTempoInfo(null)} />
                                <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-zinc-900 border border-zinc-600 rounded-lg p-4 shadow-xl text-xs">
                                  <div className="font-bold text-white text-sm mb-2">What is Tempo?</div>
                                  <p className="text-zinc-300 mb-2">A 4-digit code defining the speed of each phase of a rep measured in seconds.</p>
                                  <div className="font-semibold text-orange-400 mb-1">Reading the 4 digits:</div>
                                  <div className="space-y-1 mb-3 text-zinc-300">
                                    <div><span className="text-white font-semibold">1st</span> — Eccentric (lowering). Seconds to lower the weight.</div>
                                    <div><span className="text-white font-semibold">2nd</span> — Pause at the bottom (stretched position).</div>
                                    <div><span className="text-white font-semibold">3rd</span> — Concentric (lifting). "X" = as fast as possible.</div>
                                    <div><span className="text-white font-semibold">4th</span> — Pause at the top (lockout).</div>
                                  </div>
                                  {exercise.tempo && exercise.tempo !== '—' && exercise.tempo !== 'random' && (() => {
                                    const t = exercise.tempo;
                                    const phases = getTempoPhases(exercise.name);
                                    const cf = phases.concentricFirst;
                                    const d1 = t[0] === 'X' ? 'Explosive' : t[0] + 's';
                                    const d2 = t[1] === '0' ? 'No pause' : t[1] + 's pause';
                                    const d3 = t[2] === 'X' ? 'Explosive' : t[2] + 's';
                                    const d4 = t[3] === '0' ? 'No pause' : t[3] + 's pause';
                                    return (
                                      <div className="p-2 bg-orange-900/20 border border-orange-700/30 rounded-lg mb-2">
                                        <div className="font-semibold text-orange-400 mb-1">{exercise.name} — {exercise.tempo}</div>
                                        {cf && (
                                          <div className="text-yellow-400 text-xs mb-1.5">⚡ This exercise starts with the concentric (3rd digit) — you lift first, then lower.</div>
                                        )}
                                        <div className="space-y-0.5 text-zinc-300">
                                          {cf ? (
                                            <>
                                              <div className="opacity-50"><span className="text-white font-semibold">1st ({d1})</span> {phases.eccentric}</div>
                                              <div className="opacity-50"><span className="text-white font-semibold">2nd ({d2})</span> {phases.bottom}</div>
                                              <div className="border-l-2 border-yellow-400 pl-1.5"><span className="text-white font-semibold">3rd ({d3})</span> {phases.concentric} <span className="text-yellow-400">← START HERE</span></div>
                                              <div className="border-l-2 border-yellow-400 pl-1.5"><span className="text-white font-semibold">4th ({d4})</span> {phases.top}</div>
                                              <div className="border-l-2 border-yellow-400 pl-1.5"><span className="text-white font-semibold">1st ({d1})</span> {phases.eccentric}</div>
                                              <div className="border-l-2 border-yellow-400 pl-1.5"><span className="text-white font-semibold">2nd ({d2})</span> {phases.bottom}</div>
                                            </>
                                          ) : (
                                            <>
                                              <div><span className="text-white font-semibold">1st ({d1})</span> {phases.eccentric}</div>
                                              <div><span className="text-white font-semibold">2nd ({d2})</span> {phases.bottom}</div>
                                              <div><span className="text-white font-semibold">3rd ({d3})</span> {phases.concentric}</div>
                                              <div><span className="text-white font-semibold">4th ({d4})</span> {phases.top}</div>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                  <p className="text-zinc-400 italic">Controlling tempo increases time under tension, enhances muscular tension and irradiation, improves the mind–muscle connection, and drives specific training adaptations.</p>
                                </div>
                              </>
                            )}
                            <div className="text-white font-semibold">{exercise.tempo}</div>
                          </div>
                          <div>
                            <div className="text-zinc-400 mb-1">Rest</div>
                            <div className="text-white font-semibold">{exercise.rest}</div>
                          </div>
                        </div>
                        )}
                        {!exercise.isConditioning && muscles.primary && (
                          <div className="border-t border-zinc-700 pt-3 space-y-2">
                            <div className="text-xs">
                              <span className="text-orange-400 font-semibold">Primary:</span>{' '}
                              <span className="text-zinc-300">{muscles.primary}</span>
                            </div>
                            {muscles.secondary && (
                              <div className="text-xs">
                                <span className="text-purple-400 font-semibold">Secondary:</span>{' '}
                                <span className="text-zinc-300">{muscles.secondary}</span>
                              </div>
                            )}
                            {muscles.stabilizers && (
                              <div className="text-xs">
                                <span className="text-blue-400 font-semibold">Stabilizers:</span>{' '}
                                <span className="text-zinc-300">{muscles.stabilizers}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Generate New Workout Button */}
                <button
                  onClick={generateWorkout}
                  className="w-full mt-6 bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-lg"
                >
                  🔄 Generate New Workout
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {/* Exercise Demo Modal */}
      {showExerciseDemo && (
        <ExerciseDemo exerciseName={showExerciseDemo} onClose={() => setShowExerciseDemo(null)} />
      )}
    </div>
  );

  void LegacyApp;
  return PremiumShell();
}
