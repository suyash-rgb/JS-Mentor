import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, TextField, Typography, Select, MenuItem,
  FormControl, InputLabel, IconButton, Alert
} from '@mui/material';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  Handle,
  Position,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';

// Custom Node for Quiz Title
const QuizNode = ({ data }) => {
  return (
    <Box sx={{ background: '#fff', padding: '10px', border: '2px solid #3b82f6', borderRadius: '8px', minWidth: '200px' }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#3b82f6' }}>Quiz Title</Typography>
      <TextField
        size="small"
        fullWidth
        className="nodrag"
        value={data.title}
        onChange={(e) => data.onChange(data.id, 'title', e.target.value)}
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        placeholder="Enter Quiz Title"
      />
      <Handle type="source" position={Position.Bottom} style={{ background: '#3b82f6' }} />
    </Box>
  );
};

// Custom Node for a Question
const QuestionNode = ({ data }) => {
  return (
    <Box sx={{ background: '#fff', padding: '15px', border: '1px solid #cbd5e1', borderRadius: '8px', width: '300px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      <Handle type="target" position={Position.Top} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold">Question</Typography>
        <IconButton size="small" color="error" onClick={() => data.onDelete(data.id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>

      <TextField
        size="small" fullWidth multiline rows={2}
        className="nodrag"
        value={data.text}
        onChange={(e) => data.onChange(data.id, 'text', e.target.value)}
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        placeholder="Question Text" sx={{ mb: 2 }}
      />

      <Typography variant="caption" fontWeight="bold" color="text.secondary">Options</Typography>
      {[0, 1, 2, 3].map((idx) => (
        <TextField
          key={idx} size="small" fullWidth
          className="nodrag"
          value={data.options[idx]}
          onChange={(e) => data.onChange(data.id, `option${idx}`, e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder={`Option ${idx + 1}`} sx={{ mb: 1, mt: 0.5 }}
        />
      ))}

      <FormControl fullWidth size="small" sx={{ mt: 1 }} className="nodrag">
        <InputLabel>Correct Answer</InputLabel>
        <Select
          value={data.correct_answer}
          label="Correct Answer"
          onChange={(e) => data.onChange(data.id, 'correct_answer', e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {data.options.map((opt, i) => (
            <MenuItem key={i} value={opt} disabled={!opt}>
              {opt || `Option ${i + 1}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Handle type="source" position={Position.Bottom} />
    </Box>
  );
};

const nodeTypes = {
  quizNode: QuizNode,
  questionNode: QuestionNode,
};

const QuizFlowModal = ({ open, onClose, initialData, onSave }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [title, setTitle] = useState('');

  // Handle node data changes
  const handleNodeChange = useCallback((id, field, value) => {
    if (field === 'title') {
      setTitle(value);
    }
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          if (field === 'title' || field === 'text' || field === 'correct_answer') {
            return { ...node, data: { ...node.data, [field]: value } };
          } else if (field.startsWith('option')) {
            const idx = parseInt(field.replace('option', ''));
            const newOptions = [...node.data.options];
            newOptions[idx] = value;
            return { ...node, data: { ...node.data, options: newOptions } };
          }
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleDeleteNode = useCallback((id) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  }, [setNodes, setEdges]);

  const hasInitialized = React.useRef(false);

  // Initialize flow
  useEffect(() => {
    if (open && !hasInitialized.current) {
      if (initialData) {
        setTitle(initialData.title || '');
        const initialNodes = [
          {
            id: 'root',
            type: 'quizNode',
            position: { x: 250, y: 50 },
            data: { id: 'root', title: initialData.title, onChange: handleNodeChange }
          }
        ];

        const initialEdges = [];
        let prevId = 'root';

        (initialData.questions || []).forEach((q, index) => {
          const qId = `q_${index}`;
          initialNodes.push({
            id: qId,
            type: 'questionNode',
            position: { x: 50 + index * 350, y: 250 },
            data: {
              id: qId,
              text: q.text,
              options: q.options || ['', '', '', ''],
              correct_answer: q.correct_answer,
              onChange: handleNodeChange,
              onDelete: handleDeleteNode
            }
          });

          initialEdges.push({
            id: `e_${prevId}-${qId}`,
            source: prevId,
            target: qId,
            animated: true,
            style: { stroke: '#3b82f6' }
          });

          prevId = qId;
        });

        setNodes(initialNodes);
        setEdges(initialEdges);
      } else {
        setTitle('');
        setNodes([
          {
            id: 'root',
            type: 'quizNode',
            position: { x: 250, y: 50 },
            data: { id: 'root', title: '', onChange: handleNodeChange }
          }
        ]);
        setEdges([]);
      }
      hasInitialized.current = true;
    } else if (!open) {
      hasInitialized.current = false;
    }
  }, [open, initialData, handleNodeChange, handleDeleteNode, setNodes, setEdges]);

  const onConnect = useCallback((params) => {
    setEdges((eds) => {
      // Prevent a node from having multiple outgoing or incoming edges
      const sourceHasEdge = eds.some(e => e.source === params.source);
      const targetHasEdge = eds.some(e => e.target === params.target);

      if (sourceHasEdge) {
        alert("A node can only connect to one other node in this linear flow. Please delete the existing outgoing line first (select and press Backspace).");
        return eds;
      }
      if (targetHasEdge) {
        alert("A node can only receive one connection. Please delete the existing incoming line first.");
        return eds;
      }

      return addEdge({ ...params, animated: true, style: { stroke: '#3b82f6' } }, eds);
    });
  }, [setEdges]);

  const addQuestion = () => {
    const qId = `q_${Date.now()}`;
    const questionNodes = nodes.filter(n => n.type === 'questionNode');
    const lastNode = questionNodes.length > 0
      ? questionNodes.reduce((prev, current) => (prev.position.x > current.position.x) ? prev : current)
      : null;
    const newX = lastNode ? lastNode.position.x + 350 : 50;

    setNodes((nds) => [
      ...nds,
      {
        id: qId,
        type: 'questionNode',
        position: { x: newX, y: 250 },
        data: {
          id: qId,
          text: '',
          options: ['', '', '', ''],
          correct_answer: '',
          onChange: handleNodeChange,
          onDelete: handleDeleteNode
        }
      }
    ]);

    if (lastNode) {
      setEdges((eds) => [
        ...eds,
        {
          id: `e_${lastNode.id}-${qId}`,
          source: lastNode.id,
          target: qId,
          animated: true,
          style: { stroke: '#3b82f6' }
        }
      ]);
    }
  };

  const handleSave = () => {
    let currentId = 'root';
    const orderedQuestions = [];
    const questionNodesMap = new Map(
      nodes.filter(n => n.type === 'questionNode').map(n => [n.id, n])
    );

    const visited = new Set();

    while (true) {
      if (visited.has(currentId)) {
        alert("Error: Circular connection detected. Please make sure the flow goes strictly forward.");
        return;
      }
      visited.add(currentId);

      const outgoingEdge = edges.find(e => e.source === currentId);
      if (!outgoingEdge) {
        break; // Reached the end of the line
      }

      currentId = outgoingEdge.target;
      const nextNode = questionNodesMap.get(currentId);

      if (nextNode) {
        orderedQuestions.push({
          id: nextNode.data.id.replace('q_', ''),
          text: nextNode.data.text,
          options: nextNode.data.options,
          correct_answer: nextNode.data.correct_answer
        });
      }
    }

    if (orderedQuestions.length !== questionNodesMap.size) {
      alert("Error: Some questions are disconnected. Please ensure every question is connected in the flow.");
      return;
    }

    onSave({ title, questions: orderedQuestions });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth maxWidth="lg"
      disableEnforceFocus
      disableAutoFocus
      disableRestoreFocus
      PaperProps={{ sx: { height: '80vh' } }}
    >
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        {initialData ? 'Quiz Flow' : 'Create Quiz Flow'}
      </DialogTitle>
      <DialogContent sx={{ p: 0, bgcolor: '#f8fafc' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#ccc" gap={16} />
          <Controls />
          <Panel position="top-center" style={{ marginTop: '10px' }}>
            <Alert
              severity="info"
              icon={<InfoIcon fontSize="small" />}
              sx={{
                borderRadius: 2,
                py: 0.5,
                px: 2,
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                border: '1px solid #e0f2fe',
                '& .MuiAlert-message': { fontSize: '0.875rem', color: '#0369a1' }
              }}
            >
              <strong>Tip:</strong> To reorder questions, select a connecting line and press <strong>Backspace</strong> to delete it.
            </Alert>
          </Panel>
          <Panel position="top-right">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addQuestion}
              sx={{ boxShadow: 2 }}
            >
              Add Question
            </Button>
          </Panel>
        </ReactFlow>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: '#fff' }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={!title || nodes.length <= 1}>
          Save Quiz
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuizFlowModal;
