import React from 'react';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledAnimatedButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  color: '#333',
  borderRadius: '25px',
  padding: '12px 32px',
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  border: 'none',
  backgroundColor: 'transparent',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '-100%',
    transform: 'translateY(-50%)',
    width: '130%',
    height: '100%',
    background: 'linear-gradient(90deg, #FAB3F7 0%, #FF85FF 50%, #FF52F8 100%)',
    backgroundSize: '200% 100%',
    backgroundPosition: '0% 50%',
    borderRadius: '100px',
    transition: 'all 0.9s ease, background-position 0.9s ease',
    zIndex: 1,
  },

  '&:hover': {
    color: '#FFFFFF',

    '&::before': {
      left: '-25%',
      backgroundPosition: '100% 50%', // Shift the gradient to show darker colors
    },

    '& .arrow': {
      transform: 'translateX(5px)',
    }
  },

  '& .button-content': {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  '& .arrow': {
    transition: 'transform 0.8s ease',
  },

  [theme.breakpoints.down('sm')]: {
    padding: '10px 24px',
    fontSize: '14px',
  },
}));

const AnimatedButton = ({ buttonText = "EXPLORE NOW", onClick, ...props }) => {
  return (
    <StyledAnimatedButton disableRipple onClick={onClick} {...props}>
      <span className="button-content">
        {buttonText}
        <span className="arrow">→</span>
      </span>
    </StyledAnimatedButton>
  );
};

export default AnimatedButton;