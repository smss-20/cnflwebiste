export enum UserRole {
  ADMIN = 'ADMIN',
  PARTICIPANT = 'PARTICIPANT',
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  fbLink?: string;
  role: UserRole;
}

export enum PlayerCategory {
  BATSMAN = 'Batsman',
  WICKETKEEPER = 'Wicketkeeper',
  ALL_ROUNDER = 'All-rounder',
  BOWLER = 'Bowler',
}

export enum PlayerType {
  LOCAL = 'Local',
  FOREIGN = 'Foreign',
}

export interface CricketTeam {
  id: string;
  name: string;
  eventId: string;
}

export interface Player {
  id: string;
  name: string;
  category: PlayerCategory;
  playerType: PlayerType;
  teamId: string;
  teamName: string; // denormalized for convenience
  eventId: string;
  points: number[]; // array of points per match
}

export interface Event {
  id:string;
  name: string;
  description: string;
  registrationDeadline: string;
  tournamentEndTime: string;
  duration: string;
  leagueType: 'domestic' | 'international';
  maxForeignPlayers?: number;
  totalMatches: number;
  maxMatchesPerTeam: number;
  maxPlayersFromSingleTeam: number;
  maxVipPlayers: number;
  maxReplacements: number;
  logo?: string;
}

export interface ParticipantTeamPlayer {
  playerId: string;
  isVip: boolean;
}

export interface ParticipantTeam {
  id: string;
  participantId: string;
  participantName: string;
  teamName: string;
  eventId: string;
  players: ParticipantTeamPlayer[];
  replacementsLeft: number;
  archivedPoints: number; // Points from players who have been replaced
  joinHistory: { [playerId: string]: number }; // Points a player had when they joined via replacement
}

export interface ReplacementRequest {
  id: string;
  participantTeamId: string;
  participantName: string;
  currentPlayaerId: string;
  newPlayerId: string;
  note: string;
  status: 'pending' | 'accepted' | 'rejected';
  reason?: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  message: string;
  timestamp: string;
  scope: 'public' | 'participant';
}

export interface ChatMessage {
  id: string;
  senderId: string; // 'admin' or participantId
  senderName: string;
  receiverId: string; // 'admin' or participantId
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface SiteSettings {
  id?: number;
  siteLogo?: string | null;
  contactInfo?: string;
  heroTitle?: string;
  heroHighlightedText?: string;
  heroSubtitle?: string;
  heroBackgroundImage?: string | null;
  showParticipantTeams?: boolean;
}

export interface CnflHistory {
  id: string;
  seasonNumber: string;
  tournamentName: string;
  winner: string;
  runnersUp: string;
  participantCount: string;
}