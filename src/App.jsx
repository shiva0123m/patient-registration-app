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
  useEffect(() => {
    initDb();

    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('patient-db-sync');
      broadcastRef.current = bc;
      bc.onmessage = () => {
        console.log('🔄 Received broadcast update');
        loadPatients();
      };
      return () => bc.close();
    }
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Patient Registration</h1>

      {!dbReady ? (
        <div>Loading database...</div>
      ) : (
        <>
          <form onSubmit={handleRegister} className="space-y-4 mb-8">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border p-2 w-full"
              required
            />
            <input
              type="number"
              placeholder="Age"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="border p-2 w-full"
              required
            />
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="border p-2 w-full"
              required
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            <button className="bg-blue-500 text-white p-2 rounded" type="submit">
              Register Patient
            </button>
          </form>

          {/* Debug: Show patients array */}
          <pre className="bg-gray-100 p-2 mb-4 rounded text-xs">{JSON.stringify(patients, null, 2)}</pre>

          {patients.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Table: <span className="font-mono">patients</span></h2>
              <table className="w-full table-auto border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">ID</th>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Age</th>
                    <th className="border p-2">Gender</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p.id} className="text-center">
                      <td className="border p-2">{p.id}</td>
                      <td className="border p-2">{p.name}</td>
                      <td className="border p-2">{p.age}</td>
                      <td className="border p-2">{p.gender}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-8">
            <h2 className="font-bold text-xl mb-2">Run Raw SQL</h2>
            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              placeholder="SELECT * FROM patients;"
              className="border p-2 w-full h-24"
            />
            <button
              onClick={handleSqlQuery}
              className="bg-green-500 text-white mt-2 p-2 rounded"
            >
              Run SQL
            </button>
            <div className="mt-4">
              {sqlResult.length > 0 && (
                <table className="w-full border">
                  <thead>
                    <tr>
                      {Object.keys(sqlResult[0]).map((key) => (
                        <th className="border p-2" key={key}>
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sqlResult.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td className="border p-2" key={j}>
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;