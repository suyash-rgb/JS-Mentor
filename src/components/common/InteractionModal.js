import React from 'react';
import { 
  Modal, Fade, Backdrop, Paper, Typography, Box, Button 
} from '@mui/material';

const InteractionModal = ({ interaction, setInteraction, mode, isMobile }) => {
  if (!interaction.open) return null;

  return (
    <Modal 
      open={interaction.open} 
      closeAfterTransition 
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
    >
      <Fade in={interaction.open}>
        <Paper sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: isMobile ? '90%' : 450, bgcolor: 'background.paper', borderRadius: '16px',
          boxShadow: 24, p: 4, textAlign: 'center'
        }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {interaction.type === 'alert' ? '🔔 Alert' : interaction.type === 'confirm' ? '❓ Confirm' : '💬 Prompt'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>{interaction.message}</Typography>
          
          {interaction.type === 'prompt' && (
            <Box sx={{ mb: 3 }}>
              <input 
                type="text" 
                value={interaction.value}
                onChange={(e) => setInteraction({ ...interaction, value: e.target.value })}
                style={{
                  width: '100%', padding: '12px', borderRadius: '8px', 
                  border: '1px solid #ccc', backgroundColor: mode === 'dark' ? '#333' : '#fff',
                  color: mode === 'dark' ? '#fff' : '#000', fontSize: '1rem'
                }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') interaction.resolve(interaction.value);
                }}
              />
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            {interaction.type === 'confirm' ? (
              <>
                <Button variant="outlined" color="error" onClick={() => interaction.resolve(false)}>Cancel</Button>
                <Button variant="contained" color="success" onClick={() => interaction.resolve(true)}>OK</Button>
              </>
            ) : interaction.type === 'prompt' ? (
              <>
                <Button variant="outlined" color="inherit" onClick={() => interaction.resolve(null)}>Cancel</Button>
                <Button variant="contained" color="primary" onClick={() => interaction.resolve(interaction.value)}>Submit</Button>
              </>
            ) : (
              <Button variant="contained" onClick={() => interaction.resolve()}>OK</Button>
            )}
          </Box>
        </Paper>
      </Fade>
    </Modal>
  );
};

export default InteractionModal;
