import React, { useEffect, useState } from 'react';
import { getSystemSettings, updateSystemSettings, getAuditLogs } from '../../../../services/adminService';
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Switch,
  Slider,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import toast from 'react-hot-toast';

export default function SystemControl() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Load initial settings and audit logs
    Promise.all([getSystemSettings(), getAuditLogs()])
      .then(([settingsRes, logsRes]) => {
        setSettings(settingsRes);
        setLogs(logsRes);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleKnnToggle = (e) => {
    const val = e.target.checked;
    updateSystemSettings({ knnAutoReview: val })
      .then(newSettings => {
        setSettings(newSettings);
        toast.success(`KNN Auto-Review Engine turned ${val ? 'ON' : 'OFF'}`);
        // Reload logs to show updated state
        getAuditLogs().then(setLogs);
      })
      .catch(err => console.error(err));
  };

  const handleSliderChange = (event, newValue) => {
    setSettings(prev => ({ ...prev, similarityCutoff: newValue }));
  };

  const handleSliderSave = () => {
    updateSystemSettings({ similarityCutoff: settings.similarityCutoff })
      .then(newSettings => {
        setSettings(newSettings);
        toast.success(`Similarity Cutoff updated to ${newSettings.similarityCutoff}`);
        getAuditLogs().then(setLogs);
      })
      .catch(err => console.error(err));
  };

  const handleRateLimitSave = (val) => {
    updateSystemSettings({ rateLimitPerMin: val })
      .then(newSettings => {
        setSettings(newSettings);
        toast.success(`Global API Rate Limit updated to ${val} req/min`);
        getAuditLogs().then(setLogs);
      })
      .catch(err => console.error(err));
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-96">
        <CircularProgress color="amber" />
      </Box>
    );
  }

  return (
    <Box className="space-y-6">
      <Typography variant="h5" className="font-extrabold text-slate-100 mb-6">
        Global System Toggles & Feature Flags
      </Typography>

      <Grid container spacing={4}>
        {/* Settings Adjusters */}
        <Grid item xs={12} md={6}>
          <Card className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white space-y-6 h-full">
            <Typography className="font-bold text-slate-200 text-sm mb-2 flex items-center gap-2">
              <SettingsIcon className="text-amber-500" /> Platform Configuration
            </Typography>

            {/* Toggle 1: KNN Engine */}
            <Box className="flex items-center justify-between border-b border-slate-800 pb-4">
              <Box>
                <Typography className="text-sm font-bold text-slate-350">
                  KNN Auto-Review Engine
                </Typography>
                <Typography className="text-[10px] text-slate-500 mt-1">
                  Instantly grade matches above confidence cutoff using local KNN vectors
                </Typography>
              </Box>
              <Switch
                checked={settings.knnAutoReview}
                onChange={handleKnnToggle}
                color="warning"
              />
            </Box>

            {/* Selector 2: Cutoff Threshold Slider */}
            <Box className="border-b border-slate-800 pb-4 space-y-3">
              <Box className="flex justify-between items-center">
                <Box>
                  <Typography className="text-sm font-bold text-slate-350">
                    Similarity Cutoff Threshold
                  </Typography>
                  <Typography className="text-[10px] text-slate-500 mt-1">
                    Set cutoff confidence for automatic KNN vector resolution
                  </Typography>
                </Box>
                <Typography className="text-sm font-black text-amber-500 font-mono">
                  {settings.similarityCutoff.toFixed(2)}
                </Typography>
              </Box>
              <Box className="px-3 flex gap-4 items-center">
                <Slider
                  value={settings.similarityCutoff}
                  min={0.50}
                  max={0.95}
                  step={0.05}
                  onChange={handleSliderChange}
                  color="warning"
                  className="flex-1"
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleSliderSave}
                  style={{ color: '#f59e0b', borderColor: '#f59e0b' }}
                  className="hover:bg-amber-500/10 font-bold text-[10px] py-1 shadow-sm shrink-0"
                >
                  Save
                </Button>
              </Box>
            </Box>

            {/* Toggle 3: Rate Limiter Settings */}
            <Box className="pb-2 space-y-3">
              <Box className="flex justify-between items-center">
                <Box>
                  <Typography className="text-sm font-bold text-slate-350">
                    Global API Rate Limiter
                  </Typography>
                  <Typography className="text-[10px] text-slate-500 mt-1">
                    Maximum incoming requests allowed per user JWT per minute
                  </Typography>
                </Box>
                <Typography className="text-sm font-black text-amber-500 font-mono">
                  {settings.rateLimitPerMin} req/min
                </Typography>
              </Box>
              <Box className="flex gap-2 justify-start pt-1">
                {[30, 60, 120].map((limit) => (
                  <Button
                    key={limit}
                    size="small"
                    variant={settings.rateLimitPerMin === limit ? "contained" : "outlined"}
                    onClick={() => handleRateLimitSave(limit)}
                    style={{
                      backgroundColor: settings.rateLimitPerMin === limit ? '#f59e0b' : 'transparent',
                      color: settings.rateLimitPerMin === limit ? 'white' : '#94a3b8',
                      borderColor: settings.rateLimitPerMin === limit ? '#f59e0b' : 'rgba(255,255,255,0.1)'
                    }}
                    className="font-bold text-[10px] py-1 border rounded-lg cursor-pointer"
                  >
                    {limit} RPM
                  </Button>
                ))}
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Audit Logs */}
        <Grid item xs={12} md={6}>
          <Card className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white space-y-4 h-full flex flex-col justify-between">
            <div>
              <Typography className="font-bold text-slate-200 text-sm mb-4 flex items-center gap-2">
                <HistoryIcon className="text-amber-500" /> Platform Audit Trail (admin_audit_logs)
              </Typography>

              <Box className="max-h-72 overflow-y-auto space-y-2.5 pr-2">
                {logs.length === 0 ? (
                  <Typography className="text-slate-500 text-xs py-4 text-center">
                    No actions logged.
                  </Typography>
                ) : (
                  logs.map((log, idx) => (
                    <Box key={log.id} className="border border-slate-800 bg-slate-950/40 p-3.5 rounded-xl">
                      <div className="flex justify-between items-start">
                        <Box>
                          <Typography className="text-[10px] font-black text-amber-500 uppercase tracking-wider">
                            {log.action}
                          </Typography>
                          <Typography className="text-[9px] text-slate-500 mt-0.5">
                            Target: {log.target_entity}
                          </Typography>
                        </Box>
                        <span className="text-[8px] text-slate-500 font-mono">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <Typography className="text-xs text-slate-300 mt-2 font-mono leading-relaxed">
                        {log.details}
                      </Typography>
                      <Typography className="text-[9px] text-slate-500 text-right mt-1.5 font-bold">
                        Actor: {log.admin_name}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </div>
            <Typography className="text-[9px] text-slate-600 text-center mt-4">
              All settings adjustments generate an immutable record inside the admin_audit_logs database table.
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
