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
      console.log('✅ Database initialized');
      await loadPatients();
      setDbReady(true);
    } catch (err) {
      console.error('❌ Error initializing database:', err);
    }
  };
};