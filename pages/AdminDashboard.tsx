import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Event, CricketTeam, Player, PlayerCategory, PlayerType, User, UserRole, ParticipantTeam, ReplacementRequest, SiteSettings, Announcement, CnflHistory } from '../types';
import {
  EventIcon, TeamIcon, PlayerIcon, PointsIcon, ParticipantIcon, ReplacementIcon,
  LeaderboardIcon, AnnouncementIcon, MessageIcon, AdminIcon, DownloadIcon,
  EditIcon, DeleteIcon, HomeIcon, ChevronDownIcon, HistoryIcon
} from '../components/icons';

type AdminView = 'dashboard' | 'createEvent' | 'manageEvents' | 'teamManagement' | 'playerManagement' | 'playerPointsUpdate' | 'participantDetails' | 'replacementRequests' | 'leaderboard' | 'announcements' | 'messageBox' | 'adminManagement' | 'siteSettings' | 'cnflHistoryManagement';

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};


const AdminDashboard: React.FC = () => {
    const [activeView, setActiveView] = useState<AdminView>('dashboard');

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon /> },
        { id: 'createEvent', label: 'Create Event', icon: <EventIcon /> },
        { id: 'manageEvents', label: 'Manage Events', icon: <EventIcon /> },
        { id: 'teamManagement', label: 'Team Management', icon: <TeamIcon /> },
        { id: 'playerManagement', label: 'Player Management', icon: <PlayerIcon /> },
        { id: 'playerPointsUpdate', label: 'Update Player Points', icon: <PointsIcon /> },
        { id: 'participantDetails', label: 'Participant Details', icon: <ParticipantIcon /> },
        { id: 'replacementRequests', label: 'Replacement Requests', icon: <ReplacementIcon /> },
        { id: 'leaderboard', label: 'Leaderboard', icon: <LeaderboardIcon /> },
        { id: 'cnflHistoryManagement', label: 'CNFL History', icon: <HistoryIcon /> },
        { id: 'announcements', label: 'Announcements', icon: <AnnouncementIcon /> },
        { id: 'messageBox', label: 'Message Box', icon: <MessageIcon /> },
        { id: 'siteSettings', label: 'Site Settings', icon: <AdminIcon /> },
        { id: 'adminManagement', label: 'User Management', icon: <ParticipantIcon /> },
    ];
    
    const renderContent = () => {
        switch (activeView) {
            case 'dashboard': return <DashboardView />;
            case 'createEvent': return <CreateEventView setActiveView={setActiveView}/>;
            case 'manageEvents': return <ManageEventsView />;
            case 'teamManagement': return <TeamManagementView />;
            case 'playerManagement': return <PlayerManagementView />;
            case 'playerPointsUpdate': return <PlayerPointsUpdateView />;
            case 'participantDetails': return <ParticipantDetailsView />;
            case 'replacementRequests': return <ReplacementRequestsView />;
            case 'leaderboard': return <LeaderboardView />;
            case 'cnflHistoryManagement': return <CnflHistoryManagementView />;
            case 'announcements': return <AnnouncementsView />;
            case 'messageBox': return <MessageBoxAdminView />;
            case 'siteSettings': return <SiteSettingsView />;
            case 'adminManagement': return <AdminManagementView />;
            default: return <DashboardView />;
        }
    };
    
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-white">
            <aside className="w-full md:w-64 bg-gray-800 p-4 space-y-2 flex-shrink-0">
                <h2 className="text-xl font-bold text-green-400 mb-4">Admin Panel</h2>
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id as AdminView)}
                        className={`w-full flex items-center space-x-3 p-2 rounded-md text-left transition-colors ${activeView === item.id ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </button>
                ))}
            </aside>
            <main className="flex-1 p-4 md:p-8 overflow-x-auto">
                {renderContent()}
            </main>
        </div>
    );
};

const Card: React.FC<{title: string; children: React.ReactNode; className?: string}> = ({title, children, className}) => (
    <div className={`bg-gray-800 p-6 rounded-lg shadow-lg ${className}`}>
        <h3 className="text-lg font-semibold text-gray-400">{title}</h3>
        {children}
    </div>
);

const DashboardView: React.FC = () => {
    const { state } = useData();
    const activeEvent = state.events.find(event => new Date(event.registrationDeadline) >= new Date());

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-green-400">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Total Participants"><p className="text-4xl font-bold text-green-400">{state.users.filter(u => u.role === UserRole.PARTICIPANT).length}</p></Card>
                <Card title="Active Event"><p className="text-2xl font-bold text-green-400 truncate">{activeEvent?.name || 'None'}</p></Card>
                <Card title="Pending Requests"><p className="text-4xl font-bold text-yellow-400">{state.replacementRequests.filter(r => r.status === 'pending').length}</p></Card>
                <Card title="Total Players"><p className="text-4xl font-bold text-green-400">{state.players.length}</p></Card>
            </div>
        </div>
    )
}

const EventForm: React.FC<{ event?: Event, onSubmit: (event: Omit<Event, 'id'> | Event, logoFile: File | null) => void, onCancel?: () => void, isSubmitting: boolean }> = ({ event, onSubmit, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState(event || {
        name: '', description: '', registrationDeadline: '', tournamentEndTime: '', duration: '',
        leagueType: 'international' as const, maxForeignPlayers: 0,
        totalMatches: 74, maxMatchesPerTeam: 17, maxPlayersFromSingleTeam: 7,
        maxVipPlayers: 2, maxReplacements: 10, logo: '',
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name.startsWith('max') || name.startsWith('total') ? parseInt(value) : value }));
    };

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            const base64 = await fileToBase64(file);
            setFormData(prev => ({ ...prev, logo: base64 }));
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData, logoFile);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" placeholder="Event Name" value={formData.name} onChange={handleChange} className="bg-gray-700 p-2 rounded" required />
                <input name="duration" placeholder="Event Duration (e.g., 8 weeks)" value={formData.duration} onChange={handleChange} className="bg-gray-700 p-2 rounded" required />
            </div>
            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="bg-gray-700 p-2 rounded w-full h-24" required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Registration Deadline</label>
                    <input type="date" name="registrationDeadline" value={formData.registrationDeadline.split('T')[0]} onChange={handleChange} className="bg-gray-700 p-2 rounded w-full" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Tournament End Date</label>
                    <input type="date" name="tournamentEndTime" value={formData.tournamentEndTime.split('T')[0]} onChange={handleChange} className="bg-gray-700 p-2 rounded w-full" required />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="leagueType" className="block text-sm font-medium text-gray-400">League Type</label>
                    <select name="leagueType" id="leagueType" value={formData.leagueType} onChange={handleChange} className="bg-gray-700 p-2 rounded w-full">
                        <option value="international">International</option>
                        <option value="domestic">Domestic</option>
                    </select>
                </div>
                {formData.leagueType === 'domestic' && (
                    <div>
                        <label htmlFor="maxForeignPlayers" className="block text-sm font-medium text-gray-400">Max Foreign Players</label>
                        <input type="number" name="maxForeignPlayers" id="maxForeignPlayers" value={formData.maxForeignPlayers} onChange={handleChange} className="bg-gray-700 p-2 rounded w-full" />
                    </div>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Event Logo (Optional)</label>
                <input type="file" name="logo" onChange={handleLogoChange} accept="image/*" className="bg-gray-700 p-1.5 rounded w-full text-sm" />
            </div>

            {formData.logo && <img src={formData.logo} alt="Event logo preview" className="h-20 w-auto bg-gray-700 p-1 rounded-md" />}
            <h3 className="text-lg font-semibold pt-4 border-t border-gray-700">Rules & Restrictions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                 <div>
                    <label htmlFor="totalMatches" className="block text-sm font-medium text-gray-400">Total Matches</label>
                    <input id="totalMatches" type="number" name="totalMatches" value={formData.totalMatches} onChange={handleChange} className="mt-1 bg-gray-700 p-2 rounded w-full" required />
                </div>
                <div>
                    <label htmlFor="maxMatchesPerTeam" className="block text-sm font-medium text-gray-400">Max Matches/Team</label>
                    <input id="maxMatchesPerTeam" type="number" name="maxMatchesPerTeam" value={formData.maxMatchesPerTeam} onChange={handleChange} className="mt-1 bg-gray-700 p-2 rounded w-full" required />
                </div>
                <div>
                    <label htmlFor="maxPlayersFromSingleTeam" className="block text-sm font-medium text-gray-400">Max Players/Team</label>
                    <input id="maxPlayersFromSingleTeam" type="number" name="maxPlayersFromSingleTeam" value={formData.maxPlayersFromSingleTeam} onChange={handleChange} className="mt-1 bg-gray-700 p-2 rounded w-full" required />
                </div>
                <div>
                    <label htmlFor="maxVipPlayers" className="block text-sm font-medium text-gray-400">Max VIP Players</label>
                    <input id="maxVipPlayers" type="number" name="maxVipPlayers" value={formData.maxVipPlayers} onChange={handleChange} className="mt-1 bg-gray-700 p-2 rounded w-full" required />
                </div>
                <div>
                    <label htmlFor="maxReplacements" className="block text-sm font-medium text-gray-400">Max Replacements</label>
                    <input id="maxReplacements" type="number" name="maxReplacements" value={formData.maxReplacements} onChange={handleChange} className="mt-1 bg-gray-700 p-2 rounded w-full" required />
                </div>
            </div>
            <div className="flex space-x-2 pt-4">
                <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500">
                    {isSubmitting ? 'Saving...' : (event ? 'Update' : 'Create') + ' Event'}
                </button>
                {onCancel && <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button>}
            </div>
        </form>
    );
}

const CreateEventView: React.FC<{ setActiveView: (view: AdminView) => void }> = ({ setActiveView }) => {
    const { actions } = useData();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleCreateEvent = async (eventData: Omit<Event, 'id'>, logoFile: File | null) => {
        setIsSubmitting(true);
        let eventPayload = { ...eventData };

        if (logoFile) {
            const base64 = await fileToBase64(logoFile);
            eventPayload.logo = base64;
        }
        
        await actions.createEvent(eventPayload);
        alert('Event created successfully!');
        setActiveView('manageEvents');
        setIsSubmitting(false);
    };

    return (
         <div className="bg-gray-800 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-green-400">Create New Event</h2>
            <EventForm 
                onSubmit={handleCreateEvent} 
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

const ManageEventsView: React.FC = () => {
    const { state, actions } = useData();
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this event? This will delete all associated teams, players, and participant teams.')) {
            actions.deleteEvent(id);
        }
    };

    const handleUpdateEvent = async (eventData: Event, logoFile: File | null) => {
        setIsSubmitting(true);
        let eventPayload = { ...eventData };

        if (logoFile) {
           const base64 = await fileToBase64(logoFile);
           eventPayload.logo = base64;
        } else {
            // Keep existing logo if no new file is selected
            eventPayload.logo = editingEvent?.logo;
        }
        
        await actions.updateEvent(eventPayload);
        alert('Event updated successfully!');
        setEditingEvent(null);
        setIsSubmitting(false);
    }

    if(editingEvent) {
        return (
            <div className="bg-gray-800 p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-6 text-green-400">Edit Event</h2>
                <EventForm 
                    event={editingEvent} 
                    onSubmit={handleUpdateEvent} 
                    onCancel={() => setEditingEvent(null)} 
                    isSubmitting={isSubmitting}
                />
            </div>
        )
    }

    return (
        <div className="bg-gray-800 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-green-400">Manage Events</h2>
            <div className="space-y-4">
                {state.events.map(event => (
                    <div key={event.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            {event.logo && <img src={event.logo} alt={event.name} className="h-12 w-12 object-contain rounded-md bg-gray-800 p-1" />}
                            <div>
                                <h3 className="font-bold">{event.name}</h3>
                                <p className="text-sm text-gray-400">Deadline: {new Date(event.registrationDeadline).toLocaleDateString()} | Ends: {new Date(event.tournamentEndTime).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="space-x-2">
                            <button onClick={() => setEditingEvent(event)} className="p-2 bg-blue-600 rounded hover:bg-blue-700"><EditIcon/></button>
                            <button onClick={() => handleDelete(event.id)} className="p-2 bg-red-600 rounded hover:bg-red-700"><DeleteIcon/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const TeamManagementView: React.FC = () => {
    const { state, actions } = useData();
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [teamName, setTeamName] = useState('');
    const [editingTeam, setEditingTeam] = useState<CricketTeam | null>(null);

    const teamsForEvent = state.teams.filter(t => t.eventId === selectedEventId);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedEventId || !teamName) return;

        if(editingTeam) {
            await actions.updateTeam({...editingTeam, name: teamName});
            setEditingTeam(null);
        } else {
            await actions.addTeam({ name: teamName, eventId: selectedEventId });
        }
        setTeamName('');
    }

    const handleDelete = (id: string) => {
         if (window.confirm('Are you sure you want to delete this team? This might affect players.')) {
            actions.deleteTeam(id);
        }
    }

    return (
        <div className="bg-gray-800 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-green-400">Team Management</h2>
             <select onChange={e => setSelectedEventId(e.target.value)} className="bg-gray-700 p-2 rounded mb-4 w-full">
                <option value="">Select an Event</option>
                {state.events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>

            {selectedEventId && (
                <>
                    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                        <input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="New Team Name" className="bg-gray-700 p-2 rounded flex-grow" />
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">{editingTeam ? 'Update' : 'Add'} Team</button>
                        {editingTeam && <button type="button" onClick={() => { setEditingTeam(null); setTeamName(''); }} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button>}
                    </form>
                    <div className="space-y-2">
                        {teamsForEvent.map(team => (
                             <div key={team.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                                <span>{team.name}</span>
                                 <div className="space-x-2">
                                    <button onClick={() => { setEditingTeam(team); setTeamName(team.name); }} className="p-2 bg-blue-600 rounded hover:bg-blue-700"><EditIcon/></button>
                                    <button onClick={() => handleDelete(team.id)} className="p-2 bg-red-600 rounded hover:bg-red-700"><DeleteIcon/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

const PlayerManagementView: React.FC = () => {
    const { state, actions } = useData();
    const [selectedEventId, setSelectedEventId] = useState('');
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [formData, setFormData] = useState({ name: '', category: PlayerCategory.BATSMAN, playerType: PlayerType.LOCAL, teamId: '' });
    const [bulkPlayers, setBulkPlayers] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedEvent = useMemo(() => state.events.find(e => e.id === selectedEventId), [state.events, selectedEventId]);

    const teamsForEvent = state.teams.filter(t => t.eventId === selectedEventId);
    const playersForEvent = state.players.filter(p => p.eventId === selectedEventId);

    const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedEventId(e.target.value);
        setEditingPlayer(null);
        setFormData({ name: '', category: PlayerCategory.BATSMAN, playerType: PlayerType.LOCAL, teamId: '' });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEventId || !selectedEvent || !formData.teamId || !formData.name) return;
        const teamName = teamsForEvent.find(t => t.id === formData.teamId)?.name || '';

        const playerTypeForSubmit = selectedEvent.leagueType === 'domestic' ? formData.playerType : PlayerType.LOCAL;

        if (editingPlayer) {
            await actions.updatePlayer({ ...editingPlayer, ...formData, teamName, playerType: playerTypeForSubmit });
        } else {
            const newPlayer: Omit<Player, 'id' | 'points'> = { ...formData, teamName, eventId: selectedEventId, playerType: playerTypeForSubmit };
            await actions.addPlayer({ ...newPlayer, points: [] });
        }
        setFormData({ name: '', category: PlayerCategory.BATSMAN, playerType: PlayerType.LOCAL, teamId: '' });
        setEditingPlayer(null);
    };

    const handleEdit = (player: Player) => {
        setEditingPlayer(player);
        setFormData({ name: player.name, category: player.category, playerType: player.playerType, teamId: player.teamId });
    };

     const handleDelete = (id: string) => {
         if (window.confirm('Are you sure you want to delete this player?')) {
            actions.deletePlayer(id);
        }
    }
    
    const handleBulkAdd = async () => {
        if (!selectedEventId || !selectedEvent) {
            alert("Please select an event first.");
            return;
        }
        setIsSubmitting(true);
        const isDomestic = selectedEvent.leagueType === 'domestic';
        const lines = bulkPlayers.split('\n').filter(line => line.trim() !== '');
        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];
        const newPlayers: Omit<Player, 'id' | 'points'>[] = [];

        lines.forEach((line, index) => {
            const parts = line.split(',').map(s => s.trim());
            let name, categoryStr, typeStr, teamName;
            
            if (isDomestic) {
                [name, categoryStr, typeStr, teamName] = parts;
                if (!name || !categoryStr || !typeStr || !teamName) {
                    errorCount++;
                    errors.push(`Line ${index + 1}: Invalid format. For domestic events, expected: Name,Category,Type,Team Name`);
                    return;
                }
            } else { // International
                [name, categoryStr, teamName] = parts;
                if (!name || !categoryStr || !teamName) {
                    errorCount++;
                    errors.push(`Line ${index + 1}: Invalid format. For international events, expected: Name,Category,Team Name`);
                    return;
                }
            }

            const team = teamsForEvent.find(t => t.name.toLowerCase() === teamName.toLowerCase());
            if (!team) {
                errorCount++;
                errors.push(`Line ${index + 1}: Team "${teamName}" not found in this event.`);
                return;
            }
            const categoryValue = Object.values(PlayerCategory).find(c => c.toLowerCase() === categoryStr.toLowerCase());
            if (!categoryValue) {
                 errorCount++;
                 errors.push(`Line ${index + 1}: Invalid category "${categoryStr}". Must be one of: ${Object.values(PlayerCategory).join(', ')}`);
                 return;
            }
            const playerTypeValue = isDomestic
                ? Object.values(PlayerType).find(pt => pt.toLowerCase() === (typeStr || '').toLowerCase())
                : PlayerType.LOCAL;
             if (!playerTypeValue) {
                 errorCount++;
                 errors.push(`Line ${index + 1}: Invalid type "${typeStr}". Must be 'Local' or 'Foreign'.`);
                 return;
            }
            
            newPlayers.push({ name, category: categoryValue, playerType: playerTypeValue, teamId: team.id, teamName: team.name, eventId: selectedEventId });
            successCount++;
        });

        if(newPlayers.length > 0) {
            await actions.addBulkPlayers(newPlayers);
        }

        alert(`Bulk add complete.\nSuccess: ${successCount}\nFailed: ${errorCount}\n\nErrors:\n${errors.join('\n')}`);
        if(errorCount === 0) setBulkPlayers('');
        setIsSubmitting(false);
    };

    return (
        <div className="bg-gray-800 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-green-400">Player Management</h2>
            <select onChange={handleEventChange} value={selectedEventId} className="bg-gray-700 p-2 rounded mb-4 w-full">
                <option value="">Select an Event</option>
                {state.events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>

            {selectedEventId && selectedEvent && (
                <>
                    <h3 className="text-lg font-semibold mb-2">Add/Edit Player</h3>
                    <form onSubmit={handleSubmit} className={`grid grid-cols-1 md:grid-cols-${selectedEvent.leagueType === 'domestic' ? 5 : 4} gap-2 mb-6 p-4 bg-gray-700 rounded-lg`}>
                        <input name="name" value={formData.name} onChange={handleFormChange} placeholder="Player Name" className="bg-gray-900 p-2 rounded" />
                        <select name="category" value={formData.category} onChange={handleFormChange} className="bg-gray-900 p-2 rounded">
                            {Object.values(PlayerCategory).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {selectedEvent.leagueType === 'domestic' && (
                            <select name="playerType" value={formData.playerType} onChange={handleFormChange} className="bg-gray-900 p-2 rounded">
                                {Object.values(PlayerType).map(pt => <option key={pt} value={pt}>{pt}</option>)}
                            </select>
                        )}
                         <select name="teamId" value={formData.teamId} onChange={handleFormChange} className="bg-gray-900 p-2 rounded">
                            <option value="">Select Team</option>
                            {teamsForEvent.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">{editingPlayer ? 'Update' : 'Add'} Player</button>
                    </form>

                    <div className="my-8 border-t border-gray-700 pt-6">
                        <h3 className="text-lg font-semibold mb-2">Bulk Add Players</h3>
                        <p className="text-sm text-gray-400 mb-2">Paste player list here. Format: 
                            {selectedEvent.leagueType === 'domestic'
                                ? ` \`Name,Category,Type,Team Name\`.`
                                : ` \`Name,Category,Team Name\`. The 'Type' column is not needed for international events.`
                            }
                        </p>
                        <textarea 
                            value={bulkPlayers} 
                            onChange={e => setBulkPlayers(e.target.value)} 
                            placeholder={
                                selectedEvent.leagueType === 'domestic'
                                ? `Faf du Plessis,Batsman,Foreign,Royal Challengers Bengaluru\nRashid Khan,Bowler,Foreign,Gujarat Titans\nShubman Gill,Batsman,Local,Gujarat Titans`
                                : `Babar Azam,Batsman,Pakistan\nPat Cummins,Bowler,Australia\nVirat Kohli,Batsman,India`
                            }
                            className="w-full bg-gray-900 p-2 rounded h-40 font-mono text-sm"></textarea>
                        <button onClick={handleBulkAdd} disabled={isSubmitting} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500">{isSubmitting ? 'Processing...' : 'Process Bulk Add'}</button>
                    </div>

                    <h3 className="text-lg font-semibold mb-2 mt-8">Existing Players</h3>
                     <div className="space-y-2">
                        {playersForEvent.map(player => (
                             <div key={player.id} className={`bg-gray-700 p-3 rounded-lg grid grid-cols-${selectedEvent.leagueType === 'domestic' ? 5 : 4} items-center gap-2`}>
                                <span>{player.name}</span>
                                <span>{player.category}</span>
                                {selectedEvent.leagueType === 'domestic' && <span>{player.playerType}</span>}
                                <span>{player.teamName}</span>
                                 <div className="space-x-2 text-right">
                                    <button onClick={() => handleEdit(player)} className="p-2 bg-blue-600 rounded hover:bg-blue-700"><EditIcon/></button>
                                    <button onClick={() => handleDelete(player.id)} className="p-2 bg-red-600 rounded hover:bg-red-700"><DeleteIcon/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

const PlayerPointsUpdateView: React.FC = () => {
    const { state, actions } = useData();
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [selectedTeam, setSelectedTeam] = useState<string>('');
    const [points, setPoints] = useState<{ [playerId: string]: number[] }>({});

    const selectedEvent = useMemo(() => state.events.find(event => event.id === selectedEventId), [state.events, selectedEventId]);

    const teams = useMemo(() => state.teams.filter(t => t.eventId === selectedEventId), [state.teams, selectedEventId]);
    const players = useMemo(() => state.players.filter(p => p.teamId === selectedTeam), [state.players, selectedTeam]);

    const handlePointChange = (playerId: string, matchIndex: number, value: string) => {
        const player = state.players.find(p => p.id === playerId);
        if (!player) return;
        const currentPoints = points[playerId] || player.points || [];
        const newPoints = [...currentPoints];
        newPoints[matchIndex] = parseInt(value) || 0;
        setPoints(prev => ({ ...prev, [playerId]: newPoints }));
    };

    const handleUpdate = async () => {
        const updates = Object.entries(points).map(([playerId, playerPoints]) => 
            actions.updatePlayerPoints({ playerId, points: playerPoints })
        );
        await Promise.all(updates);
        alert('Points updated!');
        setPoints({});
    };

    return (
        <div className="bg-gray-800 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-green-400">Update Player Points {selectedEvent ? `for ${selectedEvent.name}` : ''}</h2>
            
            <select onChange={e => { setSelectedEventId(e.target.value); setSelectedTeam(''); setPoints({}); }} value={selectedEventId} className="bg-gray-700 p-2 rounded mb-4 w-full md:w-1/2">
                <option value="">Select an Event</option>
                {state.events.map(event => <option key={event.id} value={event.id}>{event.name}</option>)}
            </select>

            {selectedEvent && (
                <>
                    <select onChange={e => setSelectedTeam(e.target.value)} value={selectedTeam} className="bg-gray-700 p-2 rounded mb-4 w-full md:w-1/2">
                        <option value="">Select a Team</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    
                    {selectedTeam && (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-700">
                                            <th className="p-2">Player</th>
                                            <th className="p-2">Category</th>
                                            {Array.from({ length: selectedEvent.maxMatchesPerTeam }, (_, i) => (
                                                <th key={i} className="p-2">M{i + 1}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {players.map(player => (
                                            <tr key={player.id} className="border-b border-gray-700">
                                                <td className="p-2">{player.name}</td>
                                                <td className="p-2">{player.category}</td>
                                                {Array.from({ length: selectedEvent.maxMatchesPerTeam }, (_, i) => (
                                                    <td key={i} className="p-2">
                                                        <input
                                                            type="number"
                                                            className="w-16 bg-gray-900 p-1 rounded"
                                                            value={(points[player.id] ? points[player.id][i] : player.points[i]) ?? ''}
                                                            onChange={e => handlePointChange(player.id, i, e.target.value)}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button onClick={handleUpdate} className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Update Points</button>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

const ParticipantDetailsView: React.FC = () => {
     const { state } = useData();
     const [expandedId, setExpandedId] = useState<string | null>(null);

     const playerMap = useMemo(() => new Map(state.players.map(p => [p.id, p])), [state.players]);
     const getPlayerName = (id: string) => playerMap.get(id)?.name || 'Unknown Player';

    // OPTIMIZATION: Pre-calculate total points for each player to avoid re-calculating in a loop.
    // This is the key to preventing the UI from freezing.
    const playerPointMap = useMemo(() => {
        const map = new Map<string, number>();
        for (const player of state.players) {
            const totalPoints = player.points.reduce((sum, current) => sum + (current || 0), 0);
            map.set(player.id, totalPoints);
        }
        return map;
    }, [state.players]);


     const getParticipantTotalPoints = useCallback((participantTeam: ParticipantTeam) => {
        const currentPlayersPoints = participantTeam.players.reduce((total, p) => {
            const totalPlayerPoints = playerPointMap.get(p.playerId) || 0;
            const pointsAtJoining = participantTeam.joinHistory?.[p.playerId] || 0;
            const pointsSinceJoining = totalPlayerPoints - pointsAtJoining;
            
            return total + (p.isVip ? pointsSinceJoining * 2 : pointsSinceJoining);
        }, 0);
        return (participantTeam.archivedPoints || 0) + currentPlayersPoints;
     }, [playerPointMap]);

     return (
         <div className="bg-gray-800 p-8 rounded-lg">
             <h2 className="text-2xl font-bold mb-6 text-green-400">Participant Details</h2>
             <div className="space-y-4">
                 {state.participantTeams.map(pt => (
                     <div key={pt.id} className="bg-gray-700 rounded-lg">
                         <button onClick={() => setExpandedId(expandedId === pt.id ? null : pt.id)} className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-600/50">
                             <div>
                                <p className="font-bold">{pt.participantName} - <span className="text-green-400">{pt.teamName}</span></p>
                                <p className="text-sm text-gray-400">{state.users.find(u => u.id === pt.participantId)?.email}</p>
                             </div>
                             <div className="flex items-center space-x-4">
                                <span>Total Points: {getParticipantTotalPoints(pt)}</span>
                                <ChevronDownIcon />
                             </div>
                         </button>
                         {expandedId === pt.id && (
                             <div className="p-4 border-t border-gray-600">
                                <p><strong>FB Profile:</strong> <a href={state.users.find(u => u.id === pt.participantId)?.fbLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Link</a></p>
                                <p><strong>Replacements Left:</strong> {pt.replacementsLeft}</p>
                                <p><strong>Points from Replaced Players:</strong> {pt.archivedPoints || 0}</p>
                                <h4 className="font-semibold mt-2">Selected XI:</h4>
                                <ul className="list-disc list-inside columns-2">
                                    {pt.players.map(p => (
                                        <li key={p.playerId}>{getPlayerName(p.playerId)} {p.isVip && <span className="text-yellow-400 font-bold">(VIP)</span>}</li>
                                    ))}
                                </ul>
                             </div>
                         )}
                     </div>
                 ))}
             </div>
         </div>
     );
};

const ReplacementRequestsView: React.FC = () => {
     const { state, actions } = useData();

    const handleRequest = async (req: ReplacementRequest, status: 'accepted' | 'rejected') => {
        let reason = '';
        if (status === 'rejected') {
            reason = prompt('Reason for rejection:') || 'No reason provided.';
        }
        
        const updatedRequest = {...req, status, reason};
        await actions.updateReplacementRequest(updatedRequest);
        
        if (status === 'accepted') {
            const participantTeam = state.participantTeams.find(pt => pt.id === req.participantTeamId);
            if(participantTeam) {
                const playerOut = state.players.find(p => p.id === req.currentPlayaerId);
                const playerOutPoints = playerOut?.points.reduce((a,b) => a + (b || 0), 0) || 0;
                const pointsAtJoining = participantTeam.joinHistory?.[req.currentPlayaerId] || 0;
                const pointsSinceJoining = playerOutPoints - pointsAtJoining;
                const isVip = participantTeam.players.find(p => p.playerId === req.currentPlayaerId)?.isVip;

                const newArchivedPoints = (participantTeam.archivedPoints || 0) + (isVip ? pointsSinceJoining * 2 : pointsSinceJoining);
                const newPlayers = participantTeam.players.map(p => p.playerId === req.currentPlayaerId ? { playerId: req.newPlayerId, isVip: false } : p);
                
                const playerIn = state.players.find(p => p.id === req.newPlayerId);
                const playerInPoints = playerIn?.points.reduce((a, b) => a + (b || 0), 0) || 0;
                const newJoinHistory = { ...participantTeam.joinHistory, [req.newPlayerId]: playerInPoints };
                
                const updatedTeam = { ...participantTeam, players: newPlayers, replacementsLeft: participantTeam.replacementsLeft - 1, archivedPoints: newArchivedPoints, joinHistory: newJoinHistory };
                await actions.updateParticipantTeam(updatedTeam);
            }
        }
    };
    
    return (
        <div className="bg-gray-800 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-green-400">Replacement Requests</h2>
            <div className="space-y-4">
                 <h3 className="text-xl font-semibold border-b border-gray-700 pb-2">Pending Requests</h3>
                {state.replacementRequests.filter(r => r.status === 'pending').map(req => (
                    <div key={req.id} className="bg-gray-700 p-4 rounded-lg">
                        <p><strong>{req.participantName}</strong> requests to replace <strong>{state.players.find(p => p.id === req.currentPlayaerId)?.name}</strong> with <strong>{state.players.find(p => p.id === req.newPlayerId)?.name}</strong></p>
                        <p className="text-gray-400 text-sm">{new Date(req.timestamp).toLocaleString()}</p>
                        <p className="mt-2 italic">Note: "{req.note}"</p>
                        <div className="mt-4 space-x-2">
                            <button onClick={() => handleRequest(req, 'accepted')} className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded">Accept</button>
                            <button onClick={() => handleRequest(req, 'rejected')} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded">Reject</button>
                        </div>
                    </div>
                ))}
                {state.replacementRequests.filter(r => r.status === 'pending').length === 0 && <p className="text-gray-400">No pending requests.</p>}

                <h3 className="text-xl font-semibold border-b border-gray-700 pb-2 pt-6">Handled Requests</h3>
                 {state.replacementRequests.filter(r => r.status !== 'pending').map(req => (
                    <div key={req.id} className="bg-gray-700 p-4 rounded-lg opacity-70">
                        <p><strong>{req.participantName}</strong>: <strong>{state.players.find(p => p.id === req.currentPlayaerId)?.name}</strong> &rarr; <strong>{state.players.find(p => p.id === req.newPlayerId)?.name}</strong></p>
                        <p className={`font-bold ${req.status === 'accepted' ? 'text-green-400' : 'text-red-400'}`}>Status: {req.status.toUpperCase()}</p>
                        {req.status === 'rejected' && <p>Reason: {req.reason}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};

const LeaderboardView: React.FC = () => {
    const { state } = useData();
    const leaderboardRef = useRef<HTMLDivElement>(null);
    const [lastUpdated, setLastUpdated] = useState<string>('');

    // OPTIMIZATION: Pre-calculate total points for each player to avoid re-calculating in a loop.
    // This is the key to preventing the UI from freezing.
    const playerPointMap = useMemo(() => {
        const map = new Map<string, number>();
        for (const player of state.players) {
            const totalPoints = player.points.reduce((sum, current) => sum + (current || 0), 0);
            map.set(player.id, totalPoints);
        }
        return map;
    }, [state.players]);

    const getParticipantTotalPoints = useCallback((participantTeam: ParticipantTeam) => {
        const currentPlayersPoints = participantTeam.players.reduce((total, p) => {
            const totalPlayerPoints = playerPointMap.get(p.playerId) || 0;
            const pointsAtJoining = participantTeam.joinHistory?.[p.playerId] || 0;
            const pointsSinceJoining = totalPlayerPoints - pointsAtJoining;
            
            return total + (p.isVip ? pointsSinceJoining * 2 : pointsSinceJoining);
        }, 0);
        return (participantTeam.archivedPoints || 0) + currentPlayersPoints;
    }, [playerPointMap]);

    const leaderboardData = useMemo(() => {
        return state.participantTeams.map(pt => ({
            rank: 0,
            teamName: pt.teamName,
            participantName: pt.participantName,
            totalPoints: getParticipantTotalPoints(pt),
        })).sort((a, b) => b.totalPoints - a.totalPoints)
        .map((item, index) => ({...item, rank: index + 1}));
    }, [state.participantTeams, getParticipantTotalPoints]);

    const handleDownload = useCallback(() => {
        if (leaderboardRef.current === null) {
            return;
        }
        toPng(leaderboardRef.current, { cacheBust: true, backgroundColor: '#1f2937' })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = 'cnfl-leaderboard.png';
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.error('oops, something went wrong!', err);
            });
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-green-400">Leaderboard</h2>
                <button onClick={handleDownload} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    <DownloadIcon />
                    <span>Download</span>
                </button>
            </div>
             <div className="mb-4">
                <label className="mr-2">Last Updated Info (Match #, Date):</label>
                <input type="text" value={lastUpdated} onChange={(e) => setLastUpdated(e.target.value)} className="bg-gray-700 p-2 rounded" placeholder="e.g., Match 5, 24th Oct 2024" />
            </div>

            <div ref={leaderboardRef} className="bg-gray-800 p-8 rounded-lg">
                {lastUpdated && <p className="text-center text-lg mb-4 text-yellow-400">{lastUpdated}</p>}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-700">
                                <th className="p-3">Rank</th>
                                <th className="p-3">Team Name</th>
                                <th className="p-3">Participant Name</th>
                                <th className="p-3 text-right">Total Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboardData.map(item => (
                                <tr key={item.participantName} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-3 font-bold">{item.rank}</td>
                                    <td className="p-3 text-green-400">{item.teamName}</td>
                                    <td className="p-3">{item.participantName}</td>
                                    <td className="p-3 text-right font-mono font-bold">{item.totalPoints}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const AnnouncementsView: React.FC = () => {
    const { state, actions } = useData();
    const [message, setMessage] = useState('');
    const [scope, setScope] = useState<Announcement['scope']>('participant');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!message) return;
        await actions.addAnnouncement({
            message,
            timestamp: new Date().toISOString(),
            scope,
        });
        setMessage('');
    }
    
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            actions.deleteAnnouncement(id);
        }
    };

    return (
        <div className="bg-gray-800 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-green-400">Announcements</h2>
            <form onSubmit={handleSubmit} className="mb-6">
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your announcement here..." className="w-full bg-gray-700 p-2 rounded h-24 mb-2"></textarea>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                         <label>Audience:</label>
                         <select value={scope} onChange={e => setScope(e.target.value as Announcement['scope'])} className="bg-gray-700 p-2 rounded">
                            <option value="participant">For Participants</option>
                            <option value="public">For Public Home Page</option>
                        </select>
                    </div>
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Post Announcement</button>
                </div>
            </form>
            <div className="space-y-4">
                {state.announcements.map(anno => (
                    <div key={anno.id} className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                            <p className="pr-4">{anno.message}</p>
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${anno.scope === 'public' ? 'bg-blue-500 text-white' : 'bg-yellow-500 text-black'}`}>{anno.scope}</span>
                                <button onClick={() => handleDelete(anno.id)} className="p-1 bg-red-600 rounded hover:bg-red-700"><DeleteIcon /></button>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-right">{new Date(anno.timestamp).toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

const MessageBoxAdminView: React.FC = () => {
    const { state, actions } = useData();
    const { user: adminUser } = useAuth();
    const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    const participants = state.users.filter(u => u.role === UserRole.PARTICIPANT);
    const chatMessages = state.chatMessages.filter(
        msg => (msg.senderId === selectedParticipantId && msg.receiverId === adminUser?.id) || (msg.senderId === adminUser?.id && msg.receiverId === selectedParticipantId)
    );

    const handleSend = async () => {
        if (!message || !selectedParticipantId || !adminUser) return;
        await actions.addChatMessage({
            senderId: adminUser.id,
            senderName: adminUser.fullName,
            receiverId: selectedParticipantId,
            message,
            timestamp: new Date().toISOString(),
            isRead: false
        });
        setMessage('');
    };

    return (
        <div className="bg-gray-800 p-8 rounded-lg h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-green-400">Message Box</h2>
            <div className="flex-grow flex gap-4 overflow-hidden">
                <div className="w-1/3 bg-gray-700 rounded-lg p-2 overflow-y-auto">
                    {participants.map(p => (
                        <button key={p.id} onClick={() => setSelectedParticipantId(p.id)} className={`w-full text-left p-2 rounded ${selectedParticipantId === p.id ? 'bg-green-600' : 'hover:bg-gray-600'}`}>
                            {p.fullName}
                        </button>
                    ))}
                </div>
                <div className="w-2/3 flex flex-col bg-gray-700 rounded-lg">
                    {selectedParticipantId ? (
                        <>
                            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                                {chatMessages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.senderId === adminUser?.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.senderId === adminUser?.id ? 'bg-green-800' : 'bg-gray-600'}`}>
                                            <p className="text-sm">{msg.message}</p>
                                            <p className="text-xs text-gray-400 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 flex gap-2">
                                <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..." className="bg-gray-900 p-2 rounded flex-grow" onKeyDown={e => e.key === 'Enter' && handleSend()}/>
                                <button onClick={handleSend} className="bg-green-600 hover:bg-green-700 text-white font-bold p-2 rounded">Send</button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">Select a participant to chat</div>
                    )}
                </div>
            </div>
        </div>
    );
}

const SiteSettingsView: React.FC = () => {
    const { state, actions } = useData();
    const [settings, setSettings] = useState<SiteSettings>(state.siteSettings);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setSettings(state.siteSettings);
    }, [state.siteSettings]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSettings(prev => ({ ...prev!, [e.target.name]: e.target.value }));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            const base64 = await fileToBase64(files[0]);
            setSettings(prev => ({ ...prev!, [name]: base64 }));
        }
    };
    
    const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings(prev => ({ ...prev!, [e.target.name]: e.target.checked }));
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        await actions.updateSiteSettings(settings);
        alert('Site settings updated successfully!');
        setIsSubmitting(false);
    }

    return (
        <div className="bg-gray-800 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-green-400">Site Settings</h2>
            <div className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Website Logo</label>
                        <input type="file" name="siteLogo" onChange={handleImageChange} accept="image/*" className="bg-gray-700 p-1.5 rounded w-full text-sm" />
                        {settings.siteLogo && <img src={settings.siteLogo} alt="Logo Preview" className="h-16 w-auto mt-4 bg-gray-700 p-1 rounded-md object-contain" />}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Footer Contact Info</label>
                        <textarea name="contactInfo" value={settings.contactInfo || ''} onChange={handleInputChange} className="w-full bg-gray-700 p-2 rounded h-24" />
                    </div>
                </div>
                
                <div className="border-t border-gray-700 pt-6">
                     <h3 className="text-xl font-semibold mb-4 text-green-300">Home Page Hero Section</h3>
                     <div className="space-y-4">
                        <input type="text" name="heroTitle" placeholder="Hero Title (e.g., Welcome to)" value={settings.heroTitle || ''} onChange={handleInputChange} className="bg-gray-700 p-2 rounded w-full" />
                        <input type="text" name="heroHighlightedText" placeholder="Hero Highlighted Text (e.g., Cricket Nagar)" value={settings.heroHighlightedText || ''} onChange={handleInputChange} className="bg-gray-700 p-2 rounded w-full" />
                        <textarea name="heroSubtitle" placeholder="Hero Subtitle" value={settings.heroSubtitle || ''} onChange={handleInputChange} className="w-full bg-gray-700 p-2 rounded h-20" />
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Hero Background Image</label>
                            <input type="file" name="heroBackgroundImage" onChange={handleImageChange} accept="image/*" className="bg-gray-700 p-1.5 rounded w-full text-sm" />
                             {settings.heroBackgroundImage && <img src={settings.heroBackgroundImage} alt="Background Preview" className="h-20 w-auto mt-4 bg-gray-700 p-2 rounded-md object-cover" />}
                        </div>
                     </div>
                </div>

                <div className="border-t border-gray-700 pt-6">
                     <h3 className="text-xl font-semibold mb-4 text-green-300">General Settings</h3>
                     <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                        <label htmlFor="showParticipantTeams" className="font-medium text-gray-200">Allow participants to see each other's teams</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" name="showParticipantTeams" id="showParticipantTeams" checked={!!settings.showParticipantTeams} onChange={handleToggleChange} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>
                </div>
                
                <button onClick={handleSave} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500">{isSubmitting ? 'Saving...' : 'Save All Settings'}</button>
            </div>
        </div>
    );
};

const AdminManagementView: React.FC = () => {
    const { updatePassword, logout, user: adminUser } = useAuth();
    const { state, actions } = useData();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        const { error } = await updatePassword(password);
        if (error) {
            alert(`Failed to change password: ${error.message}`);
        } else {
            alert('Password changed successfully! Please log in again.');
            await logout();
        }
    };

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        if (userId === adminUser?.id && newRole !== UserRole.ADMIN) {
            alert("You cannot demote yourself!");
            return;
        }
        if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            const user = state.users.find(u => u.id === userId);
            if (user) {
                await actions.updateUser({ ...user, role: newRole });
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-gray-800 p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-6 text-green-400">Change Your Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New Password" className="bg-gray-700 p-2 rounded w-full" required />
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" className="bg-gray-700 p-2 rounded w-full" required />
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Change Password</button>
                </form>
            </div>
             <div className="bg-gray-800 p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-6 text-green-400">Manage User Roles</h2>
                <p className="text-sm text-gray-400 mb-4">New admins must first register as a participant, then be promoted here.</p>
                <div className="space-y-2">
                    {state.users.map(user => (
                        <div key={user.id} className="bg-gray-700 p-3 rounded flex justify-between items-center">
                            <div>
                                <p>{user.fullName}</p>
                                <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${user.role === UserRole.ADMIN ? 'bg-green-500 text-white' : 'bg-gray-500'}`}>{user.role}</span>
                                <select 
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                    className="bg-gray-800 text-white text-sm rounded p-1"
                                >
                                    <option value={UserRole.PARTICIPANT}>Participant</option>
                                    <option value={UserRole.ADMIN}>Admin</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const CnflHistoryManagementView: React.FC = () => {
    const { state, actions } = useData();
    const [formData, setFormData] = useState<Omit<CnflHistory, 'id'>>({ seasonNumber: '', tournamentName: '', winner: '', runnersUp: '', participantCount: '' });
    const [editingItem, setEditingItem] = useState<CnflHistory | null>(null);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.seasonNumber || !formData.tournamentName || !formData.winner || !formData.runnersUp || !formData.participantCount) {
            alert('All fields are required.');
            return;
        }
        if (editingItem) {
            await actions.updateHistory({ ...editingItem, ...formData });
        } else {
            await actions.addHistory(formData);
        }
        setFormData({ seasonNumber: '', tournamentName: '', winner: '', runnersUp: '', participantCount: '' });
        setEditingItem(null);
    };
    
    const handleEdit = (item: CnflHistory) => {
        setEditingItem(item);
        setFormData({
            seasonNumber: item.seasonNumber,
            tournamentName: item.tournamentName,
            winner: item.winner,
            runnersUp: item.runnersUp,
            participantCount: item.participantCount
        });
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this history entry?')) {
            actions.deleteHistory(id);
        }
    };
    
    const handleCancelEdit = () => {
        setEditingItem(null);
        setFormData({ seasonNumber: '', tournamentName: '', winner: '', runnersUp: '', participantCount: '' });
    };

    return (
        <div className="bg-gray-800 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-green-400">Manage CNFL History</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-700 rounded-lg">
                <input type="number" name="seasonNumber" value={formData.seasonNumber} onChange={handleFormChange} placeholder="Season #" className="bg-gray-900 p-2 rounded" />
                <input name="tournamentName" value={formData.tournamentName} onChange={handleFormChange} placeholder="Tournament Name" className="bg-gray-900 p-2 rounded" />
                <input name="winner" value={formData.winner} onChange={handleFormChange} placeholder="Winner" className="bg-gray-900 p-2 rounded" />
                <input name="runnersUp" value={formData.runnersUp} onChange={handleFormChange} placeholder="Runners-up" className="bg-gray-900 p-2 rounded" />
                <input type="number" name="participantCount" value={formData.participantCount} onChange={handleFormChange} placeholder="# of Participants" className="bg-gray-900 p-2 rounded" />
                <div className="md:col-span-3 flex gap-2">
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">{editingItem ? 'Update' : 'Add'} Entry</button>
                    {editingItem && <button type="button" onClick={handleCancelEdit} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button>}
                </div>
            </form>

            <h3 className="text-lg font-semibold mb-2 mt-8">History Records</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-700">
                            <th className="p-3">Season</th>
                            <th className="p-3">Tournament</th>
                            <th className="p-3">Winner</th>
                            <th className="p-3">Runners-up</th>
                            <th className="p-3">Participants</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.cnflHistory.map(item => (
                            <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="p-3">{item.seasonNumber}</td>
                                <td className="p-3">{item.tournamentName}</td>
                                <td className="p-3">{item.winner}</td>
                                <td className="p-3">{item.runnersUp}</td>
                                <td className="p-3">{item.participantCount}</td>
                                <td className="p-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(item)} className="p-2 bg-blue-600 rounded hover:bg-blue-700"><EditIcon /></button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-600 rounded hover:bg-red-700"><DeleteIcon /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


export default AdminDashboard;
