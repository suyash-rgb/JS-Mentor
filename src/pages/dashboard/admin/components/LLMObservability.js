import React, { useEffect, useState } from 'react';
import { getObservabilityMetrics } from '../../../../services/adminService';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import {
  Box,
  Card,
  Grid,
  Typography,
  CircularProgress,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function LLMObservability() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [openTrace, setOpenTrace] = useState(null);

  useEffect(() => {
    getObservabilityMetrics()
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-96">
        <CircularProgress color="amber" />
      </Box>
    );
  }

  // Chart configuration: Daily Cost (Line Chart)
  const costData = {
    labels: metrics.dailyCostHistory.map(h => h.date),
    datasets: [
      {
        label: 'LLM Expenditure ($)',
        data: metrics.dailyCostHistory.map(h => h.cost),
        fill: true,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: '#f59e0b',
        borderWidth: 2,
        tension: 0.3,
        pointBackgroundColor: '#d97706',
      }
    ]
  };

  // Chart configuration: Token Breakdown (Bar Chart)
  const tokenData = {
    labels: metrics.tokenHistory.map(h => h.date),
    datasets: [
      {
        label: 'Prompt Tokens',
        data: metrics.tokenHistory.map(h => h.prompt),
        backgroundColor: '#3b82f6',
      },
      {
        label: 'Completion Tokens',
        data: metrics.tokenHistory.map(h => h.completion),
        backgroundColor: '#10b981',
      }
    ]
  };

  // Chart configuration: Guardrail breakdown (Pie Chart)
  const guardrailPieData = {
    labels: ['Local Guardrail Filtered', 'External LLM Evaluated'],
    datasets: [
      {
        data: [metrics.guardrailStats.rejectedByLocal, metrics.guardrailStats.passedToLLM],
        backgroundColor: ['#ef4444', '#10b981'],
        borderWidth: 1,
      }
    ]
  };

  return (
    <Box className="space-y-6">
      <Typography variant="h5" className="font-extrabold text-slate-100 mb-6">
        LLM Observability & Cost Telemetry
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white">
            <Typography className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Total LLM Expenditure
            </Typography>
            <Typography variant="h3" className="font-black text-amber-500 mt-2">
              ${metrics.totalCost.toFixed(2)}
            </Typography>
            <Typography className="text-[10px] text-slate-500 mt-1">
              Real-time API cost calculated globally
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white">
            <Typography className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Average P95 Latency
            </Typography>
            <Typography variant="h3" className="font-black text-emerald-500 mt-2">
              {metrics.avgLatency}s
            </Typography>
            <Typography className="text-[10px] text-slate-500 mt-1">
              Time from prompt dispatch to completion
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white">
            <Typography className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Cumulative Tokens Count
            </Typography>
            <Typography variant="h4" className="font-bold text-blue-400 mt-3">
              {metrics.totalTokens.total.toLocaleString()}
            </Typography>
            <Typography className="text-[10px] text-slate-500 mt-1">
              In: {metrics.totalTokens.prompt.toLocaleString()} | Out: {metrics.totalTokens.completion.toLocaleString()}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white">
            <Typography className="font-bold text-slate-200 text-sm mb-4">
              Daily Cost Analytics
            </Typography>
            <Box style={{ height: '240px' }} className="flex justify-center items-center">
              <Line 
                data={costData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false, 
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                  }
                }} 
              />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white">
            <Typography className="font-bold text-slate-200 text-sm mb-4">
              Token Ingestion History
            </Typography>
            <Box style={{ height: '240px' }} className="flex justify-center items-center">
              <Bar 
                data={tokenData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  scales: {
                    x: { stacked: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    y: { stacked: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                  }
                }} 
              />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Guardrails vs External API */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Card className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white h-full">
            <Typography className="font-bold text-slate-200 text-sm mb-4">
              Local Guardrail Efficiency
            </Typography>
            <Box style={{ height: '200px' }} className="flex justify-center items-center">
              <Pie 
                data={guardrailPieData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
                }} 
              />
            </Box>
            <Typography className="text-center text-slate-400 text-xs mt-4">
              <strong>{((metrics.guardrailStats.rejectedByLocal / metrics.guardrailStats.totalQueries) * 100).toFixed(1)}%</strong> of queries were deflected locally by matching local logic, saving external API costs.
            </Typography>
          </Card>
        </Grid>

        {/* Trace Inspector */}
        <Grid item xs={12} md={7}>
          <Card className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white">
            <Typography className="font-bold text-slate-200 text-sm mb-4">
              Doubt Engine Trace Inspector
            </Typography>

            <Box className="space-y-3">
              {metrics.recentTraces.map((trace) => {
                const isOpen = openTrace === trace.id;
                const isRejected = trace.status === "GUARDRAIL_REJECTED";
                return (
                  <Box key={trace.id} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                    <Box 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/20 transition-all"
                      onClick={() => setOpenTrace(isOpen ? null : trace.id)}
                    >
                      <Box className="flex-1 min-w-0 pr-4">
                        <Box className="flex items-center gap-2">
                          <Typography className="font-bold text-slate-300 text-xs truncate">
                            {trace.student}
                          </Typography>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                            isRejected ? 'bg-red-950 text-red-400 border border-red-900' : 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                          }`}>
                            {trace.status}
                          </span>
                        </Box>
                        <Typography className="text-[10px] text-slate-500 mt-1">
                          ID: {trace.id} | {new Date(trace.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Box>
                      <Box className="flex items-center gap-3 shrink-0">
                        <Typography className="text-xs text-slate-400">{trace.latency} ({trace.cost})</Typography>
                        <IconButton size="small" className="text-slate-400">
                          {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                      </Box>
                    </Box>

                    <Collapse in={isOpen}>
                      <Divider className="border-slate-800" />
                      <Box className="p-4 bg-slate-950/80">
                        <Typography className="text-[10px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
                          <InfoOutlinedIcon className="w-3.5 h-3.5" /> Pipeline Tracing Steps
                        </Typography>
                        <List className="p-0 m-0 space-y-2.5">
                          {trace.steps.map((step, idx) => (
                            <ListItem key={idx} className="p-0 items-start flex gap-3">
                              <div className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                                {idx + 1}
                              </div>
                              <ListItemText 
                                primary={<span className="text-xs font-bold text-slate-300 block">{step.name}</span>}
                                secondary={<span className="text-[11px] text-slate-400 block mt-0.5 font-mono">{step.details}</span>}
                                className="m-0"
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Collapse>
                  </Box>
                );
              })}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
