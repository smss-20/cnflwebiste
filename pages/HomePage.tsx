import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { EventIcon, AnnouncementIcon, HistoryIcon } from '../components/icons';

const HomePage: React.FC = () => {
  const { state } = useData();
  const { heroTitle, heroHighlightedText, heroSubtitle, heroBackgroundImage } = state.siteSettings;

  const now = new Date();
  
  const runningEvent = state.events
    .filter(event => new Date(event.registrationDeadline) < now && new Date(event.tournamentEndTime) > now)
    .sort((a, b) => new Date(a.tournamentEndTime).getTime() - new Date(b.tournamentEndTime).getTime())[0];

  const upcomingEvent = state.events
    .filter(event => new Date(event.registrationDeadline) >= now)
    .sort((a, b) => new Date(a.registrationDeadline).getTime() - new Date(b.registrationDeadline).getTime())[0];
  
  const featuredEvent = runningEvent || upcomingEvent;
  const eventStatus = runningEvent ? 'Running' : (upcomingEvent ? 'Upcoming' : null);

  const publicAnnouncements = state.announcements.filter(a => a.scope === 'public');
  const { cnflHistory } = state;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center p-8 md:p-16 rounded-xl bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${heroBackgroundImage || 'https://picsum.photos/1200/400?random=1&grayscale&blur=2'}')` }}>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg">
          {heroTitle || 'Welcome to'} <span className="text-green-400">{heroHighlightedText || 'Cricket Nagar Fantasy League'}</span>
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto whitespace-pre-line">
          {heroSubtitle || 'Build your dream team, compete with friends, and experience the thrill of fantasy cricket.\nPlay for fun, not for money!'}
        </p>
      </div>
      
      {/* Public Announcements Section */}
      {publicAnnouncements.length > 0 && (
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8">
            <div className="flex items-center space-x-3 mb-4">
                <AnnouncementIcon />
                <h2 className="text-3xl font-bold text-green-400">Announcements</h2>
            </div>
            <div className="space-y-4">
              {publicAnnouncements.map(anno => (
                  <div key={anno.id} className="bg-gray-700/50 p-4 rounded-lg border-l-4 border-green-500">
                      <p className="text-gray-200">{anno.message}</p>
                      <p className="text-xs text-gray-400 mt-2 text-right">{new Date(anno.timestamp).toLocaleString()}</p>
                  </div>
              ))}
            </div>
        </div>
      )}


      {/* Disclaimer */}
      <div className="bg-yellow-500/10 border-l-4 border-yellow-400 text-yellow-300 p-4 rounded-md" role="alert">
        <p className="font-bold">Disclaimer: For Entertainment Purposes Only</p>
        <p>This is not a gambling website. No money or transactions are involved. CNFL is a free-to-play fantasy sports game designed for fun and engagement.</p>
      </div>

      {/* Active Event Section */}
      {featuredEvent && eventStatus ? (
        <div className="bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <EventIcon />
                  <h2 className="text-3xl font-bold text-green-400">{eventStatus} Event</h2>
                </div>
                {eventStatus === 'Running' ? (
                  <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">LIVE</span>
                ) : (
                  <span className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full">REGISTRATION OPEN</span>
                )}
            </div>
             {featuredEvent.logo && <img src={featuredEvent.logo} alt={featuredEvent.name} className="h-24 w-auto mx-auto my-4 object-contain" />}
            <h3 className="text-2xl font-semibold mt-4 text-center">{featuredEvent.name}</h3>
            <p className="mt-2 text-gray-400 text-center">{featuredEvent.description}</p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">{eventStatus === 'Running' ? 'Ends On' : 'Registration Deadline'}</p>
                <p className="text-lg font-bold text-red-400">{new Date(eventStatus === 'Running' ? featuredEvent.tournamentEndTime : featuredEvent.registrationDeadline).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Event Duration</p>
                <p className="text-lg font-bold">{featuredEvent.duration}</p>
              </div>
               <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Total Matches</p>
                <p className="text-lg font-bold">{featuredEvent.totalMatches}</p>
              </div>
               <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Replacements</p>
                <p className="text-lg font-bold">{featuredEvent.maxReplacements}</p>
              </div>
            </div>
            <div className="mt-8 text-center">
              <Link
                to="/participant"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-10 rounded-lg text-lg transition-transform transform hover:scale-105"
              >
                {eventStatus === 'Running' ? 'Go To Dashboard' : 'Create Your Team Now'}
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-300">No Active Events</h2>
          <p className="mt-2 text-gray-400">The admin has not created any new events yet. Please check back later!</p>
        </div>
      )}

      {/* History Section */}
      {cnflHistory.length > 0 && (
          <div className="bg-gray-800 rounded-lg shadow-2xl p-8">
              <div className="flex items-center space-x-3 mb-4">
                  <HistoryIcon />
                  <h2 className="text-3xl font-bold text-green-400">History of CNFL</h2>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead>
                          <tr className="bg-gray-700">
                              <th className="p-3">Season</th>
                              <th className="p-3">Tournament</th>
                              <th className="p-3">Winner</th>
                              <th className="p-3">Runners-up</th>
                              <th className="p-3 text-center">Participants</th>
                          </tr>
                      </thead>
                      <tbody>
                          {cnflHistory.map(item => (
                              <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                  <td className="p-3 font-bold">{item.seasonNumber}</td>
                                  <td className="p-3">{item.tournamentName}</td>
                                  <td className="p-3 text-yellow-400 font-semibold">{item.winner}</td>
                                  <td className="p-3">{item.runnersUp}</td>
                                  <td className="p-3 text-center font-mono">{item.participantCount}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
  );
};

export default HomePage;