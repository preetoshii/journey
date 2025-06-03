export interface AccomplishmentGoalMapping {
  goalId: string; // Corresponds to ZoomNode.id for moons
  innerWorkAmount: number; // 0-10
}

export interface Accomplishment {
  id: string; // Unique ID for the accomplishment itself
  title: string;
  recap: string; // Multi-paragraph recap
  goals: AccomplishmentGoalMapping[]; // Array of goals this accomplishment maps to
} 