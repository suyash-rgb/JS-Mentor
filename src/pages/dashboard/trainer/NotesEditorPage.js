import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  AppBar, Toolbar, IconButton, Typography, Button, Box,
  CircularProgress, TextField, Tabs, Tab, Alert, Tooltip, Divider
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import LinkIcon from '@mui/icons-material/Link';
import CodeIcon from '@mui/icons-material/Code';
import TitleIcon from '@mui/icons-material/Title';
import ImageIcon from '@mui/icons-material/Image';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { fetchNotes, updateNotes } from '../../../services/curriculumService';
import Mermaid from '../../../components/common/Mermaid';

const MarkdownComponents = {
  h1: ({ children, ...props }) => (
    <h1 className="text-3xl font-extrabold text-slate-900 border-b border-slate-200 pb-2 mb-4 mt-6" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-100 pb-1 mb-3 mt-5" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-xl font-bold text-slate-800 mb-2 mt-4" {...props}>{children}</h3>
  ),
  p: ({ children, ...props }) => (
    <p className="text-slate-600 leading-relaxed mb-4 text-sm sm:text-base" {...props}>{children}</p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-inside space-y-1.5 mb-4 pl-4 text-slate-600" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-inside space-y-1.5 mb-4 pl-4 text-slate-600" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }) => (
    <li className="mb-1" {...props}>{children}</li>
  ),
  code: ({ inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    if (!inline && match && match[1] === 'mermaid') {
      return <Mermaid chart={String(children).replace(/\n$/, '')} />;
    }
    return inline ? (
      <code className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded font-mono text-xs" {...props}>
        {children}
      </code>
    ) : (
      <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs sm:text-sm overflow-x-auto my-4 shadow-inner">
        <code className={className} {...props}>{children}</code>
      </pre>
    );
  },
  blockquote: ({ children, ...props }) => (
    <blockquote className="border-l-4 border-indigo-500 bg-indigo-50/50 pl-4 py-2 my-4 italic text-slate-700 rounded-r" {...props}>{children}</blockquote>
  ),
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden" {...props}>{children}</table>
    </div>
  ),
  thead: ({ children, ...props }) => <thead className="bg-slate-50" {...props}>{children}</thead>,
  tbody: ({ children, ...props }) => <tbody className="bg-white divide-y divide-slate-200" {...props}>{children}</tbody>,
  tr: ({ children, ...props }) => <tr className="hover:bg-slate-50" {...props}>{children}</tr>,
  th: ({ children, ...props }) => <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b" {...props}>{children}</th>,
  td: ({ children, ...props }) => <td className="px-4 py-3 text-sm text-slate-600" {...props}>{children}</td>,
  a: ({ children, ...props }) => <a className="text-indigo-600 hover:text-indigo-800 hover:underline font-semibold" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
};

