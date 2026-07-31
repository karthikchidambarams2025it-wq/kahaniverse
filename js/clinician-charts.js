/**
 * KAHANIVERSE — CLINICIAN CHARTS
 * Pure CSS/SVG chart helpers for clinician.html
 * No external chart library needed
 */

const ClinicianCharts = (function() {

  /* ── Bar Chart (motivation/XP) ── */
  function renderBarChart(containerId, data, options = {}) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const maxVal  = Math.max(...data.map(d => d.value), 5);
    const barColor = options.color || 'var(--peacock)';
    const labelColor = options.labelColor || 'var(--ink-faint)';

    el.innerHTML = `
      <div style="display:flex;align-items:flex-end;gap:${options.gap || '8px'};height:${options.height || '160px'};width:100%;">
        ${data.map(d => `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end;">
            <div style="font-size:0.68rem;font-weight:700;color:${barColor};">${typeof d.value === 'number' ? d.value.toFixed(1) : d.value}</div>
            <div style="width:100%;border-radius:4px 4px 0 0;transition:height 1s;background:${d.value >= (options.target || 3.5) ? barColor : 'var(--kumkum)'};" style="height:${(d.value / maxVal) * 100}%;"
              title="${d.label}: ${d.value}"
              onmouseover="this.style.opacity='0.8'"
              onmouseout="this.style.opacity='1'"
            ></div>
            <div style="font-size:0.65rem;color:${labelColor};white-space:nowrap;">${d.label}</div>
          </div>
        `).join('')}
      </div>
    `;
    // Animate heights via rAF
    requestAnimationFrame(() => {
      el.querySelectorAll('[style*="border-radius"]').forEach((bar, i) => {
        bar.style.height = `${(data[i].value / maxVal) * 100}%`;
      });
    });
  }

  /* ── Donut Chart ── */
  function renderDonut(containerId, segments, size = 120) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const total = segments.reduce((a, s) => a + s.value, 0) || 1;
    let cumDeg = -90;
    const r = 40, cx = 60, cy = 60;

    const paths = segments.map(s => {
      const deg  = (s.value / total) * 360;
      const rad1 = (cumDeg * Math.PI) / 180;
      const rad2 = ((cumDeg + deg) * Math.PI) / 180;
      const x1 = cx + r * Math.cos(rad1), y1 = cy + r * Math.sin(rad1);
      const x2 = cx + r * Math.cos(rad2), y2 = cy + r * Math.sin(rad2);
      const large = deg > 180 ? 1 : 0;
      const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`;
      cumDeg += deg;
      return `<path d="${path}" fill="${s.color}" opacity="0.85"><title>${s.label}: ${s.value}</title></path>`;
    });

    el.innerHTML = `
      <div style="display:inline-flex;flex-direction:column;align-items:center;gap:0.5rem;">
        <svg width="${size}" height="${size}" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="40" fill="var(--paper,#FFF8EC)"/>
          ${paths.join('')}
          <circle cx="60" cy="60" r="24" fill="var(--paper,#FFF8EC)"/>
        </svg>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;justify-content:center;">
          ${segments.map(s => `<span style="font-size:0.68rem;display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:2px;background:${s.color};display:inline-block;"></span>${s.label}</span>`).join('')}
        </div>
      </div>
    `;
  }

  /* ── Sparkline (tiny inline trend) ── */
  function renderSparkline(containerId, values, color = 'var(--peacock)', height = 40) {
    const el = document.getElementById(containerId);
    if (!el || !values.length) return;
    const maxV = Math.max(...values);
    const minV = Math.min(...values);
    const range = maxV - minV || 1;
    const W = 120, H = height;
    const pts = values.map((v, i) => {
      const x = (i / (values.length - 1)) * W;
      const y = H - ((v - minV) / range) * (H - 8) - 4;
      return `${x},${y}`;
    }).join(' ');

    el.innerHTML = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="overflow:visible;">
        <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        ${values.map((v, i) => {
          const x = (i / (values.length - 1)) * W;
          const y = H - ((v - minV) / range) * (H - 8) - 4;
          return `<circle cx="${x}" cy="${y}" r="3" fill="${color}"><title>${v}</title></circle>`;
        }).join('')}
      </svg>
    `;
  }

  /* ── Generate printable schedule HTML ── */
  function printableSchedule(profileId, type) {
    const profile  = KV.getProfile(profileId);
    const slots    = AIEngine.generateSchedule(profileId, type);
    const typeNames = { VR:'Variable Ratio', FR:'Fixed Ratio', FI:'Fixed Interval', VI:'Variable Interval' };

    return `
      <!DOCTYPE html><html><head><title>Kahaniverse Schedule — ${profile?.name}</title>
      <style>body{font-family:'IBM Plex Sans',sans-serif;padding:2rem;color:#241C15;}h1{font-size:1.4rem;}table{width:100%;border-collapse:collapse;margin-top:1rem;}th,td{padding:0.6rem 1rem;border:1px solid #ddd;text-align:left;}th{background:#f5f4f0;font-weight:700;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.06em;}tr:nth-child(even)td{background:#fafafa;}.footer{margin-top:2rem;font-size:0.72rem;color:#888;border-top:1px solid #ddd;padding-top:1rem;}</style>
      </head><body>
      <h1>Reinforcement Schedule — ${profile?.name || 'Child'}</h1>
      <div style="font-size:0.82rem;color:#888;margin-bottom:0.5rem;">Type: ${typeNames[type] || type} &nbsp;&bull;&nbsp; Generated: ${new Date().toLocaleDateString('en-IN')}</div>
      <table>
        <thead><tr><th>#</th><th>When to Deliver Reward</th><th>Recommended Reward</th><th>Category</th><th>Delivered?</th></tr></thead>
        <tbody>${slots.map((s,i) => `<tr><td>${i+1}</td><td>${s.trigger}</td><td>${s.emoji} ${s.reward}</td><td>${s.category}</td><td style="text-align:center;">☐</td></tr>`).join('')}</tbody>
      </table>
      <div class="footer">Kahaniverse AI-Personalized Reinforcement &bull; Clinician review required &bull; Adjust based on session performance.</div>
      </body></html>
    `;
  }

  return { renderBarChart, renderDonut, renderSparkline, printableSchedule };
})();

window.ClinicianCharts = ClinicianCharts;
