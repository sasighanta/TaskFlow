// Attachments.jsx
// Place in: frontend/src/Attachments.jsx

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = "https://taskflow-production-0940.up.railway.app/api";

function getFileIcon(mimeType) {
  if (!mimeType) return '📄';
  if (mimeType.includes('pdf')) return '📕';
  if (mimeType.includes('image')) return '🖼️';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📘';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📗';
  if (mimeType.includes('zip')) return '🗜️';
  return '📄';
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(dateString) {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Attachments({ cardId, boardId, userId }) {
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  const fetchAttachments = async () => {
    if (!cardId) return;
    try {
      const res = await axios.get(`${API}/cards/${cardId}/attachments`);
      setAttachments(res.data);
    } catch (err) {
      console.error('Failed to fetch attachments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttachments(); }, [cardId]);

  const uploadFile = async (file) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large (max 10MB)');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('boardId', boardId);
    formData.append('userId', userId);

    try {
      await axios.post(`${API}/cards/${cardId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('File uploaded!');
      fetchAttachments();
    } catch (err) {
      toast.error('Upload failed');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const deleteAttachment = async (id) => {
    if (!window.confirm('Delete this attachment?')) return;
    try {
      await axios.delete(`${API}/attachments/${id}`, { data: { boardId, cardId } });
      toast.success('Attachment deleted');
      fetchAttachments();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      {/* Upload zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `1.5px dashed ${dragOver ? '#2563eb' : '#d1d5db'}`,
          borderRadius: 8,
          padding: '16px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? '#eff6ff' : '#fafaf9',
          transition: 'all 0.15s ease',
          marginBottom: 12,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        {uploading ? (
          <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 600 }}>
            Uploading...
          </div>
        ) : (
          <>
            <div style={{ fontSize: 20, marginBottom: 4 }}>📎</div>
            <div style={{ fontSize: 12, color: '#78716c', fontWeight: 600 }}>
              Drag & drop a file, or click to browse
            </div>
            <div style={{ fontSize: 10, color: '#a8a29e', marginTop: 2 }}>
              Max 10MB
            </div>
          </>
        )}
      </div>

      {/* Attachment list */}
      {loading ? (
        <div style={{ fontSize: 12, color: '#a8a29e', textAlign: 'center', padding: 12 }}>
          Loading attachments...
        </div>
      ) : attachments.length === 0 ? (
        <div style={{ fontSize: 12, color: '#d1d5db', textAlign: 'center', padding: 8 }}>
          No attachments yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {attachments.map(a => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px', background: '#fafaf9',
              borderRadius: 8, border: '1px solid #f0ede8',
            }}>
              <span style={{ fontSize: 18 }}>{getFileIcon(a.mime_type)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: 600, color: '#1c1917',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {a.filename}
                </div>
                <div style={{ fontSize: 10, color: '#a8a29e' }}>
                  {formatFileSize(a.file_size)} · {timeAgo(a.uploaded_at)}
                </div>
              </div>
              <a href={a.url} target="_blank" rel="noopener noreferrer"
                style={{
                  fontSize: 11, fontWeight: 600, color: '#2563eb',
                  textDecoration: 'none', padding: '4px 8px',
                  borderRadius: 6, background: '#eff6ff',
                }}
              >
                Download
              </a>
              <button
                onClick={() => deleteAttachment(a.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#d1d5db', fontSize: 14, padding: '2px 4px',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
