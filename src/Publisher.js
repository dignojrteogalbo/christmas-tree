import React from 'react';
import { Button, Container, Paper, TextField, Box } from '@material-ui/core';
import './Publisher.css';

export default function Publisher() {
    return (
        <Box id='Publisher'>
            <Paper>
                <Container id='frame'/>
                <Container>
                    <TextField label='Name' variant='filled' />
                    <Button variant='contained' onClick={console.log('swag')}>Publish</Button>
                </Container>
            </Paper>
        </Box>
    );
}