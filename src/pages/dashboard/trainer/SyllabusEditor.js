import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Grid, Paper, Divider, IconButton, Card, CardContent } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { createLearningPath, updateLearningPath, getFullCurriculum } from '../../../utils/trainerService';

const SyllabusEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // We can pass initial data via state if we are editing an existing path
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

  // Add a new section (title, para, code)
  const addSection = (topicIndex) => {
    const pageContent = pathData.links[topicIndex].pageContent || {};
    // Find the next available section number
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
      if (initialData.heading) {
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

  // Extract sections for the current topic to render the editor form
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

  // Reusable component for the live preview
  const LivePreview = ({ content }) => {
    if (!content) return <Typography color="text.secondary">No content to preview.</Typography>;
    
    const titleKeys = Object.keys(content)
      .filter(key => /^title(\d+)$/.test(key))
      .sort((a, b) => parseInt(a.replace('title', '')) - parseInt(b.replace('title', '')));

    return (
      <Box sx={{ fontFamily: 'sans-serif' }}>
        {content.description && (
          <Typography variant="body1" sx={{ mb: 4, color: '#4a5568' }}>
            {content.description}
          </Typography>
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
            <Box key={titleKey} sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: '#2d3748' }}>
                {sectionTitle}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {sectionDesc && (
                <Typography variant="body1" sx={{ mb: 2, color: '#4a5568', whiteSpace: 'pre-line' }}>
                  {sectionDesc}
                </Typography>
              )}
              {subheadingKeys.length > 0 && (
                <Box component="ul" sx={{ pl: 3, mb: 2, color: '#4a5568' }}>
                  {subheadingKeys.map(k => (
                    <li key={k}><strong>{content[k]}</strong></li>
                  ))}
                </Box>
              )}
              {assignedCode && (
                <Box sx={{ bgcolor: '#1e1e1e', borderRadius: 2, p: 2, mt: 2, overflowX: 'auto' }}>
                  <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 1 }}>Code Example</Typography>
                  <pre style={{ margin: 0, color: '#d4d4d4', fontFamily: 'monospace' }}>
                    <code>{assignedCode}</code>
                  </pre>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    );
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}>Loading Editor...</Box>;

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
      <Toaster position="top-right" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Syllabus Editor</Typography>
        <Box>
          <Button variant="outlined" sx={{ mr: 2 }} onClick={() => navigate(-1)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save Path</Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* Left Pane: Editor */}
        <Grid item xs={12} md={6} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', flexGrow: 1, overflowY: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Learning Path Configuration</Typography>
            <TextField 
              fullWidth label="Path Title (e.g. Fundamentals)" 
              value={pathData.heading} 
              onChange={e => handlePathChange('heading', e.target.value)} 
              sx={{ mb: 2 }} 
            />
            <TextField 
              fullWidth multiline rows={3} label="Overview Description" 
              value={pathData.content} 
              onChange={e => handlePathChange('content', e.target.value)} 
              sx={{ mb: 4 }} 
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Topics (Modules)</Typography>
              <Button size="small" startIcon={<AddCircleIcon />} onClick={addTopic}>Add Topic</Button>
            </Box>

            {pathData.links.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3, border: '1px dashed #cbd5e1', borderRadius: 2 }}>
                No topics added yet. Add a topic to start building content.
              </Typography>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                gap: 1.5, 
                overflowX: 'auto', 
                mb: 3, 
                pb: 2, // Increased padding to prevent scrollbar overlap
                '&::-webkit-scrollbar': {
                  height: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#cbd5e1',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f5f9',
                }
              }}>
                {pathData.links.map((link, idx) => (
                  <Button 
                    key={idx}
                    variant={activeTopicIndex === idx ? 'contained' : 'outlined'}
                    onClick={() => setActiveTopicIndex(idx)}
                    sx={{ 
                      borderRadius: '8px', 
                      whiteSpace: 'nowrap',
                      minWidth: 'fit-content',
                      px: 3,
                      textTransform: 'none',
                      boxShadow: activeTopicIndex === idx ? '0 4px 6px -1px rgba(49, 130, 206, 0.2)' : 'none'
                    }}
                  >
                    {link.text || `Topic ${idx + 1}`}
                  </Button>
                ))}
              </Box>
            )}

            {currentTopic && (
              <Card variant="outlined" sx={{ borderRadius: 3, mb: 4, borderColor: '#3182ce' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">Edit Topic Configuration</Typography>
                    <IconButton color="error" size="small" onClick={() => removeTopic(activeTopicIndex)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        fullWidth size="small" label="Topic Title" 
                        value={currentTopic.text} 
                        onChange={e => handleTopicChange(activeTopicIndex, 'text', e.target.value)} 
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        fullWidth size="small" label="URL Slug (e.g. /intro)" 
                        value={currentTopic.url} 
                        onChange={e => handleTopicChange(activeTopicIndex, 'url', e.target.value)} 
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        fullWidth multiline rows={2} size="small" label="Topic Intro Description" 
                        value={pageContent.description || ''} 
                        onChange={e => handlePageContentChange(activeTopicIndex, 'description', e.target.value)} 
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">Topic Content Sections</Typography>
                    <Button size="small" startIcon={<AddCircleIcon />} onClick={() => addSection(activeTopicIndex)}>Add Section</Button>
                  </Box>

                  {sectionNums.map(num => (
                    <Box key={num} sx={{ p: 2, mb: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                      <TextField 
                        fullWidth size="small" label={`Section ${num} Title`} 
                        value={pageContent[`title${num}`] || ''} 
                        onChange={e => handlePageContentChange(activeTopicIndex, `title${num}`, e.target.value)}
                        sx={{ mb: 2, bgcolor: '#fff' }}
                      />
                      <TextField 
                        fullWidth multiline rows={3} size="small" label="Paragraph text" 
                        value={pageContent[`para${num}`] || ''} 
                        onChange={e => handlePageContentChange(activeTopicIndex, `para${num}`, e.target.value)}
                        sx={{ mb: 2, bgcolor: '#fff' }}
                      />

                      {/* Subheadings */}
                      <Box sx={{ mb: 2, pl: 2, borderLeft: '2px solid #cbd5e1' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">Bullet Points / Subheadings</Typography>
                          <Button size="small" sx={{ p: 0, minWidth: 'auto', fontSize: '0.75rem' }} onClick={() => addSubheading(activeTopicIndex, num)}>+ Add Bullet</Button>
                        </Box>
                        {Object.keys(pageContent)
                          .filter(k => new RegExp(`^heading${num}Subheading\\d+$`).test(k))
                          .map((subKey, i) => (
                            <TextField 
                              key={subKey} fullWidth size="small" label={`Bullet ${i+1}`}
                              value={pageContent[subKey]}
                              onChange={e => handlePageContentChange(activeTopicIndex, subKey, e.target.value)}
                              sx={{ mb: 1, bgcolor: '#fff' }}
                            />
                        ))}
                      </Box>

                      <TextField 
                        fullWidth multiline rows={4} size="small" label="Code Example (optional)" 
                        value={pageContent[`code${num}`] || ''} 
                        onChange={e => handlePageContentChange(activeTopicIndex, `code${num}`, e.target.value)}
                        sx={{ bgcolor: '#fff', fontFamily: 'monospace' }}
                      />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}
          </Paper>
        </Grid>

        {/* Right Pane: Live Preview */}
        <Grid item xs={12} md={6} sx={{ height: '100%' }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ width: 10, height: 10, bgcolor: '#48bb78', borderRadius: '50%', display: 'inline-block', mr: 1 }} />
              Live Preview
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: '#fff', p: 3, borderRadius: 2, border: '1px solid #edf2f7' }}>
              {currentTopic ? (
                <LivePreview content={pageContent} />
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 5 }}>Select a topic to preview its content.</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SyllabusEditor;
