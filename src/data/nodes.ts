import type { ZoomNode } from '../types';

// This is the default data used to initialize the store. In a real app,
// this would likely come from an API and be set via `setNodes`.
export const nodes: ZoomNode[] = [
  {
    id: "moon1",
    role: "moon",
    title: "The Confident Leader",
    subtitle: "You couldn't name what was scary about leading before. This month, you uncovered it — taking up space — and began carving a path forward.",
    color: "#a43e63",
    positions: {
      level1: { x: -480, y: 25 },
      level2: { x: -480, y: 25 },
      level3: { x: 0, y: 0 }
    },
    progress: 50,
    goals: [
      { id: 'g1-1', title: "Uncover why you hesitate to take the lead.", status: "completed", date: "04/14/25", recap: "Recap coming soon!", progress: 100, completed: true },
      { id: 'g1-2', title: "Explore your fear of judgment.", status: "completed", date: "04/12/25", recap: "Recap coming soon!", progress: 100, completed: true },
      { id: 'g1-3', title: "Notice when you defer decisions to avoid conflict.", status: "completed", date: "04/10/25", recap: "Recap coming soon!", progress: 100, completed: true },
      { id: 'g1-4', title: "Roleplay leading a tough conversation.", status: "completed", date: "04/08/25", recap: "Recap coming soon!", progress: 100, completed: true },
      { id: 'g1-5', title: "Practice giving clear direction.", status: "completed", date: "04/05/25", recap: "Recap coming soon!", progress: 100, completed: true },
      { id: 'g1-6', title: "Share leadership vision with a mentor by Friday.", status: "active", recap: "", progressText: "You've drafted most of your vision. Just a few tweaks left before sharing it!", progress: 80, completed: false },
      { id: 'g1-7', title: "Practice one leadership skill daily for 2 weeks.", status: "active", recap: "", progressText: "You've practiced for 5 days in a row. Keep going—consistency is key!", progress: 35, completed: false },
    ],
    growthNarrative: {
      'last month': "A month ago, you would operate more with fear, but now you've learned to sit with that fear and not react as strongly to it.",
      'last 6 months': "Six months ago, you were hesitant to take on leadership roles, but now you step up with more confidence and inspire others.",
      'all time': "Since you began this journey, you've transformed from someone who doubted their leadership abilities to someone who leads with authenticity and courage."
    }
  },
  {
    id: "moon2",
    role: "moon",
    title: "The Present Partner",
    subtitle: "You mentioned several moments you were distracted during family time. But this month, you carved out focused blocks, and unplugged at the park. Nice.",
    color: "#4a9063",
    positions: {
      level1: { x: 0, y: 135 },
      level2: { x: 0, y: 135 },
      level3: { x: 0, y: 0 }
    },
    progress: 75,
    goals: [
      { id: 'g2-1', title: "Notice your biggest distraction triggers.", status: "completed", date: "04/16/25", recap: "Recap coming soon!", progress: 100, completed: true },
      { id: 'g2-2', title: "Analyze your attention patterns for insights.", status: "completed", date: "04/13/25", recap: "Recap coming soon!", progress: 100, completed: true },
      { id: 'g2-3', title: "Explore why you multitask when feeling anxious.", status: "completed", date: "04/11/25", recap: "Recap coming soon!", progress: 100, completed: true },
      { id: 'g2-4', title: "Formulate a plan for a daily digital detox.", status: "completed", date: "04/09/25", recap: "Recap coming soon!", progress: 100, completed: true },
      { id: 'g2-5', title: "Plan a focused work session.", status: "completed", date: "04/06/25", recap: "Recap coming soon!", progress: 100, completed: true },
      { id: 'g2-6', title: "Limit phone checks to less than 5 per hour by week's end.", status: "active", recap: "", progressText: "Last week, you averaged 8 checks per hour. You're making progress!", progress: 60, completed: false },
      { id: 'g2-7', title: "Spend 30 mins device-free with family daily for 2 weeks.", status: "active", recap: "", progressText: "So far, you've had 4 device-free days. Keep it up, you're building a great habit.", progress: 28, completed: false },
    ],
    growthNarrative: {
      'last month': "A month ago, you struggled to unplug during family time, but now you've created focused blocks and enjoyed more present moments.",
      'last 6 months': "Six months ago, distractions constantly pulled you away from what mattered. Now, you've built habits to reclaim your focus.",
      'all time': "Since starting this journey, you've gone from feeling scattered to being able to intentionally direct your attention and be present."
    }
  },
  {
    id: "moon3",
    role: "moon",
    title: "The Deep Worker",
    subtitle: "Before, you often sidestepped disagreement. This month, you held your view in multiple team calls, especially in that priority tradeoff last Thursday.",
    color: "#8e4fb6",
    positions: {
      level1: { x: 480, y: 25 },
      level2: { x: 480, y: 25 },
      level3: { x: 0, y: 0 }
    },
    progress: 30,
    goals: [
      { id: 'g3-1', title: "Uncover why you struggle with delegation.", status: "completed", date: "04/15/25", recap: "Recap coming soon!", progress: 100, completed: true },
      { id: 'g3-2', title: "Notice when you avoid conflict to keep the peace.", status: "completed", date: "04/14/25", recap: "Recap coming soon!", progress: 100, completed: true },
      { id: 'g3-3', title: "Challenge feelings of guilt when prioritizing work.", status: "completed", date: "04/12/25", recap: "Recap coming soon!", progress: 100, completed: true },
      { id: 'g3-4', title: "Roleplay saying 'no' to new requests.", status: "completed", date: "04/10/25", recap: "Recap coming soon!", progress: 100, completed: true },
      { id: 'g3-5', title: "Practice stating your opinion first in discussions.", status: "completed", date: "04/07/25", recap: "Recap coming soon!", progress: 100, completed: true },
      { id: 'g3-6', title: "Block two 90-min deep work sessions this week.", status: "active", recap: "", progressText: "You've scheduled one session for Wednesday. One more to go!", progress: 50, completed: false },
      { id: 'g3-7', title: "Review boundaries checklist daily for 20 workdays.", status: "active", recap: "", progressText: "So far, you're at 12 days. Keep it up, you're almost there.", progress: 60, completed: false },
    ],
    growthNarrative: {
      'last month': "A month ago, you would often sidestep disagreement, but now you've started to hold your view in team calls.",
      'last 6 months': "Six months ago, you rarely voiced your stance. Now, you're more comfortable expressing your perspective, even in tough situations.",
      'all time': "Since the beginning, you've grown from avoiding conflict to standing firm in your values and boundaries."
    }
  }
]; 