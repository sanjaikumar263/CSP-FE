import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import AdminSidebar from '../components/AdminSidebar';
import './AdminDashboardPage.css';

Chart.register(...registerables);

const STATS = [
  { k: 'Total Revenue', v: 'MYR 84,320', trend: 'up', pct: '↑ 12.4%', stroke: '#3E6B4E',
    spark: 'M0 30 L20 26 L40 28 L60 18 L80 22 L100 12 L120 16 L140 8 L160 12 L180 4 L200 8' },
  { k: 'Orders', v: '318', trend: 'up', pct: '↑ 6.1%', stroke: '#0E3B3E',
    spark: 'M0 22 L20 24 L40 18 L60 20 L80 14 L100 18 L120 10 L140 14 L160 6 L180 10 L200 6' },
  { k: 'New Customers', v: '96', trend: 'down', pct: '↓ 2.3%', stroke: '#7C2436',
    spark: 'M0 10 L20 14 L40 12 L60 18 L80 16 L100 22 L120 18 L140 24 L160 20 L180 26 L200 24' },
  { k: 'Avg. Order Value', v: 'MYR 265', trend: 'up', pct: '↑ 3.8%', stroke: '#AC8A32',
    spark: 'M0 24 L20 20 L40 22 L60 14 L80 18 L100 10 L120 14 L140 8 L160 12 L180 6 L200 10' },
];

const CATEGORIES_DATA = [
  { name: 'Kanchipuram Silk', amt: 'MYR 28,660', width: '34%', color: '#0E3B3E' },
  { name: 'Banarasi Silk', amt: 'MYR 18,550', width: '22%', color: '#AC8A32' },
  { name: 'Tussar Silk', amt: 'MYR 15,180', width: '18%', color: '#3f6b4a' },
  { name: 'Lehengas', amt: 'MYR 11,800', width: '14%', color: '#8a2a3e' },
  { name: 'Ethnic & Fancy', amt: 'MYR 10,130', width: '12%', color: '#c98a3a' },
];

const ORDERS = [
  { id: '#CSP-3021', initials: 'NK', name: 'Nisha Kumar', email: 'nisha.k@mail.com', product: 'Pure Blue & Green Silk with Mixed Jari', amount: 'MYR 650.00', status: 'processing', date: '16 Jul 2026' },
  { id: '#CSP-3020', initials: 'AR', name: 'Anitha Rajan', email: 'anitha.r@mail.com', product: 'Gold Jari Pure Kanchipuram Handloom Saree', amount: 'MYR 3,000.00', status: 'shipped', date: '15 Jul 2026' },
  { id: '#CSP-3019', initials: 'PV', name: 'Priya Venkat', email: 'priya.v@mail.com', product: 'Purple Colour Sequence Bridal Lehenga', amount: 'MYR 380.00', status: 'delivered', date: '14 Jul 2026' },
  { id: '#CSP-3018', initials: 'SD', name: 'Suresh Das', email: 'suresh.d@mail.com', product: 'Red & Green Cotton Blended Silk', amount: 'MYR 380.00', status: 'cancelled', date: '13 Jul 2026' },
  { id: '#CSP-3017', initials: 'KM', name: 'Kavya Menon', email: 'kavya.m@mail.com', product: 'Pure Green Tussar Silk', amount: 'MYR 370.00', status: 'delivered', date: '12 Jul 2026' },
];

const TOP_PRODUCTS = [
  { sw: 'sw2', name: 'Gold Jari Pure Kanchipuram Handloom Saree', cat: 'Wedding Collection', sold: '142 sold', rev: 'MYR 42,600' },
  { sw: 'sw1', name: 'Pure Blue & Green Silk with Mixed Jari', cat: 'Soft Silk', sold: '98 sold', rev: 'MYR 21,900' },
  { sw: 'sw4', name: 'Purple Colour Sequence Bridal Lehenga', cat: 'Lehengas', sold: '76 sold', rev: 'MYR 14,440' },
  { sw: 'sw3', name: 'Pure Green Tussar Silk', cat: 'Tussar Silk', sold: '64 sold', rev: 'MYR 8,320' },
  { sw: 'sw5', name: 'Mixture of Orange & Green Fancy Silk', cat: 'Fancy Saree', sold: '51 sold', rev: 'MYR 3,825' },
];

const LOW_STOCK = [
  { name: 'Cream Navy Paithani Design', sku: 'SKU CSP1108 · Kanchi Cotton', pct: 8 },
  { name: 'Purple & Green Cotton Blended', sku: 'SKU CSP1122 · Ethnic Sarees', pct: 14 },
  { name: 'Grey & Maroon Golden Jari', sku: 'SKU CSP1130 · Paruthi Pattu', pct: 5 },
  { name: 'Pastel Green Designer Blouse', sku: 'SKU CSP1144 · Blouse Collection', pct: 11 },
];

