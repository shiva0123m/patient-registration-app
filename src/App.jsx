import React, { useEffect, useRef, useState } from 'react';
import { PGlite } from '@electric-sql/pglite';
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

const db = new PGlite('idb://my-db');

const App = () => {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ name: '', age: '', gender: '' });
  const [sql, setSql] = useState('');
  const [sqlResult, setSqlResult] = useState([]);
  const [dbReady, setDbReady] = useState(false);
  const broadcastRef = useRef(null);

  const initDb = async () => {
    try {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS patients (
          id SERIAL PRIMARY KEY,
          name TEXT,
          age INTEGER,
          gender TEXT
        );
      `);
      await loadPatients();
      setDbReady(true);
    } catch (err) {
      console.error('Error initializing database:', err);
    }
  };

  const loadPatients = async () => {
    try {
      const result = await db.exec('SELECT * FROM patients ORDER BY id DESC;');
      const rows = result[0]?.rows ?? [];
      setPatients(rows);
    } catch (err) {
      console.error('Error loading patients:', err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, age, gender } = form;

    if (!name || !gender || isNaN(Number(age))) {
      alert('Please enter valid data');
      return;
    }

    try {
      await db.exec(
        `INSERT INTO patients (name, age, gender) VALUES ('${name.replace(/'/g, "''")}', ${Number(age)}, '${gender.replace(/'/g, "''")}');`
      );
      setForm({ name: '', age: '', gender: '' });
      await loadPatients();
      broadcastRef.current?.postMessage('update');
    } catch (err) {
      console.error('Error registering patient:', err);
    }
  };

  const handleSqlQuery = async () => {
    try {
      const result = await db.exec(sql);
      const rows = result[0]?.rows ?? [];
      setSqlResult(rows);
    } catch (e) {
      alert('Invalid SQL');
      console.error('SQL Error:', e);
    }
  };

  useEffect(() => {
    initDb();

    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('patient-db-sync');
      broadcastRef.current = bc;
      bc.onmessage = () => {
        loadPatients();
      };
      return () => bc.close();
    }
  }, []);

  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="xl">
        <Paper elevation={4} sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
            Patient Registration App
          </Typography>

          {!dbReady ? (
            <Typography align="center" color="text.secondary" py={4}>
              Loading database...
            </Typography>
          ) : (
            <Grid container spacing={4} alignItems="stretch">
              {/* Left Column */}
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Register Patient
                  </Typography>
                  <Box component="form" onSubmit={handleRegister}>
                    <TextField
                      fullWidth
                      label="Name"
                      variant="outlined"
                      margin="normal"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Age"
                      type="number"
                      variant="outlined"
                      margin="normal"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                      required
                    />
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Gender</InputLabel>
                      <Select
                        value={form.gender}
                        label="Gender"
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        required
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2, py: 1.2 }}
                    >
                      Register
                    </Button>
                  </Box>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Run Raw SQL
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label="SQL Query"
                    variant="outlined"
                    value={sql}
                    onChange={(e) => setSql(e.target.value)}
                  />
                  <Button
                    variant="outlined"
                    sx={{ mt: 2, fontWeight: 600 }}
                    onClick={handleSqlQuery}
                  >
                    Run SQL
                  </Button>
                </Paper>
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} md={6}>
                {patients.length > 0 && (
                  <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Registered Patients
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: '#f0f0f0' }}>
                          <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Age</TableCell>
                            <TableCell>Gender</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {patients.map((p) => (
                            <TableRow key={p.id} hover>
                              <TableCell>{p.id}</TableCell>
                              <TableCell>{p.name}</TableCell>
                              <TableCell>{p.age}</TableCell>
                              <TableCell>{p.gender}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}

                {sqlResult.length > 0 && (
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      SQL Query Results
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: '#f0f0f0' }}>
                          <TableRow>
                            {Object.keys(sqlResult[0]).map((key) => (
                              <TableCell key={key}>{key}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sqlResult.map((row, i) => (
                            <TableRow key={i}>
                              {Object.values(row).map((val, j) => (
                                <TableCell key={j}>{val}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}
              </Grid>
            </Grid>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default App;
