import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

const LEGEND_HTML = `
<div style="
  background: rgba(10,15,30,0.9);
  border: 1px solid #1e293b;
  border-radius: 10px;
  padding: 10px 14px;
  backdrop-filter: blur(8px);
  font-family: 'Inter', sans-serif;
">
  <p style="color:#94a3b8;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">
    Severity
  </p>
  <div style="display:flex;flex-direction:column;gap:6px;">
    <div style="display:flex;align-items:center;gap:8px;">
      <div style="width:10px;height:10px;border-radius:50%;background:#ef4444;box-shadow:0 0 8px #ef4444;flex-shrink:0;"></div>
      <span style="color:#e2e8f0;font-size:12px;">Severe</span>
    </div>
    <div style="display:flex;align-items:center;gap:8px;">
      <div style="width:10px;height:10px;border-radius:50%;background:#eab308;box-shadow:0 0 8px #eab308;flex-shrink:0;"></div>
      <span style="color:#e2e8f0;font-size:12px;">Medium</span>
    </div>
    <div style="display:flex;align-items:center;gap:8px;">
      <div style="width:10px;height:10px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;flex-shrink:0;"></div>
      <span style="color:#e2e8f0;font-size:12px;">Low</span>
    </div>
  </div>
</div>
`;

export default function SeverityLegend() {
  const map = useMap();
  const controlRef = useRef(null);

  useEffect(() => {
    const Legend = L.Control.extend({
      options: { position: 'bottomleft' },
      onAdd: () => {
        const div = L.DomUtil.create('div', 'leaflet-severity-legend');
        div.innerHTML = LEGEND_HTML;
        div.style.marginBottom = '80px'; // above bottom sheet
        L.DomEvent.disableClickPropagation(div);
        return div;
      },
    });

    const legend = new Legend();
    legend.addTo(map);
    controlRef.current = legend;

    return () => {
      if (controlRef.current) map.removeControl(controlRef.current);
    };
  }, [map]);

  return null;
}
