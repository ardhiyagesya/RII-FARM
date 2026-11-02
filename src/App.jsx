
import { useState, useEffect } from "react";
import "./index.css";

// ==========================================
// KONFIGURASI PENYIMPANAN RII FARM
// ==========================================

const SECTORS_STORAGE_KEY = "rii_farm_sectors_v1";

const initialSectors = [
  {
    id: 1,
    name: "Peternakan Jangkrik",
    icon: "🦗",
    income: 1500000,
    expense: 700000,
  },
  {
    id: 2,
    name: "Peternakan Cacing ANC",
    icon: "🪱",
    income: 800000,
    expense: 300000,
  },
  {
    id: 3,
    name: "Peternakan Belut",
    icon: "🐟",
    income: 0,
    expense: 0,
  },
];

// ==========================================
// MEMBACA DATA SEKTOR
// ==========================================

function loadSectors() {
  try {
    const saved = localStorage.getItem(SECTORS_STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Gagal membaca sektor:", error);
  }

  return initialSectors;
}

// ==========================================
// DATA TRANSAKSI SEMENTARA
// ==========================================

const initialTransactions = [
  {
    id: 1,
    date: "02 Nov 2026",
    name: "Penjualan jangkrik",
    sectorId: 1,
    type: "income",
    amount: 500000,
  },
  {
    id: 2,
    date: "01 Nov 2026",
    name: "Pembelian pakan",
    sectorId: 1,
    type: "expense",
    amount: 150000,
  },
  {
    id: 3,
    date: "01 Nov 2026",
    name: "Penjualan cacing ANC",
    sectorId: 2,
    type: "income",
    amount: 300000,
  },
  {
    id: 4,
    date: "31 Okt 2026",
    name: "Pembelian media",
    sectorId: 2,
    type: "expense",
    amount: 100000,
  },
];

// ==========================================
// FORMAT RUPIAH
// ==========================================

const rupiah = (number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);

// ==========================================
// APLIKASI UTAMA
// ==========================================

function App() {
  // Data sektor dibaca dari penyimpanan browser
  const [sectors, setSectors] = useState(loadSectors);

  const [transactions] = useState(initialTransactions);

  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [showModal, setShowModal] = useState(false);
  const [sectorName, setSectorName] = useState("");
  const [editingSector, setEditingSector] = useState(null);
  const [search, setSearch] = useState("");

  // ==========================================
  // MENYIMPAN DATA SETIAP ADA PERUBAHAN
  // ==========================================

  useEffect(() => {
    try {
      localStorage.setItem(
        SECTORS_STORAGE_KEY,
        JSON.stringify(sectors)
      );
    } catch (error) {
      console.error("Gagal menyimpan sektor:", error);
      alert("Data gagal disimpan. Periksa penyimpanan browser Anda.");
    }
  }, [sectors]);

  // ==========================================
  // PERHITUNGAN KEUANGAN
  // ==========================================

  const totalIncome = sectors.reduce(
    (total, sector) => total + Number(sector.income || 0),
    0
  );

  const totalExpense = sectors.reduce(
    (total, sector) => total + Number(sector.expense || 0),
    0
  );

  const totalProfit = totalIncome - totalExpense;

  // ==========================================
  // MENU NAVIGASI
  // ==========================================

  const menus = [
    { name: "Dashboard", icon: "⌂" },
    { name: "Manajemen Sektor", icon: "▦" },
    { name: "Pengeluaran", icon: "↗" },
    { name: "Pemasukan", icon: "↙" },
    { name: "Laporan", icon: "▤" },
    { name: "Analisis & Grafik", icon: "▥" },
  ];

  // ==========================================
  // TAMBAH SEKTOR
  // ==========================================

  function openAddModal() {
    setEditingSector(null);
    setSectorName("");
    setShowModal(true);
  }

  // ==========================================
  // EDIT SEKTOR
  // ==========================================

  function openEditModal(sector) {
    setEditingSector(sector);
    setSectorName(sector.name);
    setShowModal(true);
  }

  // ==========================================
  // SIMPAN SEKTOR
  // ==========================================

  function saveSector(event) {
    event.preventDefault();

    const name = sectorName.trim();

    if (!name) {
      alert("Nama sektor harus diisi.");
      return;
    }

    if (editingSector) {
      setSectors((current) =>
        current.map((sector) =>
          sector.id === editingSector.id
            ? { ...sector, name }
            : sector
        )
      );
    } else {
      const newSector = {
        id: Date.now(),
        name,
        icon: "🌱",
        income: 0,
        expense: 0,
      };

      setSectors((current) => [...current, newSector]);
    }

    setShowModal(false);
    setSectorName("");
    setEditingSector(null);
  }

  // ==========================================
  // HAPUS SEKTOR
  // ==========================================

  function deleteSector(sector) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus sektor "${sector.name}"?\n\nData sektor ini akan dihapus dari penyimpanan browser.`
    );

    if (!confirmed) return;

    setSectors((current) =>
      current.filter((item) => item.id !== sector.id)
    );

    // Simpan langsung agar penghapusan tidak menunggu refresh
    try {
      const updatedSectors = sectors.filter(
        (item) => item.id !== sector.id
      );

      localStorage.setItem(
        SECTORS_STORAGE_KEY,
        JSON.stringify(updatedSectors)
      );
    } catch (error) {
      console.error("Gagal menghapus sektor:", error);
      alert("Gagal menyimpan perubahan penghapusan.");
    }
  }

  // ==========================================
  // PENCARIAN DAN TAMPILAN SEKTOR
  // ==========================================

  function renderSectorCards() {
    const filtered = sectors.filter((sector) =>
      sector.name.toLowerCase().includes(search.toLowerCase())
    );

    if (filtered.length === 0) {
      return (
        <div className="empty-state">
          <span>🌱</span>
          <h3>Sektor belum ditemukan</h3>
          <p>Silakan tambahkan sektor usaha baru.</p>
        </div>
      );
    }

    return (
      <div className="sector-grid">
        {filtered.map((sector) => (
          <div className="sector-card" key={sector.id}>
            <div className="sector-top">
              <div className="sector-icon">{sector.icon}</div>
              <span className="active-badge">Aktif</span>
            </div>

            <h3>{sector.name}</h3>

            <div className="sector-finance">
              <div>
                <small>Pemasukan</small>
                <strong className="positive">
                  {rupiah(sector.income)}
                </strong>
              </div>

              <div>
                <small>Pengeluaran</small>
                <strong className="negative">
                  {rupiah(sector.expense)}
                </strong>
              </div>
            </div>

            <div className="sector-profit">
              <span>Selisih keuangan</span>

              <strong
                className={
                  sector.income - sector.expense >= 0
                    ? "positive"
                    : "negative"
                }
              >
                {rupiah(sector.income - sector.expense)}
              </strong>
            </div>

            <div className="sector-actions">
              <button
                className="edit-button"
                onClick={() => openEditModal(sector)}
              >
                ✏ Edit
              </button>

              <button
                className="delete-button"
                onClick={() => deleteSector(sector)}
              >
                🗑 Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ==========================================
  // RIWAYAT TRANSAKSI
  // ==========================================

  function renderTransactions() {
    return (
      <div className="panel">
        <div className="panel-heading">
          <div>
            <h2>Aktivitas Transaksi</h2>
            <p>Contoh riwayat transaksi awal</p>
          </div>
        </div>

        {transactions.map((item) => {
          const sector = sectors.find(
            (s) => s.id === item.sectorId
          );

          return (
            <div className="transaction" key={item.id}>
              <div className={`transaction-icon ${item.type}`}>
                {item.type === "income" ? "↓" : "↑"}
              </div>

              <div className="transaction-info">
                <strong>{item.name}</strong>

                <small>
                  {item.date} ·{" "}
                  {sector ? sector.name : "Sektor dihapus"}
                </small>
              </div>

              <strong
                className={
                  item.type === "income"
                    ? "positive"
                    : "negative"
                }
              >
                {item.type === "income" ? "+" : "-"}
                {rupiah(item.amount)}
              </strong>
            </div>
          );
        })}
      </div>
    );
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  function renderDashboard() {
    return (
      <>
        <section className="welcome">
          <div>
            <span className="welcome-tag">
              FARM BUSINESS MANAGEMENT
            </span>

            <h2>Selamat Datang di RII FARM 🌱</h2>

            <p>
              Kelola seluruh sektor peternakan dan pantau
              keuangan usaha Anda.
            </p>
          </div>

          <div className="welcome-emoji">🌾</div>
        </section>

        <section className="summary-grid">
          <div className="summary-card">
            <div className="card-heading">
              Total Pemasukan
              <span className="card-icon green">↙</span>
            </div>

            <h2>{rupiah(totalIncome)}</h2>
            <small>Seluruh sektor usaha</small>
          </div>

          <div className="summary-card">
            <div className="card-heading">
              Total Pengeluaran
              <span className="card-icon orange">↗</span>
            </div>

            <h2>{rupiah(totalExpense)}</h2>
            <small>Seluruh sektor usaha</small>
          </div>

          <div className="summary-card">
            <div className="card-heading">
              Selisih Keuangan
              <span className="card-icon blue">◇</span>
            </div>

            <h2 className={totalProfit >= 0 ? "positive" : "negative"}>
              {rupiah(totalProfit)}
            </h2>

            <small>Pemasukan dikurangi pengeluaran</small>
          </div>

          <div className="summary-card">
            <div className="card-heading">
              Jumlah Sektor
              <span className="card-icon purple">▦</span>
            </div>

            <h2>{sectors.length} Sektor</h2>
            <small>Sektor terdaftar</small>
          </div>
        </section>

        <section className="section-heading">
          <div>
            <h2>Manajemen Sektor Usaha</h2>
            <p>Kelola setiap peternakan secara terpisah.</p>
          </div>

          <button
            className="primary-button"
            onClick={openAddModal}
          >
            + Tambah Sektor
          </button>
        </section>

        {renderSectorCards()}

        <section className="bottom-grid">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <h2>Grafik Keuangan Sektor</h2>
                <p>
                  Perbandingan nilai pemasukan dan pengeluaran
                </p>
              </div>
            </div>

            <div className="chart">
              {sectors.length === 0 ? (
                <p className="empty-chart">
                  Belum ada data sektor.
                </p>
              ) : (
                sectors.map((sector) => {
                  const maxValue = Math.max(
                    1,
                    ...sectors.flatMap((s) => [
                      s.income,
                      s.expense,
                    ])
                  );

                  return (
                    <div className="chart-row" key={sector.id}>
                      <span>{sector.name}</span>

                      <div className="chart-track">
                        <div
                          className="chart-income"
                          style={{
                            width: `${
                              (sector.income / maxValue) * 100
                            }%`,
                          }}
                        />
                      </div>

                      <div className="chart-track">
                        <div
                          className="chart-expense"
                          style={{
                            width: `${
                              (sector.expense / maxValue) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}

              <div className="chart-legend">
                <span>
                  <i className="legend-income" />
                  Pemasukan
                </span>

                <span>
                  <i className="legend-expense" />
                  Pengeluaran
                </span>
              </div>
            </div>
          </div>

          {renderTransactions()}
        </section>
      </>
    );
  }

  // ==========================================
  // HALAMAN LAIN
  // ==========================================

  function renderOtherPage() {
    if (activeMenu === "Manajemen Sektor") {
      return (
        <>
          <section className="section-heading">
            <div>
              <h2>Daftar Sektor Peternakan</h2>
              <p>Tambah, ubah, atau hapus sektor usaha.</p>
            </div>

            <button
              className="primary-button"
              onClick={openAddModal}
            >
              + Tambah Sektor
            </button>
          </section>

          <input
            className="search-input"
            placeholder="Cari nama sektor..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {renderSectorCards()}
        </>
      );
    }

    if (
      activeMenu === "Pengeluaran" ||
      activeMenu === "Pemasukan"
    ) {
      return (
        <div className="placeholder-panel">
          <div className="placeholder-icon">
            {activeMenu === "Pengeluaran" ? "💸" : "💰"}
          </div>

          <h2>{activeMenu}</h2>

          <p>
            Form pencatatan dan database transaksi akan
            dibuat pada tahap berikutnya.
          </p>

          <span className="development-label">
            Dalam tahap pengembangan
          </span>
        </div>
      );
    }

    if (
      activeMenu === "Laporan" ||
      activeMenu === "Analisis & Grafik"
    ) {
      return (
        <>
          <section className="summary-grid">
            <div className="summary-card">
              <span>Total Pemasukan</span>
              <h2 className="positive">
                {rupiah(totalIncome)}
              </h2>
            </div>

            <div className="summary-card">
              <span>Total Pengeluaran</span>
              <h2 className="negative">
                {rupiah(totalExpense)}
              </h2>
            </div>

            <div className="summary-card">
              <span>Selisih</span>
              <h2>{rupiah(totalProfit)}</h2>
            </div>

            <div className="summary-card">
              <span>Jumlah Sektor</span>
              <h2>{sectors.length}</h2>
            </div>
          </section>

          <div className="panel">
            <h2>{activeMenu}</h2>

            <p className="muted">
              Ringkasan sementara berdasarkan data contoh.
              Fitur laporan periode, filter sektor, dan ekspor
              akan dihubungkan ke database pada tahap berikutnya.
            </p>

            {sectors.map((sector) => (
              <div className="report-row" key={sector.id}>
                <strong>{sector.name}</strong>

                <span>
                  Pemasukan: {rupiah(sector.income)}
                </span>

                <span>
                  Pengeluaran: {rupiah(sector.expense)}
                </span>

                <b>
                  {rupiah(sector.income - sector.expense)}
                </b>
              </div>
            ))}
          </div>
        </>
      );
    }

    return null;
  }

  // ==========================================
  // TAMPILAN UTAMA
  // ==========================================

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">🌿</div>

          <div>
            <h2>RII FARM</h2>
            <span>MANAGEMENT SYSTEM</span>
          </div>
        </div>

        <div className="menu-label">MENU UTAMA</div>

        <nav>
          {menus.map((menu) => (
            <button
              key={menu.name}
              className={`nav-item ${
                activeMenu === menu.name ? "active" : ""
              }`}
              onClick={() => {
                setActiveMenu(menu.name);
                setSearch("");
              }}
            >
              <span className="nav-icon">{menu.icon}</span>
              {menu.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="farm-status">
            <span className="status-dot" />
            Sistem RII FARM
            <small>Versi pengembangan 1.0</small>
          </div>

          <div className="profile">
            <div className="avatar">RF</div>

            <div>
              <strong>Administrator</strong>
              <small>Pengelola RII FARM</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="breadcrumb">
              RII FARM / {activeMenu}
            </span>

            <h1>{activeMenu}</h1>
          </div>

          <div className="topbar-right">
            <span className="today">
              📅{" "}
              {new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>

            <div className="top-avatar">RF</div>
          </div>
        </header>

        {activeMenu === "Dashboard"
          ? renderDashboard()
          : renderOtherPage()}
      </main>

      {/* ======================================
          MODAL TAMBAH DAN EDIT SEKTOR
      ====================================== */}

      {showModal && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <form className="modal" onSubmit={saveSector}>
            <h2>
              {editingSector
                ? "Edit Sektor Usaha"
                : "Tambah Sektor Usaha"}
            </h2>

            <p>
              {editingSector
                ? "Ubah nama sektor peternakan."
                : "Masukkan nama peternakan atau sektor usaha baru."}
            </p>

            <label htmlFor="sector-name">
              Nama sektor
            </label>

            <input
              id="sector-name"
              autoFocus
              placeholder="Contoh: Peternakan Lele"
              value={sectorName}
              onChange={(event) =>
                setSectorName(event.target.value)
              }
              required
            />

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setShowModal(false);
                  setSectorName("");
                  setEditingSector(null);
                }}
              >
                Batal
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                {editingSector
                  ? "Simpan Perubahan"
                  : "Simpan Sektor"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
