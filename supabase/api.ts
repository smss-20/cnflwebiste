
import { supabase } from './client';
import { User, UserRole, Event, CricketTeam, Player, ParticipantTeam, ReplacementRequest, Announcement, ChatMessage, SiteSettings, CnflHistory } from '../types';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

// --- Auth API ---
export const getSession = () => supabase.auth.getSession();
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => supabase.auth.onAuthStateChange(callback);
export const signIn = (email: string, password: string) => supabase.auth.signInWithPassword({ email, password });
export const signOut = () => supabase.auth.signOut();
export const updateUserPassword = (password: string) => supabase.auth.updateUser({ password });
export const signUp = async (fullName: string, email: string, fbLink: string, password: string) => {
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) throw signUpError;
    if (!data.user) throw new Error("Registration succeeded but no user data returned.");

    const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        fullName,
        email,
        fbLink,
        role: UserRole.PARTICIPANT,
    });
    if (profileError) {
        // In a real-world scenario, you might want to handle the orphaned auth user.
        // For this app, we'll throw an error to be caught by the UI.
        throw new Error('Registration succeeded, but failed to create user profile. Please contact an admin.');
    }
    return data;
};

// --- Data Fetching API ---
export const getProfile = (user: SupabaseUser) => supabase.from('profiles').select('*').eq('id', user.id).single();

const handleFetchError = (result: any, tableName: string) => {
    // PGRST116 means no rows found, which is not an error for a single fetch.
    if (result.error && result.error.code !== 'PGRST116') {
        throw new Error(`Failed to fetch ${tableName}: ${result.error.message}`);
    }
    return result.data || (result.error?.code === 'PGRST116' ? null : []);
};

export const getInitialData = async () => {
    const [
        users, events, teams, players, participantTeams,
        replacementRequests, announcements, chatMessages,
        cnflHistory, siteSettings
    ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('events').select('*'),
        supabase.from('teams').select('*'),
        supabase.from('players').select('*'),
        supabase.from('participant_teams').select('*'),
        supabase.from('replacement_requests').select('*'),
        supabase.from('announcements').select('*').order('timestamp', { ascending: false }),
        supabase.from('chat_messages').select('*').order('timestamp', { ascending: true }),
        supabase.from('cnfl_history').select('*').order('seasonNumber', { ascending: true }),
        supabase.from('site_settings').select('*').limit(1).single()
    ]);

    return {
        users: handleFetchError(users, 'profiles'),
        events: handleFetchError(events, 'events'),
        teams: handleFetchError(teams, 'teams'),
        players: handleFetchError(players, 'players'),
        participantTeams: handleFetchError(participantTeams, 'participant_teams'),
        replacementRequests: handleFetchError(replacementRequests, 'replacement_requests'),
        announcements: handleFetchError(announcements, 'announcements'),
        chatMessages: handleFetchError(chatMessages, 'chat_messages'),
        cnflHistory: handleFetchError(cnflHistory, 'cnfl_history'),
        siteSettings: handleFetchError(siteSettings, 'site_settings') || { showParticipantTeams: false },
    };
};

// --- Data Mutation API ---
const handleMutation = async <T>(query: PromiseLike<{ data: T | T[] | null; error: any }>, context: string): Promise<T | null> => {
    const { data, error } = await query;
    if (error) {
        console.error(`Supabase error in ${context}:`, error);
        alert(`An error occurred: ${error.message}`); // Simple user feedback
        return null;
    }
    return Array.isArray(data) ? data[0] : data;
};

const handleVoidMutation = async (query: PromiseLike<{ error: any }>, context: string): Promise<void> => {
    const { error } = await query;
    if (error) {
        console.error(`Supabase error in ${context}:`, error);
        alert(`An error occurred: ${error.message}`);
    }
};


// Events
export const createEvent = (event: Omit<Event, 'id'>) => handleMutation<Event>(supabase.from('events').insert(event).select().single(), 'createEvent');
export const updateEvent = (event: Event) => handleMutation<Event>(supabase.from('events').update(event).eq('id', event.id).select().single(), 'updateEvent');
export const deleteEvent = async (id: string): Promise<void> => {
    // This is a more complex delete that should be handled in a transaction
    // on the backend. For simplicity on the client, we'll delete cascade-like.
    console.log(`Deleting event ${id} and related data...`);
    await supabase.from('participant_teams').delete().eq('eventId', id);
    await supabase.from('players').delete().eq('eventId', id);
    await supabase.from('teams').delete().eq('eventId', id);
    await supabase.from('events').delete().eq('id', id);
    console.log(`Deletion for event ${id} complete.`);
};

