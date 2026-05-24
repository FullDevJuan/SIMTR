import React, { useState } from "react";

// ==========================================
// 1. DONUT CHART (DIAGRAMA DE SECTORES)
// ==========================================
interface DonutData {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutData[];
  title: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, title }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 14;
  const center = 70; // (width / 2)

  let accumulatedPercent = 0;

  return (
    <div
      style={{
        background: "var(--color-surface)",
        padding: "1.5rem",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        height: "100%",
      }}
    >
      <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-text-main)", marginBottom: "0.25rem" }}>
        {title}
      </h3>
      
      {total === 0 ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "150px", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          Sin datos para mostrar
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
          <div style={{ position: "relative", width: "140px", height: "140px" }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              {data.map((item, index) => {
                if (item.value === 0) return null;
                const percent = item.value / total;
                const strokeDashoffset = circumference - percent * circumference;
                const rotation = (accumulatedPercent * 360) - 90;
                accumulatedPercent += percent;

                const isHovered = hoveredIndex === index;

                return (
                  <circle
                    key={item.label}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform={`rotate(${rotation} ${center} ${center})`}
                    strokeLinecap="round"
                    style={{
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "pointer",
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </svg>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <span style={{ fontSize: "1.25rem", fontWeight: "bold", color: "var(--color-text-main)" }}>
                {hoveredIndex !== null ? data[hoveredIndex].value : total}
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "capitalize" }}>
                {hoveredIndex !== null ? data[hoveredIndex].label : "Total"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1, minWidth: "120px" }}>
            {data.map((item, index) => {
              const isHovered = hoveredIndex === index;
              return (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    opacity: hoveredIndex !== null && !isHovered ? 0.6 : 1,
                    transition: "opacity 0.2s ease",
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: item.color,
                      display: "inline-block",
                    }}
                  />
                  <span style={{ fontWeight: 500, color: "var(--color-text-main)", textTransform: "capitalize" }}>
                    {item.label}:
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--color-text-muted)" }}>
                    {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. BAR CHART (COMPUESTOS / COMPARATIVOS)
// ==========================================
interface BarData {
  label: string;
  value: number;
  maxValue: number;
}

interface BarChartProps {
  data: BarData[];
  title: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      style={{
        background: "var(--color-surface)",
        padding: "1.5rem",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        height: "100%",
      }}
    >
      <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-text-main)" }}>
        {title}
      </h3>

      {data.length === 0 ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "150px", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          Sin albergues registrados
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
          {data.map((item, index) => {
            const percentage = item.maxValue > 0 ? Math.min(100, Math.round((item.value / item.maxValue) * 100)) : 0;
            const isHovered = hoveredIndex === index;
            
            // Elegir color según nivel de ocupación
            let barColor = "linear-gradient(90deg, #3b82f6, #60a5fa)"; // azul
            if (percentage >= 100) {
              barColor = "linear-gradient(90deg, #ef4444, #f87171)"; // rojo
            } else if (percentage >= 80) {
              barColor = "linear-gradient(90deg, #f59e0b, #fbbf24)"; // amarillo/naranja
            } else if (percentage > 0) {
              barColor = "linear-gradient(90deg, #10b981, #34d399)"; // verde
            }

            return (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                  padding: "0.5rem",
                  borderRadius: "var(--radius-sm)",
                  background: isHovered ? "var(--color-background)" : "transparent",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                  <span style={{ fontWeight: 600, color: "var(--color-text-main)" }}>
                    {item.label}
                  </span>
                  <span style={{ fontWeight: 500, color: "var(--color-text-muted)" }}>
                    {item.value} / {item.maxValue} ({percentage}%)
                  </span>
                </div>
                
                <div
                  style={{
                    height: "10px",
                    background: "var(--color-border)",
                    borderRadius: "5px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${percentage}%`,
                      background: barColor,
                      borderRadius: "5px",
                      transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. LINE CHART (SERIE TEMPORAL / HISTORIAL)
// ==========================================
interface LineData {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineData[];
  title: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, title }) => {
  const [hoveredDot, setHoveredDot] = useState<number | null>(null);

  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const maxVal = data.length > 0 ? Math.max(...data.map(d => d.value)) : 0;
  const yMax = maxVal > 0 ? Math.ceil(maxVal * 1.2) : 5; // Margen superior del 20%

  // Coordenadas para los puntos
  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (d.value / yMax) * (height - paddingY * 2);
    return { x, y, label: d.label, value: d.value };
  });

  // Construir string de línea
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Construir string de área para sombra degradada
  const areaPath = data.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : "";

  return (
    <div
      style={{
        background: "var(--color-surface)",
        padding: "1.5rem",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        height: "100%",
      }}
    >
      <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-text-main)" }}>
        {title}
      </h3>

      {data.length === 0 ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "150px", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          Sin historial de ayuda registrado
        </div>
      ) : (
        <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
          <svg
            width="100%"
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1f3965" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#1f3965" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Líneas horizontales de fondo */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = paddingY + ratio * (height - paddingY * 2);
              const gridValue = Math.round(yMax * (1 - ratio));
              return (
                <g key={ratio}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="var(--color-border)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 4}
                    fill="var(--color-text-muted)"
                    fontSize="10"
                    textAnchor="end"
                  >
                    {gridValue}
                  </text>
                </g>
              );
            })}

            {/* Dibujar Área de Gráfico */}
            {areaPath && (
              <path d={areaPath} fill="url(#areaGradient)" />
            )}

            {/* Dibujar Línea de Gráfico */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Dibujar Puntos de Datos */}
            {points.map((p, i) => {
              const isHovered = hoveredDot === i;
              return (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 6 : 4}
                    fill="var(--color-surface)"
                    stroke="var(--color-primary)"
                    strokeWidth={isHovered ? 3 : 2}
                    style={{
                      transition: "all 0.15s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={() => setHoveredDot(i)}
                    onMouseLeave={() => setHoveredDot(null)}
                  />
                  
                  {/* Etiquetas del Eje X */}
                  <text
                    x={p.x}
                    y={height - 6}
                    fill="var(--color-text-muted)"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {p.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Tooltip HTML flotante controlado por estado */}
          {hoveredDot !== null && (
            <div
              style={{
                position: "absolute",
                top: `${points[hoveredDot].y - 35}px`,
                left: `${(points[hoveredDot].x / width) * 100}%`,
                transform: "translateX(-50%)",
                background: "var(--color-text-main)",
                color: "var(--color-surface)",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "0.75rem",
                pointerEvents: "none",
                boxShadow: "var(--shadow-md)",
                whiteSpace: "nowrap",
                zIndex: 10,
              }}
            >
              <strong>{points[hoveredDot].label}</strong>: {points[hoveredDot].value} entregas
            </div>
          )}
        </div>
      )}
    </div>
  );
};
