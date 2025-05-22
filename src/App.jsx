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
};