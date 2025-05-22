import React, { useEffect, useRef, useState } from 'react';
import { PGlite } from '@electric-sql/pglite';

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
      console.log('Database initialized');
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
      console.log(' Fetched patients:', rows);
      setPatients(rows);
    } catch (err) {
      console.error(' Error loading patients:', err);
    }
  };
    const handleRegister = async (e) => {
    e.preventDefault();
    const { name, age, gender } = form;

    if (!name || !gender || isNaN(Number(age))) {
      alert('Please enter valid data');
      return;
    }

    const safeName = name.replace(/'/g, "''");
    const safeGender = gender.replace(/'/g, "''");

    try {
      await db.exec(
        `INSERT INTO patients (name, age, gender) VALUES ('${safeName}', ${Number(age)}, '${safeGender}');`
      );
      console.log('Patient registered:', { name, age, gender });
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
      console.log('SQL executed:', sql, rows);
      setSqlResult(rows);
    } catch (e) {
      alert('Invalid SQL');
      console.error('SQL Error:', e);
    }
  };

};