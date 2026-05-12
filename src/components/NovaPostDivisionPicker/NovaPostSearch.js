import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.scss';

const NovaPostSearch = ({ apiKey, onSelectDivision }) => {
  const [token, setToken] = useState(null);
  const [settlementQuery, setSettlementQuery] = useState('');
  const [settlements, setSettlements] = useState([]);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [divisionQuery, setDivisionQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  // Авторизація
  const getToken = async () => {
    try {
      const res = await fetch(
        `https://api.novapost.com/v.1.0/clients/authorization?apiKey=${apiKey}`
      );
      const data = await res.json();
      setToken(data.jwt);
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  useEffect(() => {
    getToken();
  }, [apiKey]);

  // Debounce пошук населених пунктів
  const searchSettlements = (text) => {
    setSettlementQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!token) return;

    debounceRef.current = setTimeout(async () => {
      if (text.length < 2) return;
      const params = new URLSearchParams();
      params.append('countryCodes[]', 'UA');
      params.append('limit', 10);
      params.append('name', `*${text}*`);

      try {
        const res = await fetch(`https://api.novapost.com/v.1.0/settlements?${params.toString()}`, {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        setSettlements(data.items || []);
      } catch (err) {
        console.error('Settlement search error:', err);
      }
    }, 400);
  };

  const getDivisions = async (settlementId) => {
    setLoading(true);
    setDivisions([]);
    const params = new URLSearchParams();
    params.append('countryCodes[]', 'UA');
    params.append('limit', 100);
    params.append('settlementIds[]', settlementId);

    try {
      const res = await fetch(`https://api.novapost.com/v.1.0/divisions?${params.toString()}`, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      setDivisions(data.items || []);
    } catch (err) {
      console.error('Division fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDivisions = divisions.filter((d) => {
    const q = divisionQuery.toLowerCase();
    return d.name?.toLowerCase().includes(q) || d.displayAddress?.toLowerCase().includes(q);
  });

  return (
    <div className={styles.block}>
      <p className={styles.note}>
        📦 Оберіть відділення «Нова Пошта». Поштомати недоступні для вибору (обмеження габаритів).
      </p>

      <label>Населений пункт:</label>
      <input
        className={styles.input}
        value={settlementQuery}
        onChange={(e) => searchSettlements(e.target.value)}
        placeholder="Введіть назву міста..."
      />

      {settlements.length > 0 && (
        <div className={styles.dropdown}>
          {settlements.map((s) => (
            <div
              key={s.id}
              className={styles.option}
              onClick={() => {
                setSelectedSettlement(s);
                setSettlements([]);
                getDivisions(s.id);
              }}
            >
              {s.name} — {s.region?.name}
            </div>
          ))}
        </div>
      )}

      {selectedSettlement && (
        <>
          <label>Відділення ({selectedSettlement.name}):</label>
          <input
            className={styles.input}
            value={divisionQuery}
            onChange={(e) => setDivisionQuery(e.target.value)}
            placeholder="Пошук відділення..."
          />

          {loading && <p className={styles.loading}>Завантаження...</p>}

          {!loading && divisions.length > 0 && (
            <div className={styles.dropdown}>
              {filteredDivisions.map((d) => {
                /* Відділення до 30 кг (PostBranch) — доступні; поштомати — ні */
                const isDisabled = d.divisionCategory === 'Postomat';

                return (
                  <div
                    key={d.id}
                    className={`${styles.option} ${isDisabled ? styles.disabled : ''}`}
                    onClick={() => {
                      if (isDisabled) return; // 🚫 не клікаємо
                      setDivisionQuery(d.name); // ✅ показуємо вибране у полі
                      setDivisions([]); // ✅ закриваємо список
                      onSelectDivision(d); // передаємо вибір наверх
                    }}
                    style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                  >
                    <b>{d.name}</b>
                    <br />
                    <small>{d.displayAddress}</small>
                    {isDisabled && <span className={styles.tag}>недоступно</span>}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NovaPostSearch;
