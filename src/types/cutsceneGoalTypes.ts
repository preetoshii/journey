/*
  accomplishmentTypes.ts
  -------------------
  This file defines the types related to the "Accomplishment" feature, which is the data
  that drives the cutscene animation. An Accomplishment represents a significant achievement
  that, when triggered, can contribute progress to one or more moons.

  - Accomplishment: The main interface for the achievement itself, containing its own ID,
    title, and a detailed recap.
  - AccomplishmentGoalMapping: A mapping that links an accomplishment to a specific moon (`goalId`)
    and defines how much "progress boost" (`innerWorkAmount`) it should provide.
*/

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