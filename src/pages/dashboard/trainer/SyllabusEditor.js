import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Grid, Paper, Divider, IconButton, Card, CardContent, useMediaQuery, useTheme, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditNoteIcon from '@mui/icons-material/EditNote';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { createLearningPath, updateLearningPath, getFullCurriculum } from '../../../services/trainerService';

const SyllabusEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  // Target small screen layouts (768px down)
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [searchParams] = useSearchParams();
  const pathQuery = searchParams.get('path');
  const initialData = location.state?.pathData || null;

  const [pathData, setPathData] = useState(initialData || {
    heading: '',
    content: '',
    links: []
  });
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [loading, setLoading] = useState(!initialData && pathQuery);
  
  // Mobile UI Toggle state: 'EDIT' view vs 'PREVIEW' view
  const [mobileViewTab, setMobileViewTab] = useState('EDIT');

  useEffect(() => {
    if (!initialData && pathQuery) {
      const fetchPath = async () => {
        try {
          const fullData = await getFullCurriculum();
          const pData = fullData.cards?.find(c => c.heading === pathQuery);
          if (pData) {
            setPathData(pData);
          }
        } catch (e) {
          toast.error("Failed to fetch path data.");
        } finally {
          setLoading(false);
        }
      };
      fetchPath();
    }
  }, [initialData, pathQuery]);

  const handlePathChange = (field, value) => {
    setPathData(prev => ({ ...prev, [field]: value }));
  };

  const addTopic = () => {
    setPathData(prev => ({
      ...prev,
      links: [
        ...prev.links,
        { text: '', url: '', pageContent: { description: '' } }
      ]
    }));
    setActiveTopicIndex(pathData.links.length);
  };

  const removeTopic = (index) => {
    setPathData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
    if (activeTopicIndex === index) setActiveTopicIndex(Math.max(0, index - 1));
  };

  const handleTopicChange = (index, field, value) => {
    const updatedLinks = [...pathData.links];
    updatedLinks[index][field] = value;
    setPathData({ ...pathData, links: updatedLinks });
  };

  const handlePageContentChange = (index, key, value) => {
    const updatedLinks = [...pathData.links];
    const pageContent = { ...updatedLinks[index].pageContent };
    
    if (value === '') {
      delete pageContent[key];
    } else {
      pageContent[key] = value;
    }
    
    updatedLinks[index].pageContent = pageContent;
    setPathData({ ...pathData, links: updatedLinks });
  };

  const addSection = (topicIndex) => {
    const pageContent = pathData.links[topicIndex].pageContent || {};
    let nextNum = 1;
    while (pageContent[`title${nextNum}`] !== undefined) {
      nextNum++;
    }
    handlePageContentChange(topicIndex, `title${nextNum}`, `New Section ${nextNum}`);
  };

  const addSubheading = (topicIndex, sectionNum) => {
    const pageContent = pathData.links[topicIndex].pageContent || {};
    let subNum = 1;
    while (pageContent[`heading${sectionNum}Subheading${subNum}`] !== undefined) {
      subNum++;
    }
    handlePageContentChange(topicIndex, `heading${sectionNum}Subheading${subNum}`, `New Subheading`);
  };

  const handleSave = async () => {
    try {
      if (initialData?.heading) {
        await updateLearningPath(initialData.heading, pathData);
        toast.success("Learning path updated successfully!");
      } else {
        await createLearningPath(pathData);
        toast.success("Learning path created successfully!");
      }
    } catch (error) {
      toast.error("Failed to save learning path.");
    }
  };

  const currentTopic = pathData.links[activeTopicIndex];
  const pageContent = currentTopic?.pageContent || {};
  
  const allKeys = Object.keys(pageContent);
  const sectionNums = allKeys
    .map(key => {
      const match = /^title(\d+)$/.exec(key);
      return match ? parseInt(match[1]) : null;
    })
    .filter(n => n !== null)
    .sort((a, b) => a - b);

  const LivePreview = ({ content }) => {
    if (!content) return <span className="text-slate-400 text-sm block text-center py-4">No content to preview.</span>;
    
    const titleKeys = Object.keys(content)
      .filter(key => /^title(\d+)$/.test(key))
      .sort((a, b) => parseInt(a.replace('title', '')) - parseInt(b.replace('title', '')));

    return (
      <div className="space-y-6">
        {content.description && (
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            {content.description}
          </p>
        )}
        
        {titleKeys.map(titleKey => {
          const num = parseInt(titleKey.replace('title', ''));
          const sectionTitle = content[titleKey];
          const sectionDesc = content[`para${num}`] || content[`title${num}1`] || content[`para${num + 1}`];
          const assignedCode = content[`code${num}`];

          const subheadingKeys = Object.keys(content).filter(k => {
            const match = /^heading(\d+)Subheading(\d+)$/.exec(k);
            return match && parseInt(match[1]) === num;
          }).sort();

          return (
            <div key={titleKey} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight mb-2">
                {sectionTitle}
              </h3>
              {sectionDesc && (
                <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-line leading-relaxed mb-3">
                  {sectionDesc}
                </p>
              )}
              {subheadingKeys.length > 0 && (
                <ul className="list-disc pl-5 mb-3 text-xs sm:text-sm text-slate-600 space-y-1">
                  {subheadingKeys.map(k => (
                    <li key={k}><strong>{content[k]}</strong></li>
                  ))}
                </ul>
              )}
              {assignedCode && (
                <div className="bg-slate-900 rounded-xl p-3 sm:p-4 mt-2 overflow-x-auto border border-slate-800 shadow-inner">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Code Snippet</span>
                  <pre className="m-0 text-slate-300 font-mono text-xs leading-relaxed overflow-x-auto">
                    <code>{assignedCode}</code>
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <CircularProgress size={40} className="text-blue-600" />
          <span className="text-sm font-semibold text-slate-500">Loading workspace configs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 p-3 sm:p-6 overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Dynamic Action Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Syllabus Editor</h1>
          <p className="text-xs text-slate-500 mt-0.5">Configure tracks, topic nodes, structural parameters and technical segments.</p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button 
            variant="outlined" 
            onClick={() => navigate(-1)}
            className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold normal-case rounded-xl text-xs sm:text-sm px-4 py-2"
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 font-bold normal-case rounded-xl text-xs sm:text-sm px-5 py-2 shadow-none"
          >
            Save Path
          </Button>
        </div>
      </div>

      {/* Floating Device Controls Tab Component Panel (Only appears on Mobile/Tablet viewports) */}
      {isMobile && (
        <div className="flex justify-center my-3 bg-white border border-slate-200 p-1 rounded-xl shadow-sm shrink-0">
          <button
            onClick={() => setMobileViewTab('EDIT')}
            className={`flex items-center justify-center gap-2 flex-1 text-xs font-bold py-2.5 rounded-lg transition-all ${
              mobileViewTab === 'EDIT' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <EditNoteIcon className="w-4 h-4" />
            Editor Form
          </button>
          <button
            onClick={() => setMobileViewTab('PREVIEW')}
            className={`flex items-center justify-center gap-2 flex-1 text-xs font-bold py-2.5 rounded-lg transition-all ${
              mobileViewTab === 'PREVIEW' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <VisibilityIcon className="w-4 h-4" />
            Live Preview
          </button>
        </div>
      )}

      {/* Primary Multi-Pane Segment Controller */}
      <div className="flex-1 flex gap-5 mt-4 overflow-hidden min-h-0">
        
        {/* LEFT WORKSPACE PANE: CURRICULUM WRITER EDITOR */}
        {(!isMobile || mobileViewTab === 'EDIT') && (
          <div className="w-full md:w-1/2 h-full flex flex-col bg-white border border-slate-200 rounded-2xl p-4 shadow-sm overflow-y-auto">
            <h2 className="text-sm font-bold text-slate-800 mb-3">Learning Path Configuration</h2>
            
            <div className="space-y-3 mb-5">
              <TextField 
                fullWidth 
                label="Path Title (e.g. Fundamentals)" 
                value={pathData.heading} 
                onChange={e => handlePathChange('heading', e.target.value)} 
                size="small"
                variant="outlined"
              />
              <TextField 
                fullWidth 
                multiline 
                rows={3} 
                label="Overview Description" 
                value={pathData.content} 
                onChange={e => handlePathChange('content', e.target.value)} 
                size="small"
                variant="outlined"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Topics (Modules)</h3>
              <Button 
                size="small" 
                startIcon={<AddCircleIcon className="!w-4 !h-4" />} 
                onClick={addTopic}
                className="text-blue-600 font-bold normal-case text-xs"
              >
                Add Topic
              </Button>
            </div>

            {/* Dynamic Module Scrolling Line Container */}
            {pathData.links.length === 0 ? (
              <div className="text-center py-6 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 mb-4 text-xs text-slate-400 font-medium">
                No topics added yet. Append a workspace topic node to register records.
              </div>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-slate-50">
                {pathData.links.map((link, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveTopicIndex(idx)}
                    className={`text-xs font-semibold px-4 py-2 rounded-xl border whitespace-nowrap transition-all ${
                      activeTopicIndex === idx 
                        ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {link.text || `Topic ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}

            {/* Active Subsection Workspace Block */}
            {currentTopic && (
              <div className="border border-blue-100 rounded-2xl p-4 bg-blue-50/20 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-blue-700">Topic Configuration</span>
                  <IconButton color="error" size="small" onClick={() => removeTopic(activeTopicIndex)} className="text-red-500">
                    <DeleteIcon className="w-4 h-4" />
                  </IconButton>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TextField 
                    fullWidth 
                    size="small" 
                    label="Topic Title" 
                    value={currentTopic.text} 
                    onChange={e => handleTopicChange(activeTopicIndex, 'text', e.target.value)} 
                    className="bg-white"
                  />
                  <TextField 
                    fullWidth 
                    size="small" 
                    label="URL Slug (e.g. /intro)" 
                    value={currentTopic.url} 
                    onChange={e => handleTopicChange(activeTopicIndex, 'url', e.target.value)} 
                    className="bg-white"
                  />
                  <div className="sm:col-span-2">
                    <TextField 
                      fullWidth 
                      multiline 
                      rows={2} 
                      size="small" 
                      label="Topic Intro Description" 
                      value={pageContent.description || ''} 
                      onChange={e => handlePageContentChange(activeTopicIndex, 'description', e.target.value)} 
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200/60 pt-3 flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-700">Topic Content Sections</h4>
                  <Button 
                    size="small" 
                    startIcon={<AddCircleIcon className="!w-3.5 !h-3.5" />} 
                    onClick={() => addSection(activeTopicIndex)}
                    className="text-blue-600 text-xs font-bold normal-case"
                  >
                    Add Section
                  </Button>
                </div>

                {/* Section Input Array Form Stack */}
                <div className="space-y-4">
                  {sectionNums.map(num => (
                    <div key={num} className="bg-white border border-slate-200 rounded-xl p-3 space-y-3 shadow-sm">
                      <TextField 
                        fullWidth 
                        size="small" 
                        label={`Section ${num} Title`} 
                        value={pageContent[`title${num}`] || ''} 
                        onChange={e => handlePageContentChange(activeTopicIndex, `title${num}`, e.target.value)}
                        className="bg-slate-50/30"
                      />
                      <TextField 
                        fullWidth 
                        multiline 
                        rows={3} 
                        size="small" 
                        label="Paragraph content text" 
                        value={pageContent[`para${num}`] || ''} 
                        onChange={e => handlePageContentChange(activeTopicIndex, `para${num}`, e.target.value)}
                        className="bg-slate-50/30"
                      />

                      {/* Bullet Point Rows Block */}
                      <div className="pl-3 border-l-2 border-slate-200 bg-slate-50/40 p-2 rounded-r-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Bullet Entries / Notes</span>
                          <button 
                            onClick={() => addSubheading(activeTopicIndex, num)}
                            className="text-[10px] text-blue-600 font-extrabold hover:underline"
                          >
                            + Add Bullet Line
                          </button>
                        </div>
                        {Object.keys(pageContent)
                          .filter(k => new RegExp(`^heading${num}Subheading\\d+$`).test(k))
                          .map((subKey, i) => (
                            <TextField 
                              key={subKey} 
                              fullWidth 
                              size="small" 
                              label={`Bullet point line ${i+1}`}
                              value={pageContent[subKey]}
                              onChange={e => handlePageContentChange(activeTopicIndex, subKey, e.target.value)}
                              className="bg-white"
                              inputProps={{ className: 'text-xs' }}
                            />
                        ))}
                      </div>

                      <TextField 
                        fullWidth 
                        multiline 
                        rows={3} 
                        size="small" 
                        label="Code Blocks (Syntax / Example Configuration)" 
                        value={pageContent[`code${num}`] || ''} 
                        onChange={e => handlePageContentChange(activeTopicIndex, `code${num}`, e.target.value)}
                        className="bg-slate-50/30 font-mono"
                        inputProps={{ className: 'text-xs font-mono' }}
                      />
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        )}

        {/* RIGHT WORKSPACE PANE: COMPILED RENDER LIVE PREVIEW AREA */}
        {(!isMobile || mobileViewTab === 'PREVIEW') && (
          <div className="w-full md:w-1/2 h-full flex flex-col bg-white border border-slate-200 rounded-2xl p-4 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse block" />
                <h2 className="text-sm font-bold text-slate-800">Live Workspace Preview</h2>
              </div>
            </div>
            
            <div className="flex-1 mt-4 overflow-y-auto bg-white border border-slate-100 rounded-xl p-4 shadow-inner">
              {currentTopic ? (
                <LivePreview content={pageContent} />
              ) : (
                <div className="text-center py-12 text-xs text-slate-400 italic">
                  Select or generate an active curriculum track node above to populate visual layouts.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SyllabusEditor;