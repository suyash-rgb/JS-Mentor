import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CircularProgress, Alert, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Mermaid from '../components/common/Mermaid';
import { fetchNotes, updateStudentNote, fetchClassSummary, importSummaryToNote } from '../services/curriculumService';
import api from '../services/api';

// Slug helper for headings
const getSlug = (text) => {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
};

const MarkdownComponents = {
  h1: ({ children }) => {
    const text = React.Children.toArray(children).join('');
    const slug = getSlug(text);
    return (
      <h1 id={slug} className="text-3xl font-extrabold text-slate-900 border-b border-slate-200 pb-2 mb-4 mt-8 scroll-mt-20">
        {children}
      </h1>
    );
  },
  h2: ({ children }) => {
    const text = React.Children.toArray(children).join('');
    const slug = getSlug(text);
    return (
      <h2 id={slug} className="text-2xl font-bold text-slate-800 border-b border-slate-100 pb-1 mb-3 mt-6 scroll-mt-20">
        {children}
      </h2>
    );
  },
  h3: ({ children }) => {
    const text = React.Children.toArray(children).join('');
    const slug = getSlug(text);
    return (
      <h3 id={slug} className="text-xl font-bold text-slate-800 mb-2 mt-4 scroll-mt-20">
        {children}
      </h3>
    );
  },
  p: ({ children }) => (
    <p className="text-slate-600 leading-relaxed mb-4 text-base">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-2 mb-4 pl-4 text-slate-600">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-2 mb-4 pl-4 text-slate-600">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="mb-1">
      {children}
    </li>
  ),
  code: ({ inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    if (!inline && match && match[1] === 'mermaid') {
      return <Mermaid chart={String(children).replace(/\n$/, '')} />;
    }
    return inline ? (
      <code className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded font-mono text-xs sm:text-sm" {...props}>
        {children}
      </code>
    ) : (
      <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs sm:text-sm overflow-x-auto my-4 shadow-inner">
        <code className={className} {...props}>{children}</code>
      </pre>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-indigo-500 bg-indigo-50/50 pl-4 py-3 my-4 italic text-slate-700 rounded-r">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-6 border border-slate-200 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
  tbody: ({ children }) => <tbody className="bg-white divide-y divide-slate-200">{children}</tbody>,
  tr: ({ children }) => <tr className="hover:bg-slate-50">{children}</tr>,
  th: ({ children }) => <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b">{children}</th>,
  td: ({ children }) => <td className="px-4 py-3 text-sm text-slate-600">{children}</td>,
  a: ({ children, href }) => (
    <a href={href} className="text-indigo-600 hover:text-indigo-800 hover:underline font-semibold" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
};

const NotesViewerPage = () => {
  const { pathId } = useParams();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toc, setToc] = useState([]);

  // Student specific notes editing states
  const [userRole, setUserRole] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTab, setEditTab] = useState('write'); // 'write' or 'preview'
  const [saveLoading, setSaveLoading] = useState(false);

  // Temporary Class Summary Alert states
  const [summaryAlert, setSummaryAlert] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(search);
    const importSummaryId = queryParams.get('importSummary');

    const initializeNotesPage = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch User Profile to check role
        const profileRes = await api.get('/auth/me');
        setUserRole(profileRes.data.role);

        // 2. Fetch Notes (which fallback on backend to student notes)
        const notesData = await fetchNotes(pathId);
        setContent(notesData.content || '');
        setEditContent(notesData.content || '');
        generateToc(notesData.content || '');

        // 3. Check if there is an active class summary to import
        if (importSummaryId && profileRes.data.role === 'STUDENT') {
          try {
            const summaryData = await fetchClassSummary(importSummaryId);
            setSummaryAlert({
              id: importSummaryId,
              title: summaryData.title || "Today's Online Class Summary",
              topic: summaryData.topic
            });
          } catch (sumErr) {
            console.error("Failed to load temporary summary details:", sumErr);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Could not load study notes for this learning path.");
      } finally {
        setLoading(false);
      }
    };

    if (pathId) {
      initializeNotesPage();
    }
  }, [pathId, search]);

  const generateToc = (mdContent) => {
    if (!mdContent) {
      setToc([]);
      return;
    }
    const regex = /^(#{1,3})\s+(.+)$/gm;
    const items = [];
    let match;
    while ((match = regex.exec(mdContent)) !== null) {
      const level = match[1].length;
      const title = match[2].trim();
      items.push({
        level,
        title,
        slug: getSlug(title)
      });
    }
    setToc(items);
  };

  const handleImportSummary = async () => {
    if (!summaryAlert) return;
    setImporting(true);
    try {
      const updatedNote = await importSummaryToNote(pathId, summaryAlert.id);
      setContent(updatedNote.content);
      setEditContent(updatedNote.content);
      generateToc(updatedNote.content);
      setSummaryAlert(null);
      // Clean query parameter from URL
      navigate(`/notes/${encodeURIComponent(pathId)}`, { replace: true });
    } catch (err) {
      console.error("Import summary failed:", err);
      alert("Failed to import the class summary to your notes.");
    } finally {
      setImporting(false);
    }
  };

  const handleSaveNotes = async () => {
    setSaveLoading(true);
    try {
      const updatedNote = await updateStudentNote(pathId, editContent);
      setContent(updatedNote.content);
      generateToc(updatedNote.content);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save student note edits:", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Hide navbar on print */}
      <div className="print:hidden">
        <Navbar />
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-12 px-6 shadow-md print:bg-white print:text-black print:shadow-none print:py-4">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-indigo-400 mb-2 uppercase tracking-widest print:hidden">
              <span>Study Companion</span>
              <span>•</span>
              <span>Learning Path Notes</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {pathId}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl print:hidden">
              Comprehensive conceptual guides, syntax summaries, and code snippets curated by your course cohort trainers.
            </p>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all"
            >
              <ArrowBackIcon className="!w-4 !h-4" /> Back to Dashboard
            </button>
            {userRole === 'STUDENT' && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm"
              >
                ✏️ Edit Notes
              </button>
            )}
            {content.trim() && !isEditing && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm"
              >
                <PrintIcon className="!w-4 !h-4" /> Print Notes
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main body */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <CircularProgress size={48} />
            <span className="text-slate-500 text-sm font-medium animate-pulse">Retrieving study resources...</span>
          </div>
        ) : error ? (
          <Alert severity="error" className="rounded-2xl shadow-sm my-6">{error}</Alert>
        ) : (
          <>
            {summaryAlert && (
              <Alert
                severity="info"
                className="mb-6 rounded-2xl shadow-sm border border-indigo-100 flex items-center bg-indigo-50/40 text-indigo-950 font-medium"
                action={
                  <div className="flex gap-2">
                    <Button
                      color="primary"
                      size="small"
                      variant="contained"
                      disabled={importing}
                      onClick={handleImportSummary}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
                    >
                      {importing ? "Adding..." : "Add to My Notes"}
                    </Button>
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => {
                        setSummaryAlert(null);
                        navigate(`/notes/${encodeURIComponent(pathId)}`, { replace: true });
                      }}
                    >
                      Dismiss
                    </Button>
                  </div>
                }
              >
                ✨ Today's Live Class Summary on <strong>{summaryAlert.topic}</strong> is ready. Merge it into your study notes now!
              </Alert>
            )}

            {isEditing ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col gap-4">
                {/* Editor Tabs & Controls */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setEditTab('write')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${editTab === 'write' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Write Notes
                    </button>
                    <button
                      onClick={() => setEditTab('preview')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${editTab === 'preview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Preview Markdown
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      disabled={saveLoading}
                      className="px-5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
                    >
                      {saveLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>

                {editTab === 'write' ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={20}
                    className="w-full font-mono text-sm p-4 border border-slate-200 focus:border-indigo-500 rounded-2xl focus:outline-none bg-slate-50/30"
                    placeholder="Write your study notes here using Markdown syntax..."
                  />
                ) : (
                  <div className="prose max-w-none border border-slate-100 p-4 rounded-2xl min-h-[400px]">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      rehypePlugins={[rehypeRaw]}
                      components={MarkdownComponents}
                      urlTransform={(url) => url}
                    >
                      {editContent || "_No content preview available_"}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ) : !content.trim() ? (
              <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm flex flex-col items-center justify-center my-10">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-3xl mb-4">
                  📚
                </div>
                <h3 className="text-lg font-bold text-slate-800">No Notes Available</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-md">
                  Your trainers haven't published notes for this learning path yet. Check back soon!
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
                {/* Sidebar TOC */}
                {toc.length > 0 && (
                  <div className="lg:col-span-3 print:hidden">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 sticky top-24 shadow-sm max-h-[calc(100vh-120px)] overflow-y-auto">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Table of Contents</h3>
                      <nav className="space-y-1">
                        {toc.map((item, idx) => (
                          <a
                            key={idx}
                            href={`#${item.slug}`}
                            className={`block text-slate-600 hover:text-indigo-600 text-xs sm:text-sm font-medium transition-all py-1.5 border-l-2 hover:border-indigo-600 pl-3 ${
                              item.level === 1 ? 'pl-3 font-semibold' : item.level === 2 ? 'pl-6 text-[13px]' : 'pl-9 text-xs text-slate-500'
                            }`}
                          >
                            {item.title}
                          </a>
                        ))}
                      </nav>
                    </div>
                  </div>
                )}

                {/* Markdown Content */}
                <div className={`${toc.length > 0 ? 'lg:col-span-9' : 'lg:col-span-12'} print:col-span-12`}>
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 md:p-14 shadow-sm prose max-w-none print:border-none print:shadow-none print:p-0">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      rehypePlugins={[rehypeRaw]}
                      components={MarkdownComponents}
                      urlTransform={(url) => url}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Hide footer on print */}
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default NotesViewerPage;