export default function AdminDashboardPage() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 230);
    gradient.addColorStop(0, 'rgba(14,59,62,0.28)');
    gradient.addColorStop(1, 'rgba(14,59,62,0.02)');

    if (chartInstance.current) chartInstance.current.destroy();
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul'],
        datasets: [{
          data: [42000,45500,48200,61000,72500,58000,54000,60500,63000,68500,74000,84320],
          borderColor: '#0E3B3E',
          backgroundColor: gradient,
          borderWidth: 2.4,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#AC8A32',
          pointHoverBorderColor: '#0E3B3E',
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#6B6255', font: { family: 'Manrope', size: 11 } } },
          y: { grid: { color: 'rgba(36,30,25,.07)' }, ticks: { color: '#6B6255', font: { family: 'Manrope', size: 11 }, callback: v => 'MYR ' + (v / 1000) + 'k' } },
        },
      },
    });
    return () => chartInstance.current?.destroy();
  }, []);

  return (
    <div className="shell">
      <AdminSidebar />
      <main>
        <div className="topbar">
          <div>
            <h1>Dashboard</h1>
            <div className="sub">Welcome back, Radhika — here's how the store is performing.</div>
          </div>
          <div className="top-actions">
            <div className="search-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>
              </svg>
              <input type="text" placeholder="Search orders, products…" />
            </div>
            <button className="icon-btn">
              <span className="dot"></span>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.6">
                <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9Z"/>
                <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
              </svg>
            </button>
            <div className="range-select">
              Last 30 days
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="stat-grid">
          {STATS.map(s => (
            <div key={s.k} className="stat-card">
              <div className="k">{s.k}</div>
              <div className="v">{s.v}</div>
              <span className={`trend ${s.trend}`}>{s.pct}</span>
              <div className="spark">
                <svg viewBox="0 0 200 40" preserveAspectRatio="none">
                  <path d={s.spark} fill="none" stroke={s.stroke} strokeWidth="2"/>
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Sales Chart + Category Breakdown */}
        <div className="row split">
          <div className="panel">
            <div className="panel-head">
              <div><h3>Sales Overview</h3><div className="sub">Revenue across the last 12 months</div></div>
              <div className="tabs">
                <button className="active">Revenue</button>
                <button>Orders</button>
              </div>
            </div>
            <canvas ref={chartRef} height={230}></canvas>
          </div>
          <div className="panel">
            <div className="panel-head">
              <div><h3>Sales by Category</h3><div className="sub">Share of revenue, this month</div></div>
            </div>
            <div className="cat-list">
              {CATEGORIES_DATA.map(c => (
                <div key={c.name} className="cat-row-wrap">
                  <div className="cat-name-row">
                    <span className="name">{c.name}</span>
                    <span className="amt">{c.amt}</span>
                  </div>
                  <div className="cat-bar-track">
                    <div className="cat-bar-fill" style={{ width: c.width, background: c.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="panel" style={{ marginBottom: '20px' }}>
          <div className="panel-head">
            <div><h3>Recent Orders</h3><div className="sub">Latest transactions across all stores</div></div>
            <a className="panel-link" href="#">View all orders →</a>
          </div>
          <table>
            <thead>
              <tr><th>Order</th><th>Customer</th><th>Product</th><th>Amount</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {ORDERS.map(o => (
                <tr key={o.id}>
                  <td className="order-id">{o.id}</td>
                  <td>
                    <div className="cust">
                      <div className="av">{o.initials}</div>
                      <div><div className="nm">{o.name}</div><div className="em">{o.email}</div></div>
                    </div>
                  </td>
                  <td>{o.product}</td>
                  <td>{o.amount}</td>
                  <td><span className={`pill ${o.status}`}>{o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span></td>
                  <td>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Products + Low Stock */}
        <div className="row split2">
          <div className="panel">
            <div className="panel-head">
              <div><h3>Top Selling Products</h3><div className="sub">By units sold, this month</div></div>
              <a className="panel-link" href="#">View catalog →</a>
            </div>
            <div className="plist">
              {TOP_PRODUCTS.map((p, i) => (
                <div key={i} className="prow">
                  <div className={`swatch ${p.sw}`}></div>
                  <div className="info"><div className="n">{p.name}</div><div className="c">{p.cat}</div></div>
                  <div className="num"><div className="a">{p.sold}</div><div className="b">{p.rev}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <div className="panel-head">
              <div><h3>Low Stock Alerts</h3><div className="sub">Restock before the festive season</div></div>
            </div>
            <div className="plist">
              {LOW_STOCK.map((s, i) => (
                <div key={i} className="prow">
                  <div className="info">
                    <div className="n">{s.name}</div>
                    <div className="c">{s.sku}</div>
                    <div className="stock-bar"><span style={{ width: `${s.pct}%` }}></span></div>
                  </div>
                  <button className="reorder">Reorder</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-note">Chennai Silk Palace Admin Console · Data shown is illustrative</div>
      </main>
    </div>
  );
}