const NotesEditorPage = () => {
  const { pathId } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [mobileTab, setMobileTab] = useState(0); // 0: Edit, 1: Preview (For mobile)
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const options = {
        maxSizeMB: 0.25, // Max 250kb
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      };
      
      const loadingToast = toast.loading('Compressing image...');
      const compressedFile = await imageCompression(file, options);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        insertFormatting('![Image](', `${base64String})`);
        toast.dismiss(loadingToast);
        toast.success('Image added!');
      };
      reader.onerror = () => {
        toast.dismiss(loadingToast);
        toast.error('Failed to read compressed image');
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error(error);
      toast.error('Failed to compress image');
    } finally {
      event.target.value = null;
    }
  };

  const insertFormatting = (prefix, suffix = '') => {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = content;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);
    
    const newText = before + prefix + (selected || (suffix ? 'text' : '')) + suffix + after;
    setContent(newText);
    
    setTimeout(() => {
      input.focus();
      if (selected) {
        input.setSelectionRange(start + prefix.length, end + prefix.length);
      } else {
        const offset = suffix ? 4 : 0; // 'text' length is 4
        input.setSelectionRange(start + prefix.length, start + prefix.length + offset);
      }
    }, 0);
  };

  useEffect(() => {
    if (pathId) {
      const loadNote = async () => {
        setLoading(true);
        setError(null);
        try {
          const noteData = await fetchNotes(pathId);
          setContent(noteData.content || '');
        } catch (err) {
          console.error(err);
          setError("Failed to fetch path notes. Please try again.");
          toast.error("Failed to load notes.");
        } finally {
          setLoading(false);
        }
      };
      loadNote();
    }
  }, [pathId]);

  const handleSave = async () => {
    if (!pathId) return;
    setSaving(true);
    try {
      await updateNotes(pathId, content);
      toast.success("Notes saved successfully!");
      setTimeout(() => window.close(), 1000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save notes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <AppBar sx={{ position: 'relative', bgcolor: '#1e293b' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => window.close()}
            aria-label="close"
            disabled={saving}
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Add/Update Notes: <span className="text-indigo-400 font-bold">{pathId}</span>
          </Typography>
          <Button
            autoFocus
            color="inherit"
            onClick={handleSave}
            disabled={saving || loading}
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{
              bgcolor: 'rgba(99, 102, 241, 0.2)',
              '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.4)' },
              fontWeight: 'bold',
              px: 3,
              borderRadius: '8px'
            }}
          >
            {saving ? 'Saving...' : 'Save Notes'}
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 0, height: 'calc(100vh - 64px)', overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
            <CircularProgress size={48} />
            <Typography variant="body2" className="text-slate-500">Loading note content...</Typography>
          </Box>
        ) : (
          <>
            {error && (
              <Box sx={{ p: 2 }}>
                <Alert severity="error">{error}</Alert>
              </Box>
            )}

            {/* Mobile View Tab Selector */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, borderBottom: 1, borderColor: 'divider', bgcolor: '#fff' }}>
              <Tabs value={mobileTab} onChange={(e, newValue) => setMobileTab(newValue)} variant="fullWidth">
                <Tab label="Edit Markdown" />
                <Tab label="Live Preview" />
              </Tabs>
            </Box>

            {/* Editor Workspace */}
            <Box sx={{ flexGrow: 1, display: 'flex', height: '100%', overflow: 'hidden' }}>
              {/* Split Column 1: Editor */}
              <Box
                sx={{
                  display: { xs: mobileTab === 0 ? 'flex' : 'none', md: 'flex' },
                  width: { xs: '100%', md: '50%' },
                  height: '100%',
                  borderRight: { md: '1px solid #e2e8f0' },
                  flexDirection: 'column'
                }}
              >
                <Box className="px-4 py-2 border-b border-slate-200 bg-white flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 hidden sm:inline">Editor</span>
                    
                    <Tooltip title="Bold (Ctrl+B)">
                      <IconButton size="small" onClick={() => insertFormatting('**', '**')}><FormatBoldIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Italic (Ctrl+I)">
                      <IconButton size="small" onClick={() => insertFormatting('*', '*')}><FormatItalicIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 0.5 }} />
                    <Tooltip title="Heading">
                      <IconButton size="small" onClick={() => insertFormatting('### ')}><TitleIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Bullet List">
                      <IconButton size="small" onClick={() => insertFormatting('- ')}><FormatListBulletedIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Numbered List">
                      <IconButton size="small" onClick={() => insertFormatting('1. ')}><FormatListNumberedIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 0.5 }} />
                    <Tooltip title="Link">
                      <IconButton size="small" onClick={() => insertFormatting('[', '](url)')}><LinkIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Code">
                      <IconButton size="small" onClick={() => insertFormatting('`', '`')}><CodeIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 0.5 }} />
                    <Tooltip title="Mermaid Chart">
                      <IconButton size="small" onClick={() => insertFormatting('\n```mermaid\ngraph TD;\n    A-->B;\n```\n', '')}>
                        <AccountTreeIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Upload Image">
                      <IconButton size="small" onClick={() => fileInputRef.current?.click()}>
                        <ImageIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{content.length} chars</span>
                </Box>
                <TextField
                  inputRef={inputRef}
                  multiline
                  fullWidth
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="# Hello World&#10;&#10;Write your path syllabus notes here using **Markdown** formatting.&#10;&#10;## Subtitle&#10;- Add lists&#10;- Inline code `console.log('hi')`&#10;&#10;```javascript&#10;// Code block example&#10;function greet() {&#10;    console.log('Hello JS Mentor');&#10;}&#10;```"
                  InputProps={{
                    sx: {
                      fontFamily: 'Consolas, Monaco, Courier New, monospace',
                      fontSize: '14px',
                      p: 3,
                      height: '100%',
                      alignItems: 'flex-start',
                      '& textarea': {
                        height: '100% !important',
                        overflowY: 'auto !important'
                      }
                    }
                  }}
                  sx={{
                    flexGrow: 1,
                    height: '100%',
                    bgcolor: '#fff',
                    '& .MuiInputBase-root': {
                      height: '100%'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    }
                  }}
                />
              </Box>

              {/* Split Column 2: Live Preview */}
              <Box
                sx={{
                  display: { xs: mobileTab === 1 ? 'flex' : 'none', md: 'flex' },
                  width: { xs: '100%', md: '50%' },
                  height: '100%',
                  flexDirection: 'column',
                  bgcolor: '#fff'
                }}
              >
                <Box className="px-4 py-2 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Rendered Preview</span>
                </Box>
                <Box
                  className="p-6 md:p-10 overflow-y-auto flex-grow prose max-w-none"
                  sx={{ height: '100%' }}
                >
                  {content.trim() ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      rehypePlugins={[rehypeRaw]}
                      components={MarkdownComponents}
                    >
                      {content}
                    </ReactMarkdown>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm italic">
                      No content written yet. Start typing on the left pane to see live preview.
                    </div>
                  )}
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default NotesEditorPage;
