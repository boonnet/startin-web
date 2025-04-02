import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ListItemButton, ListItemIcon, ListItemText, Box } from '@mui/material';

const SidebarLink = ({ icon, text, path, selected, onClick }) => {
  return (
    <ListItemButton
      component={RouterLink}
      to={path}
      onClick={onClick}
      selected={selected}
      sx={{
        borderRadius: '8px',
        mb: 0.5,
        backgroundColor: selected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
        color: selected ? '#3b82f6' : '#64748b', 
        '&:hover': {
          backgroundColor: selected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0, 0, 0, 0.04)',
        },
        '&.Mui-selected': {
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
        },
        '&.Mui-selected:hover': {
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
        },
        py: 1,
      }}
    >
      <ListItemIcon 
        sx={{ 
          minWidth: 40, 
          color: selected ? '#3b82f6' : '#64748b',
        }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText 
        primary={text} 
        primaryTypographyProps={{ 
          fontWeight: selected ? 600 : 500,
          fontSize: '0.95rem',
        }} 
      />
    </ListItemButton>
  );
};

export default SidebarLink;