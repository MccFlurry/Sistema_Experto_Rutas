import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';

const Navigation = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <FlightTakeoffIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Air Routes Expert System
        </Typography>
        <Box>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/route-planner"
          >
            Route Planner
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
