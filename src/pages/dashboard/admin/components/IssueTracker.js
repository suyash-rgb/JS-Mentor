import React, { useEffect, useState } from 'react';
import { getPlatformIssues, updateTicketStatus } from '../../../../services/adminService';
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import toast from 'react-hot-toast';

export default function IssueTracker() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    getPlatformIssues()
      .then(res => {
        setTickets(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleResolve = (ticketId) => {
    updateTicketStatus(ticketId, 'RESOLVED')
      .then(updatedList => {
        setTickets(updatedList);
        toast.success(`Ticket ${ticketId} resolved successfully!`);
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to update ticket status.');
      });
  };

  const filteredTickets = tickets.filter(t => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-96">
        <CircularProgress color="amber" />
      </Box>
    );
  }

  return (
    <Box className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h5" className="font-extrabold text-slate-100">
          Platform Issues & Ticket Resolution
        </Typography>

        <FormControl size="small" style={{ minWidth: 150 }} className="bg-slate-800 text-white rounded-lg">
          <InputLabel id="status-filter-label" style={{ color: '#94a3b8' }}>Status Filter</InputLabel>
          <Select
            labelId="status-filter-label"
            value={filterStatus}
            label="Status Filter"
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ color: 'white' }}
            sx={{
              '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f59e0b' }
            }}
          >
            <MenuItem value="ALL">All Issues</MenuItem>
            <MenuItem value="OPEN">Open</MenuItem>
            <MenuItem value="RESOLVED">Resolved</MenuItem>
          </Select>
        </FormControl>
      </div>

      {/* Ticket List Table */}
      <Card className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white">
        {filteredTickets.length === 0 ? (
          <Typography className="text-slate-400 text-sm text-center py-8">
            No technical tickets matching the current filter.
          </Typography>
        ) : (
          <TableContainer component={Paper} className="bg-transparent shadow-none border border-slate-800 rounded-xl overflow-hidden">
            <Table size="small">
              <TableHead className="bg-slate-950">
                <TableRow>
                  <TableCell className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">Ticket ID</TableCell>
                  <TableCell className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">Student</TableCell>
                  <TableCell className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">Category</TableCell>
                  <TableCell className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">Description</TableCell>
                  <TableCell align="center" className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">Logged At</TableCell>
                  <TableCell align="center" className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">Status</TableCell>
                  <TableCell align="right" className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTickets.map((ticket) => {
                  const isOpen = ticket.status === "OPEN";
                  return (
                    <TableRow key={ticket.id} className="hover:bg-slate-850/40 transition-colors">
                      <TableCell className="text-amber-500 border-b border-slate-850 font-bold text-xs py-4">{ticket.id}</TableCell>
                      <TableCell className="text-slate-300 border-b border-slate-850 text-xs py-4 font-semibold">{ticket.student}</TableCell>
                      <TableCell className="text-slate-300 border-b border-slate-850 text-xs py-4">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono text-[10px]">
                          {ticket.issueType}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-400 border-b border-slate-850 text-xs py-4 max-w-sm truncate" title={ticket.description}>
                        {ticket.description}
                      </TableCell>
                      <TableCell align="center" className="text-slate-500 border-b border-slate-850 text-xs py-4">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="center" className="border-b border-slate-850 py-4 text-[10px]">
                        <span className={`px-2.5 py-0.5 rounded-full font-black ${
                          isOpen ? 'bg-red-950/40 text-red-400 border border-red-900 animate-pulse' : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900'
                        }`}>
                          {ticket.status}
                        </span>
                      </TableCell>
                      <TableCell align="right" className="border-b border-slate-850 py-4">
                        {isOpen ? (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleResolve(ticket.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold capitalize text-[10px] rounded-lg px-3 py-1 shadow-sm border-0 cursor-pointer"
                          >
                            Mark Resolved
                          </Button>
                        ) : (
                          <span className="text-slate-500 text-xs font-bold">No Action</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}
