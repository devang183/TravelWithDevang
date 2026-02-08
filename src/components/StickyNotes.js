'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Send, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

const colorMap = {
  yellow: { bg: '#ffc', hover: '#ffeb3b' },
  green: { bg: '#cfc', hover: '#a5d6a7' },
  blue: { bg: '#ccf', hover: '#90caf9' },
  pink: { bg: '#fcc', hover: '#f48fb1' },
  orange: { bg: '#fec', hover: '#ffcc80' }
};

export default function StickyNotes({ contributorId, contributorName }) {
  const { data: session } = useSession();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', color: 'yellow' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [contributorId]);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/thank-you/${contributorId}`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/thank-you/${contributorId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote)
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(prev => [data.note, ...prev]);
        setNewNote({ title: '', content: '', color: 'yellow' });
        setShowForm(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create note');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`/api/thank-you/${contributorId}?noteId=${noteId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotes(prev => prev.filter(n => n.id !== noteId));
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 p-4 sm:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Thank You Notes for {contributorName}
        </h1>
        <p className="text-gray-300 text-lg">
          Leave a note to show your appreciation!
        </p>
      </div>

      {/* Add Note Button */}
      {session ? (
        <div className="flex justify-center mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? 'Cancel' : 'Add a Thank You Note'}
          </motion.button>
        </div>
      ) : (
        <div className="text-center mb-8">
          <p className="text-gray-400">Sign in to leave a thank you note</p>
        </div>
      )}

      {/* New Note Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto mb-8"
          >
            <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
              <div className="mb-4">
                <label className="block text-white text-sm font-semibold mb-2">Title</label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="e.g., Amazing Photos!"
                  maxLength={100}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-400 border border-white/30 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-white text-sm font-semibold mb-2">Message</label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Write your thank you message..."
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-400 border border-white/30 focus:border-purple-500 focus:outline-none resize-none"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-white text-sm font-semibold mb-2">Note Color</label>
                <div className="flex gap-3">
                  {Object.keys(colorMap).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewNote({ ...newNote, color })}
                      className={`w-10 h-10 rounded-lg transition-transform ${newNote.color === color ? 'ring-2 ring-white scale-110' : ''}`}
                      style={{ backgroundColor: colorMap[color].bg }}
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Post Note
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Notes Wall */}
      {notes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-xl">No notes yet. Be the first to say thank you!</p>
        </div>
      ) : (
        <ul className="flex flex-wrap justify-center gap-6">
          {notes.map((note, index) => (
            <StickyNote
              key={note.id}
              note={note}
              index={index}
              isOwner={session?.user?.id === note.userId}
              onDelete={() => handleDelete(note.id)}
            />
          ))}
        </ul>
      )}

      {/* CSS for sticky notes */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Reenie+Beanie&display=swap');
      `}</style>
    </div>
  );
}

function StickyNote({ note, index, isOwner, onDelete }) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = colorMap[note.color] || colorMap.yellow;

  // Calculate rotation based on index for variety
  const getRotation = () => {
    if (note.rotation) return note.rotation;
    if (index % 5 === 0) return 5;
    if (index % 3 === 0) return -3;
    if (index % 2 === 0) return 4;
    return -6;
  };

  const getOffset = () => {
    if (index % 5 === 0) return -10;
    if (index % 3 === 0) return -5;
    if (index % 2 === 0) return 5;
    return 0;
  };

  return (
    <motion.li
      className="relative"
      style={{ marginTop: `${getOffset()}px` }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <motion.div
        className="block w-48 h-48 sm:w-56 sm:h-56 p-4 cursor-default relative group"
        style={{
          backgroundColor: colors.bg,
          boxShadow: isHovered
            ? '10px 10px 7px rgba(0,0,0,.7)'
            : '5px 5px 7px rgba(33,33,33,.7)',
          transform: isHovered ? 'scale(1.15)' : `rotate(${getRotation()}deg)`,
          transition: 'transform 0.15s linear, box-shadow 0.15s linear',
          zIndex: isHovered ? 10 : 1
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Delete button for owner */}
        {isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-20"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}

        {/* Note content */}
        <h2 className="font-bold text-lg sm:text-xl text-gray-900 mb-2 line-clamp-2">
          {note.title}
        </h2>
        <p
          className="text-xl sm:text-2xl text-gray-800 line-clamp-4"
          style={{ fontFamily: "'Reenie Beanie', cursive" }}
        >
          {note.content}
        </p>

        {/* Author */}
        <div className="absolute bottom-2 right-3 text-xs text-gray-600">
          - {note.author}
        </div>
      </motion.div>
    </motion.li>
  );
}
