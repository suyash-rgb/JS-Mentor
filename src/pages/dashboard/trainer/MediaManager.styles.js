import { styled, Box, Card, CardMedia, Typography, Button, IconButton, Select, Paper } from '@mui/material';

export const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

export const PageTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  fontWeight: 'bold',
}));

export const MainCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(6),
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(3),
  maxWidth: '800px',
  marginLeft: 0,
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  fontWeight: 'bold',
}));

export const FormContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

export const FormGroup = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  backgroundColor: '#f8fafc',
  borderRadius: theme.spacing(1),
  borderBottom: '3px solid #e2e8f0',
  transition: '0.2s',
  '&:hover': {
    backgroundColor: '#f1f5f9',
  },
}));

export const GroupLabel = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: 1,
  color: theme.palette.primary.main,
}));

export const UploadButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'white',
  paddingTop: theme.spacing(1.8),
  paddingBottom: theme.spacing(1.8),
  textTransform: 'none',
  fontSize: '1rem',
  borderStyle: 'dashed',
  borderWidth: 2,
  '&:hover': {
    borderWidth: 2,
  },
}));

export const PublishButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  marginTop: theme.spacing(1),
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  fontSize: '1.1rem',
  fontWeight: 'bold',
  textTransform: 'none',
  boxShadow: theme.shadows[3],
}));

export const GallerySection = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(0.5),
  backgroundColor: '#ffffff',
}));

export const GalleryHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
}));

export const FilterSelect = styled(Select)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  backgroundColor: '#f8fafc',
}));

export const VideoGridCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid #e2e8f0',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 12px 20px -10px rgba(0,0,0,0.1)',
    borderColor: theme.palette.primary.light,
  },
}));

export const VideoContainer = styled(Box)({
  position: 'relative',
  paddingTop: '56.25%',
  backgroundColor: 'black',
});

export const VideoFrame = styled(CardMedia)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  border: 0,
});

export const PlayOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
});

export const PlayIconOverlay = styled(Box)({
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.3)',
  opacity: 0,
  transition: '0.3s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    opacity: 1,
  },
});

export const PlayButtonContainer = styled(Box)({
  width: 64,
  height: 64,
  borderRadius: '50%',
  backgroundColor: 'rgba(255,255,255,0.9)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: '0.3s',
  '&:hover': {
    transform: 'scale(1.1)',
  },
});

export const CardDetails = styled(Box)({
  minWidth: 0,
});

export const VideoTitle = styled(Typography)({
  fontWeight: 'bold',
  marginBottom: '4px',
  lineHeight: 1.3,
});

export const PathCaption = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  textTransform: 'uppercase',
  fontSize: '0.7rem',
  display: 'block',
  marginBottom: '4px',
  color: theme.palette.primary.main,
}));

export const TopicText = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
}));

export const ActionGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
}));

export const StyledIconButton = styled(IconButton)(({ theme, color }) => ({
  backgroundColor: color === 'error' ? '#fef2f2' : '#f1f5f9',
  '&:hover': {
    backgroundColor: color === 'error' ? '#fee2e2' : '#e2e8f0',
  },
}));

export const EmptyGalleryPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  textAlign: 'center',
  backgroundColor: '#f8fafc',
  borderRadius: theme.spacing(1.5),
  border: '1px dashed #cbd5e1',
}));

export const ModalPaperProps = {
  sx: { borderRadius: 3, p: 1 }
};
