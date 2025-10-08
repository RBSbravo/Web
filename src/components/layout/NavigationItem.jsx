import React, { memo } from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

const NavigationItem = memo(({ item, isSelected, onNavigate }) => {
  const IconComponent = item.icon;
  
  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={onNavigate}
        selected={isSelected}
        sx={{
          mx: { xs: 0.5, sm: 1 },
          borderRadius: 2,
          mb: 0.5,
          py: { xs: 1, sm: 1.5 },
          '&.Mui-selected': {
            backgroundColor: 'rgba(76,175,80,0.1)',
            '&:hover': {
              backgroundColor: 'rgba(76,175,80,0.15)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.04)',
          },
        }}
      >
        <ListItemIcon
          sx={{
            color: isSelected ? 'primary.main' : 'inherit',
            minWidth: { xs: 36, sm: 40 },
          }}
        >
          {IconComponent && <IconComponent />}
        </ListItemIcon>
        <ListItemText 
          primary={item.text}
          sx={{
            '& .MuiListItemText-primary': {
              fontWeight: isSelected ? 600 : 400,
              fontSize: { xs: '0.875rem', sm: '1rem' },
            },
          }}
        />
      </ListItemButton>
    </ListItem>
  );
});

NavigationItem.displayName = 'NavigationItem';

export default NavigationItem; 