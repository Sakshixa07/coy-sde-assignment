'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Heart, X, Flame, Home, MessageCircle, MapPin, Sparkles, RotateCcw } from 'lucide-react';

interface PublicProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  affiliation: string;
  interests: string[];
  photo: string;
}

type Tab = 'home' | 'discover' | 'matches';

export default function CoyApp() {
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [feed, setFeed] = useState<PublicProfile[]>([]);
  const [matches, setMatches] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchModalProfile, setMatchModalProfile] = useState<PublicProfile | null>(null);

  // Drag & animation state
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [flyDirection, setFlyDirection] = useState<'left' | 'right' | null>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const isAnimatingRef = useRef(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [feedRes, matchesRes] = await Promise.all([
        fetch('/api/feed'),
        fetch('/api/matches'),
      ]);
      const feedData = await feedRes.json();
      const matchesData = await matchesRes.json();
      setFeed(feedData.profiles || []);
      setMatches(matchesData.matches || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentProfile = feed[0] || null;
  const nextProfile = feed[1] || null;

  const triggerSwipe = async (direction: 'like' | 'pass') => {
    if (!currentProfile || isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setFlyDirection(direction === 'like' ? 'right' : 'left');

    const swipedProfile = currentProfile;

    // Wait for exit animation
    setTimeout(async () => {
      setFeed((prev) => prev.slice(1));
      setDragOffset({ x: 0, y: 0 });
      setFlyDirection(null);
      isAnimatingRef.current = false;

      try {
        const res = await fetch('/api/swipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId: swipedProfile.id, direction }),
        });
        const data = await res.json();

        if (data.isMatch && data.matchedProfile) {
          setMatches((prev) => [data.matchedProfile, ...prev]);
          setMatchModalProfile(data.matchedProfile);
        }
      } catch (err) {
        console.error('Swipe persistence failed:', err);
      }
    }, 260);
  };

  // Pointer Events (works smoothly for both touch & mouse drag)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isAnimatingRef.current) return;
    setIsDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startPosRef.current.x;
    const dy = (e.clientY - startPosRef.current.y) * 0.25;
    setDragOffset({ x: dx, y: dy });
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const SWIPE_THRESHOLD = 100;
    if (dragOffset.x > SWIPE_THRESHOLD) {
      triggerSwipe('like');
    } else if (dragOffset.x < -SWIPE_THRESHOLD) {
      triggerSwipe('pass');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleResetDemo = async () => {
    await fetch('/api/reset', { method: 'POST' });
    await loadData();
  };

  // Compute card transform & badge opacities
  const getCardStyle = (): React.CSSProperties => {
    if (flyDirection === 'right') {
      return {
        transform: 'translate(500px, 40px) rotate(25deg)',
        opacity: 0,
        transition: 'transform 0.28s ease-out, opacity 0.28s ease-out',
      };
    }
    if (flyDirection === 'left') {
      return {
        transform: 'translate(-500px, 40px) rotate(-25deg)',
        opacity: 0,
        transition: 'transform 0.28s ease-out, opacity 0.28s ease-out',
      };
    }
    const rotate = dragOffset.x * 0.05;
    return {
      transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotate}deg)`,
      transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
    };
  };

  const likeOpacity =
    flyDirection === 'right' ? 1 : Math.min(Math.max(dragOffset.x / 100, 0), 1);
  const passOpacity =
    flyDirection === 'left' ? 1 : Math.min(Math.max(-dragOffset.x / 100, 0), 1);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex justify-center">
      {/* Mobile-first App Container */}
      <div className="w-full max-w-md bg-neutral-900 min-h-screen flex flex-col border-x border-neutral-800 relative overflow-hidden">
        {/* Top Header */}
        <header className="px-5 py-4 flex items-center justify-between border-b border-neutral-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center font-bold text-neutral-950">
              C
            </div>
            <span className="font-bold text-lg tracking-tight">coy</span>
          </div>
          {activeTab === 'discover' && (
            <span className="text-xs text-neutral-400 bg-neutral-800 px-2.5 py-1 rounded-full">
              {feed.length} remaining
            </span>
          )}
        </header>

        {/* Main Viewport */}
        <main className="flex-1 flex flex-col p-4 overflow-y-auto">
          {/* HOME TAB (Blank placeholder per assignment specs) */}
          {activeTab === 'home' && (
            <div className="flex-1 flex items-center justify-center text-neutral-600 text-sm">
              {/* Intentionally minimal placeholder */}
            </div>
          )}

          {/* DISCOVER TAB */}
          {activeTab === 'discover' && (
            <div className="flex-1 flex flex-col justify-between">
              {loading ? (
                <div className="flex-1 flex items-center justify-center text-neutral-400">
                  Loading profiles...
                </div>
              ) : currentProfile ? (
                <>
                  {/* Card Stack */}
                  <div className="relative flex-1 min-h-[460px] w-full select-none touch-none">
                    {/* Background Next Card */}
                    {nextProfile && (
                      <div className="absolute inset-0 rounded-3xl overflow-hidden bg-neutral-800 scale-[0.96] translate-y-2 opacity-60 pointer-events-none">
                        <img
                          src={nextProfile.photo}
                          alt={nextProfile.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      </div>
                    )}

                    {/* Active Swipeable Card */}
                    <div
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      style={getCardStyle()}
                      className="absolute inset-0 rounded-3xl overflow-hidden bg-neutral-800 shadow-2xl cursor-grab active:cursor-grabbing border border-neutral-700/60"
                    >
                      <img
                        src={currentProfile.photo}
                        alt={currentProfile.name}
                        draggable={false}
                        className="w-full h-full object-cover pointer-events-none"
                      />

                      {/* LIKE Stamp */}
                      <div
                        style={{ opacity: likeOpacity }}
                        className="absolute top-7 left-6 border-4 border-emerald-400 text-emerald-400 font-extrabold text-3xl px-4 py-1 rounded-xl -rotate-12 tracking-widest pointer-events-none"
                      >
                        LIKE
                      </div>

                      {/* PASS Stamp */}
                      <div
                        style={{ opacity: passOpacity }}
                        className="absolute top-7 right-6 border-4 border-rose-500 text-rose-500 font-extrabold text-3xl px-4 py-1 rounded-xl rotate-12 tracking-widest pointer-events-none"
                      >
                        PASS
                      </div>

                      {/* Gradient & Profile Details */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pt-20 pointer-events-none">
                        <div className="flex items-baseline gap-2">
                          <h2 className="text-3xl font-bold">{currentProfile.name}</h2>
                          <span className="text-2xl text-neutral-300 font-light">
                            {currentProfile.age}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-neutral-300 text-sm mt-1">
                          <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>{currentProfile.affiliation}</span>
                        </div>

                        <p className="text-neutral-200 text-sm mt-3 line-clamp-2">
                          {currentProfile.bio}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {currentProfile.interests.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-white"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop & Tap Action Buttons */}
                  <div className="flex items-center justify-center gap-8 pt-5 pb-2">
                    <button
                      onClick={() => triggerSwipe('pass')}
                      aria-label="Pass"
                      className="w-16 h-16 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-rose-500 hover:bg-rose-500/15 hover:scale-105 active:scale-95 transition"
                    >
                      <X className="w-8 h-8" />
                    </button>
                    <button
                      onClick={() => triggerSwipe('like')}
                      aria-label="Like"
                      className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center text-neutral-950 shadow-lg shadow-rose-500/25 hover:scale-105 active:scale-95 transition"
                    >
                      <Heart className="w-8 h-8 fill-current" />
                    </button>
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold">You’re all caught up</h3>
                  <p className="text-neutral-400 text-sm mt-2">
                    You’ve seen everyone in your area for now. Check your mutual matches or reset the deck to test again.
                  </p>
                  <button
                    onClick={handleResetDemo}
                    className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-sm font-medium transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Demo Feed
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MATCHES TAB */}
          {activeTab === 'matches' && (
            <div className="flex-1">
              <div className="mb-4">
                <h2 className="text-lg font-bold">Mutual Matches</h2>
                <p className="text-xs text-neutral-400">
                  Likes stay completely secret unless both of you swipe right.
                </p>
              </div>

              {matches.length === 0 ? (
                <div className="text-center py-20 text-neutral-500 text-sm">
                  No mutual matches yet. Keep swiping in Discover!
                </div>
              ) : (
                <div className="space-y-3">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center gap-3.5 p-3 rounded-2xl bg-neutral-800/70 border border-neutral-800"
                    >
                      <img
                        src={match.photo}
                        alt={match.name}
                        className="w-14 h-14 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold truncate">
                            {match.name}, {match.age}
                          </h3>
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-semibold">
                            Mutual
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 truncate mt-0.5">
                          {match.affiliation}
                        </p>
                        <p className="text-xs text-neutral-300 truncate mt-1">
                          {match.bio}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Bottom Tab Bar */}
        <nav className="grid grid-cols-3 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur">
          <button
            onClick={() => setActiveTab('home')}
            className={`py-3.5 flex flex-col items-center gap-1 text-xs font-medium transition ${
              activeTab === 'home' ? 'text-rose-400' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab('discover')}
            className={`py-3.5 flex flex-col items-center gap-1 text-xs font-medium transition ${
              activeTab === 'discover' ? 'text-rose-400' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Flame className="w-5 h-5" />
            <span>Discover</span>
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            className={`py-3.5 flex flex-col items-center gap-1 text-xs font-medium relative transition ${
              activeTab === 'matches' ? 'text-rose-400' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <div className="relative">
              <MessageCircle className="w-5 h-5" />
              {matches.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {matches.length}
                </span>
              )}
            </div>
            <span>Matches</span>
          </button>
        </nav>

        {/* "It's a Match!" Celebration Modal */}
        {matchModalProfile && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center mb-4 shadow-lg shadow-rose-500/30">
              <Heart className="w-7 h-7 text-neutral-950 fill-current" />
            </div>
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent">
              It’s a match!
            </h2>
            <p className="text-neutral-300 text-sm mt-2 max-w-xs">
              You and <span className="font-semibold text-white">{matchModalProfile.name}</span> both liked each other.
            </p>

            <img
              src={matchModalProfile.photo}
              alt={matchModalProfile.name}
              className="w-36 h-36 rounded-full object-cover border-4 border-rose-500 my-6 shadow-2xl"
            />

            <div className="w-full space-y-2.5 max-w-xs">
              <button
                onClick={() => {
                  setMatchModalProfile(null);
                  setActiveTab('matches');
                }}
                className="w-full py-3 rounded-full bg-gradient-to-r from-rose-500 to-amber-400 text-neutral-950 font-bold text-sm hover:opacity-95 transition"
              >
                View Matches
              </button>
              <button
                onClick={() => setMatchModalProfile(null)}
                className="w-full py-3 rounded-full bg-neutral-800 text-white font-medium text-sm hover:bg-neutral-700 transition"
              >
                Keep Swiping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}