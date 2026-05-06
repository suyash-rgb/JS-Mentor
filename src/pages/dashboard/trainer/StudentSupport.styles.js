import { styled, Box, Paper, ListItem } from '@mui/material';

export const MainContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f8fafc',
}));

export const GlassPaper = styled(Paper)(({ theme }) => ({
    borderRadius: '16px',
    border: '1px solid rgba(0,0,0,0.08)',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
}));

export const SidePanel = styled(GlassPaper)({
    display: 'flex',
    flexDirection: 'column',
});

export const ChatPanel = styled(GlassPaper)({
    display: 'flex',
    flexDirection: 'column',
});

export const StyledListItem = styled(ListItem)(({ theme }) => ({
    padding: theme.spacing(2),
    transition: 'all 0.2s ease',
    borderLeft: '4px solid transparent',
    '&.Mui-selected': {
        backgroundColor: '#eff6ff',
        borderLeftColor: theme.palette.primary.main,
        '&:hover': { backgroundColor: '#dbeafe' },
    },
    '&:hover': { backgroundColor: '#f1f5f9' },
}));

export const PanelHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
}));