// Teams
export const addTeam = (team: Omit<CricketTeam, 'id'>) => handleMutation<CricketTeam>(supabase.from('teams').insert(team).select().single(), 'addTeam');
export const updateTeam = (team: CricketTeam) => handleMutation<CricketTeam>(supabase.from('teams').update(team).eq('id', team.id).select().single(), 'updateTeam');
export const deleteTeam = (id: string) => handleVoidMutation(supabase.from('teams').delete().eq('id', id), 'deleteTeam');

// Players
export const addPlayer = (player: Omit<Player, 'id'>) => handleMutation<Player>(supabase.from('players').insert(player).select().single(), 'addPlayer');
export const addBulkPlayers = async (players: Omit<Player, 'id' | 'points'>[]) => {
    const playersWithPoints = players.map(p => ({ ...p, points: [] }));
    const { data, error } = await supabase.from('players').insert(playersWithPoints).select();
    if (error) {
        console.error(`Supabase error in addBulkPlayers:`, error);
        alert(`An error occurred: ${error.message}`);
        return null;
    }
    return data;
}
export const updatePlayer = (player: Player) => handleMutation<Player>(supabase.from('players').update(player).eq('id', player.id).select().single(), 'updatePlayer');
export const deletePlayer = (id: string) => handleVoidMutation(supabase.from('players').delete().eq('id', id), 'deletePlayer');
export const updatePlayerPoints = ({ playerId, points }: { playerId: string; points: number[] }) => handleVoidMutation(supabase.from('players').update({ points }).eq('id', playerId), 'updatePlayerPoints');

// Replacements
export const addReplacementRequest = (req: Omit<ReplacementRequest, 'id'>) => handleMutation<ReplacementRequest>(supabase.from('replacement_requests').insert(req).select().single(), 'addReplacementRequest');
export const updateReplacementRequest = (req: ReplacementRequest) => handleMutation<ReplacementRequest>(supabase.from('replacement_requests').update(req).eq('id', req.id).select().single(), 'updateReplacementRequest');

// Announcements
export const addAnnouncement = (announcement: Omit<Announcement, 'id'>) => handleMutation<Announcement>(supabase.from('announcements').insert(announcement).select().single(), 'addAnnouncement');
export const deleteAnnouncement = (id: string) => handleVoidMutation(supabase.from('announcements').delete().eq('id', id), 'deleteAnnouncement');

// Chat
export const addChatMessage = (msg: Omit<ChatMessage, 'id'>) => handleMutation<ChatMessage>(supabase.from('chat_messages').insert(msg).select().single(), 'addChatMessage');

// Settings & History
export const updateSiteSettings = (settings: SiteSettings) => handleMutation<SiteSettings>(supabase.from('site_settings').upsert({ ...settings, id: 1 }, { onConflict: 'id' }).select().single(), 'updateSiteSettings');
export const addHistory = (item: Omit<CnflHistory, 'id'>) => handleMutation<CnflHistory>(supabase.from('cnfl_history').insert(item).select().single(), 'addHistory');
export const updateHistory = (item: CnflHistory) => handleMutation<CnflHistory>(supabase.from('cnfl_history').update(item).eq('id', item.id).select().single(), 'updateHistory');
export const deleteHistory = (id: string) => handleVoidMutation(supabase.from('cnfl_history').delete().eq('id', id), 'deleteHistory');

// Participant Teams
export const addParticipantTeam = (team: Omit<ParticipantTeam, 'id'>) => handleMutation<ParticipantTeam>(supabase.from('participant_teams').insert(team).select().single(), 'addParticipantTeam');
export const updateParticipantTeam = (team: ParticipantTeam) => handleMutation<ParticipantTeam>(supabase.from('participant_teams').update(team).eq('id', team.id).select().single(), 'updateParticipantTeam');

// Users
export const updateUser = (user: User) => handleMutation<User>(supabase.from('profiles').update(user).eq('id', user.id).select().single(), 'updateUser');
