import React, { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { supabase } from '../supabase/client';
import * as api from '../supabase/api';
import { 
    Event, CricketTeam, Player, ParticipantTeam, ReplacementRequest, 
    Announcement, ChatMessage, User, SiteSettings, CnflHistory
} from '../types';

interface AppState {
  users: User[];
  events: Event[];
  teams: CricketTeam[];
  players: Player[];
  participantTeams: ParticipantTeam[];
  replacementRequests: ReplacementRequest[];
  announcements: Announcement[];
  chatMessages: ChatMessage[];
  cnflHistory: CnflHistory[];
  siteSettings: SiteSettings;
}

interface Actions {
    createEvent: (event: Omit<Event, 'id'>) => Promise<Event | null>;
    updateEvent: (event: Event) => Promise<Event | null>;
    deleteEvent: (id: string) => Promise<void>;
    addTeam: (team: Omit<CricketTeam, 'id'>) => Promise<CricketTeam | null>;
    updateTeam: (team: CricketTeam) => Promise<CricketTeam | null>;
    deleteTeam: (id: string) => Promise<void>;
    addPlayer: (player: Omit<Player, 'id'>) => Promise<Player | null>;
    addBulkPlayers: (players: Omit<Player, 'id' | 'points'>[]) => Promise<any>;
    updatePlayer: (player: Player) => Promise<Player | null>;
    deletePlayer: (id: string) => Promise<void>;
    updatePlayerPoints: (payload: { playerId: string; points: number[] }) => Promise<void>;
    updateReplacementRequest: (req: ReplacementRequest) => Promise<ReplacementRequest | null>;
    addReplacementRequest: (req: Omit<ReplacementRequest, 'id'>) => Promise<ReplacementRequest | null>;
    addAnnouncement: (announcement: Omit<Announcement, 'id'>) => Promise<Announcement | null>;
    deleteAnnouncement: (id: string) => Promise<void>;
    addChatMessage: (msg: Omit<ChatMessage, 'id'>) => Promise<ChatMessage | null>;
    updateSiteSettings: (settings: SiteSettings) => Promise<SiteSettings | null>;
    addHistory: (item: Omit<CnflHistory, 'id'>) => Promise<CnflHistory | null>;
    updateHistory: (item: CnflHistory) => Promise<CnflHistory | null>;
    deleteHistory: (id: string) => Promise<void>;
    addParticipantTeam: (team: Omit<ParticipantTeam, 'id'>) => Promise<ParticipantTeam | null>;
    updateParticipantTeam: (team: ParticipantTeam) => Promise<ParticipantTeam | null>;
    updateUser: (user: User) => Promise<User | null>;
}

interface DataContextType {
  state: AppState;
  actions: Actions;
  loading: boolean;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

const INITIAL_STATE: AppState = {
    users: [], events: [], teams: [], players: [], participantTeams: [],
    replacementRequests: [], announcements: [], chatMessages: [],
    cnflHistory: [], siteSettings: { showParticipantTeams: false },
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AppState>(INITIAL_STATE);
    const [loading, setLoading] = useState(true);

    const actions = useMemo<Actions>(() => ({
        createEvent: api.createEvent,
        updateEvent: api.updateEvent,
        deleteEvent: api.deleteEvent,
        addTeam: api.addTeam,
        updateTeam: api.updateTeam,
        deleteTeam: api.deleteTeam,
        addPlayer: api.addPlayer,
        addBulkPlayers: api.addBulkPlayers,
        updatePlayer: api.updatePlayer,
        deletePlayer: api.deletePlayer,
        updatePlayerPoints: api.updatePlayerPoints,
        updateReplacementRequest: api.updateReplacementRequest,
        addReplacementRequest: api.addReplacementRequest,
        addAnnouncement: api.addAnnouncement,
        deleteAnnouncement: api.deleteAnnouncement,
        addChatMessage: api.addChatMessage,
        updateSiteSettings: api.updateSiteSettings,
        addHistory: api.addHistory,
        updateHistory: api.updateHistory,
        deleteHistory: api.deleteHistory,
        addParticipantTeam: api.addParticipantTeam,
        updateParticipantTeam: api.updateParticipantTeam,
        updateUser: api.updateUser,
    }), []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await api.getInitialData();
                setState(data);
            } catch (error) {
                console.error("Error fetching initial data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const channel = supabase.channel('db-changes');
        channel
            .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
                console.log('Change received!', payload);
                // Re-fetch all data on any change for simplicity.
                // For a more optimized approach, you could process the payload
                // and update only the relevant part of the state.
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <DataContext.Provider value={{ state, actions, loading }}>
            {children}
        </DataContext.Provider>
    );
};