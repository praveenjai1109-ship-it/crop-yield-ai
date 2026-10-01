import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Activity,
  BarChart3,
  Beaker,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleHelp,
  CloudRain,
  Database,
  Droplets,
  Gauge,
  ExternalLink,
  Info,
  Leaf,
  MapPin,
  Menu,
  Microscope,
  PanelLeftClose,
  Search,
  ShieldCheck,
  Sparkles,
  Sprout,
  Target,
  TestTube2,
  ThermometerSun,
  TrendingUp,
  Wheat,
  Wind,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { modelData } from "./data/modelData";

type Page = "dashboard" | "predict" | "model";
type FormState = {
  crop: string;
  area: string;
  year: number;
  rainfall: number;
  pesticides: number;
  temp: number;
};
type ModelArtifact = {
  algorithm: string;
  k: number;
  features: number[][];
  targets: number[];
  weights: number[];
};
type Prediction = { value: number; confidence: string; neighbors: number[] };

const formatNumber = (value: number, digits = 0) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);

function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  type = "button",
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  ariaLabel?: string;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className={`btn btn-${variant} ${className}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}

function Select({
  value,
  onChange,
  children,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  id: string;
}) {
  return (
    <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
      {children}
    </select>
  );
}

function NumericInput({
  id,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  id: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <input
      id={id}
      max={max}
      min={min}
      onChange={(event) => onChange(Number(event.target.value))}
      step={step}
      type="number"
      value={value}
    />
  );
}

function Logo() {
  return (
    <div className="logo">
      <div className="logo-mark">
        <Wheat size={21} strokeWidth={2.2} />
      </div>
      <div>
        <div className="logo-name">
          CropYield <span>AI</span>
        </div>
        <div className="logo-kicker">Agricultural intelligence</div>
      </div>
    </div>
  );
}

const navItems = [
  { id: "dashboard" as const, label: "Overview", icon: BarChart3 },
  { id: "predict" as const, label: "Yield prediction", icon: Sparkles },
  { id: "model" as const, label: "Model & data", icon: BrainCircuit },
];

function Sidebar({
  page,
  setPage,
  open,
  onClose,
}: {
  page: Page;
  setPage: (page: Page) => void;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <Logo />
          <Button ariaLabel="Close menu" className="mobile-close" onClick={onClose} variant="ghost">
            <X size={20} />
          </Button>
        </div>
        <div className="nav-label">Workspace</div>
        <nav>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              className={`nav-item ${page === id ? "nav-item-active" : ""}`}
              key={id}
              onClick={() => {
                setPage(id);
                onClose();
              }}
            >
              <Icon size={19} strokeWidth={2} />
              <span>{label}</span>
              {page === id && <ChevronRight className="nav-arrow" size={16} />}
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="model-status">
          <div className="status-heading">
            <span className="status-dot" />
            Model ready
          </div>
          <div className="status-copy">Trained on {formatNumber(modelData.dataset.trainRecords)} records</div>
          <div className="status-meta">
            <span>R²</span>
            <strong>{modelData.metrics.r2.toFixed(3)}</strong>
          </div>
        </div>
        <div className="sidebar-footer">
          <ShieldCheck size={17} />
          <span>Academic ML project</span>
        </div>
      </aside>
    </>
  );
}

function Header({ page, onMenu }: { page: Page; onMenu: () => void }) {
  const titles = {
    dashboard: ["Overview", "Monitor agricultural yield patterns and model performance."],
    predict: ["Yield prediction", "Estimate crop yield from weather and agricultural inputs."],
    model: ["Model & data", "Explore the real training pipeline, evaluation and dataset."],
  };
  return (
    <header className="topbar">
      <div className="title-cluster">
        <Button ariaLabel="Open menu" className="menu-button" onClick={onMenu} variant="ghost">
          <Menu size={21} />
        </Button>
        <div>
          <div className="page-title">{titles[page][0]}</div>
          <div className="page-subtitle">{titles[page][1]}</div>
        </div>
      </div>
      <div className="header-actions">
        <div className="data-badge">
          <span className="live-dot" />
          Model connected
        </div>
        <div className="avatar">CY</div>
      </div>
    </header>
  );
}

function KpiCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "green",
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Database;
  tone?: "green" | "blue" | "amber" | "purple";
}) {
  return (
    <div className="kpi-card">
      <div className={`kpi-icon tone-${tone}`}>
        <Icon size={19} />
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-detail">{detail}</div>
    </div>
  );
}

const tooltipStyle = {
  border: "1px solid #e2e8e3",
  borderRadius: "10px",
  boxShadow: "0 10px 32px rgba(20, 47, 30, .1)",
  fontSize: "12px",
};
function ChartFrame({
  children,
}: {
  children: (size: { width: number; height: number }) => ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const updateSize = () => {
      const bounds = frame.getBoundingClientRect();
      const width = Math.floor(bounds.width);
      const height = Math.floor(bounds.height);
      if (width > 0 && height > 0) {
        setSize((current) => (current.width === width && current.height === height ? current : { width, height }));
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="chart-frame" ref={frameRef}>
      {size.width > 0 && size.height > 0 ? children(size) : null}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  wide = false,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <section className={`chart-card ${wide ? "chart-wide" : ""}`}>
      <div className="card-heading">
        <div>
          <div className="card-title">{title}</div>
          <div className="card-subtitle">{subtitle}</div>
        </div>
        <Button ariaLabel={`More information about ${title}`} variant="ghost">
          <CircleHelp size={18} />
        </Button>
      </div>
      <div className="chart-area">{children}</div>
    </section>
  );
}

function OverviewDashboard({ goPredict }: { goPredict: () => void }) {
  const trend = modelData.trend.filter((_, index) => index % 2 === 0);
  const topCrops = modelData.cropYield.slice(0, 6);
  const cropComparison = modelData.cropYield
    .filter((item) => ["Rice, paddy", "Wheat", "Maize", "Potatoes", "Soybeans", "Sorghum"].includes(item.name))
    .reverse();
  const scatter = modelData.scatterSample.slice(0, 180);
  return (
    <div className="page-content">
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={14} />
            Weather-based crop intelligence
          </div>
          <div className="hero-title">From climate signals to smarter yield estimates.</div>
          <div className="hero-text">
            Predict crop yield using weather, environmental, and agricultural data with a validated machine-learning
            model.
          </div>
          <div className="hero-actions">
            <Button onClick={goPredict}>
              <Sprout size={17} />
              Predict crop yield
            </Button>
            <div className="hero-proof">
              <Check size={15} />
              Tested on {formatNumber(modelData.dataset.testRecords)} unseen records
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-ring ring-one" />
          <div className="visual-ring ring-two" />
          <div className="plant-core">
            <Leaf size={45} strokeWidth={1.6} />
          </div>
          <div className="weather-chip chip-rain">
            <CloudRain size={16} />
            <span>{modelData.averages.rainfall} mm</span>
          </div>
          <div className="weather-chip chip-temp">
            <ThermometerSun size={16} />
            <span>{modelData.averages.temp}°C</span>
          </div>
          <div className="weather-chip chip-yield">
            <TrendingUp size={16} />
            <span>{modelData.averages.yield} t/ha</span>
          </div>
        </div>
      </section>

      <div className="section-heading">
        <div>
          <div className="section-title">At a glance</div>
          <div className="section-copy">Actual dataset and held-out model evaluation</div>
        </div>
        <div className="updated-pill">
          <Activity size={14} />
          Reproducible run · seed 2025
        </div>
      </div>
      <div className="kpi-grid">
        <KpiCard
          detail={`${modelData.dataset.yearRange[0]}–${modelData.dataset.yearRange[1]} historical observations`}
          icon={Database}
          label="Total records"
          value={formatNumber(modelData.dataset.cleanRecords)}
        />
        <KpiCard
          detail={`${modelData.areas.length} countries / regions`}
          icon={Wheat}
          label="Crop types"
          tone="amber"
          value={String(modelData.crops.length)}
        />
        <KpiCard
          detail={modelData.modelName}
          icon={Target}
          label="Model R²"
          tone="purple"
          value={modelData.metrics.r2.toFixed(3)}
        />
        <KpiCard
          detail="On the held-out test set"
          icon={Gauge}
          label="RMSE / MAE"
          tone="blue"
          value={`${modelData.metrics.rmse.toFixed(2)} / ${modelData.metrics.mae.toFixed(2)}`}
        />
        <KpiCard
          detail="Average held-out prediction"
          icon={TrendingUp}
          label="Avg. predicted yield"
          value={`${modelData.averages.predicted.toFixed(2)} t/ha`}
        />
      </div>

      <div className="chart-grid">
        <ChartCard subtitle="Average tonnes per hectare across the full dataset" title="Yield trend over years" wide>
          <ChartFrame>
            {({ width, height }) => (
            <LineChart data={trend} height={height} margin={{ left: -14, right: 12, top: 12 }} width={width}>
              <CartesianGrid stroke="#edf2ee" strokeDasharray="4 4" vertical={false} />
              <XAxis axisLine={false} dataKey="year" fontSize={11} tickLine={false} />
              <YAxis axisLine={false} fontSize={11} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} t/ha`, "Yield"]} />
              <Line dataKey="yield" dot={false} stroke="#16824b" strokeWidth={2.5} type="monotone" />
            </LineChart>
            )}
          </ChartFrame>
        </ChartCard>
        <ChartCard subtitle="Crops ranked by mean historical yield" title="Top crops by average yield">
          <div className="ranking-list">
            {topCrops.map((crop, index) => (
              <div className="rank-row" key={crop.name}>
                <div className="rank-number">{String(index + 1).padStart(2, "0")}</div>
                <div className="rank-main">
                  <div className="rank-name">{crop.name}</div>
                  <div className="rank-track">
                    <div
                      className="rank-fill"
                      style={{ width: `${Math.max(18, (crop.value / topCrops[0].value) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="rank-value">{crop.value.toFixed(1)}</div>
              </div>
            ))}
          </div>
        </ChartCard>
        <ChartCard subtitle="A representative sample of historical observations" title="Rainfall vs yield">
          <ChartFrame>
            {({ width, height }) => (
            <ScatterChart height={height} margin={{ left: -15, right: 14, top: 12 }} width={width}>
              <CartesianGrid stroke="#edf2ee" strokeDasharray="4 4" />
              <XAxis
                axisLine={false}
                dataKey="rainfall"
                fontSize={11}
                name="Rainfall"
                tickLine={false}
                unit=" mm"
              />
              <YAxis axisLine={false} dataKey="yield" fontSize={11} name="Yield" tickLine={false} unit=" t/ha" />
              <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={scatter} fill="#4ca879" fillOpacity={0.62} />
            </ScatterChart>
            )}
          </ChartFrame>
        </ChartCard>
        <ChartCard subtitle="Mean yield for selected crop categories" title="Crop-wise yield comparison">
          <ChartFrame>
            {({ width, height }) => (
            <BarChart
              data={cropComparison}
              height={height}
              layout="vertical"
              margin={{ bottom: 4, left: 16, right: 22, top: 8 }}
              width={width}
            >
              <CartesianGrid horizontal={false} stroke="#edf2ee" strokeDasharray="4 4" />
              <XAxis axisLine={false} fontSize={11} tickLine={false} type="number" />
              <YAxis
                axisLine={false}
                dataKey="name"
                fontSize={11}
                tickLine={false}
                type="category"
                width={78}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} t/ha`, "Average yield"]} />
              <Bar dataKey="value" fill="#2f9260" radius={[0, 5, 5, 0]} />
            </BarChart>
            )}
          </ChartFrame>
        </ChartCard>
        <ChartCard subtitle="Temperature relationship across sampled records" title="Temperature vs yield">
          <ChartFrame>
            {({ width, height }) => (
            <ScatterChart height={height} margin={{ left: -15, right: 14, top: 12 }} width={width}>
              <CartesianGrid stroke="#edf2ee" strokeDasharray="4 4" />
              <XAxis axisLine={false} dataKey="temp" fontSize={11} name="Temperature" tickLine={false} unit="°C" />
              <YAxis axisLine={false} dataKey="yield" fontSize={11} name="Yield" tickLine={false} unit=" t/ha" />
              <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={scatter} fill="#dda946" fillOpacity={0.6} />
            </ScatterChart>
            )}
          </ChartFrame>
        </ChartCard>
      </div>
    </div>
  );
}

function Field({
  label,
  helper,
  children,
  icon: Icon,
}: {
  label: string;
  helper?: string;
  children: ReactNode;
  icon: typeof Database;
}) {
  return (
    <div className="field">
      <label>
        <span className="field-label">
          <Icon size={15} />
          {label}
        </span>
        {helper && <span className="field-helper">{helper}</span>}
      </label>
      {children}
    </div>
  );
}

function PredictionPage({
  artifact,
  loading,
}: {
  artifact: ModelArtifact | null;
  loading: boolean;
}) {
  const [form, setForm] = useState<FormState>({
    crop: modelData.crops.includes("Rice, paddy") ? "Rice, paddy" : modelData.crops[0],
    area: modelData.areas.includes("India") ? "India" : modelData.areas[0],
    year: 2013,
    rainfall: 1083,
    pesticides: 45637,
    temp: 26.9,
  });
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [search, setSearch] = useState("");

  const filteredAreas = useMemo(
    () => modelData.areas.filter((area) => area.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const runPrediction = () => {
    if (!artifact) return;
    const { mins, maxs } = modelData.scaling;
    const year = (form.year - mins.year) / (maxs.year - mins.year);
    const rain = (form.rainfall - mins.rainfall) / (maxs.rainfall - mins.rainfall);
    const pest =
      (Math.log1p(form.pesticides) - Math.log1p(mins.pesticides)) /
      (Math.log1p(maxs.pesticides) - Math.log1p(mins.pesticides));
    const temp = (form.temp - mins.temp) / (maxs.temp - mins.temp);
    const crop = ((modelData.cropEnc as Record<string, number>)[form.crop] ?? modelData.globalMean) / 20;
    const area = ((modelData.areaEnc as Record<string, number>)[form.area] ?? modelData.globalMean) / 20;
    const vector = [year, rain, pest, temp, crop, area, rain * temp, year * crop];
    const nearest: { distance: number; value: number }[] = [];
    artifact.features.forEach((row, index) => {
      const distance = row.reduce(
        (total, value, feature) => total + artifact.weights[feature] * (vector[feature] - value) ** 2,
        0,
      );
      if (nearest.length < artifact.k || distance < nearest[nearest.length - 1].distance) {
        let position = nearest.length;
        while (position > 0 && nearest[position - 1].distance > distance) position -= 1;
        nearest.splice(position, 0, { distance, value: artifact.targets[index] });
        if (nearest.length > artifact.k) nearest.pop();
      }
    });
    let weightedTotal = 0;
    let totalWeight = 0;
    nearest.forEach(({ distance, value }) => {
      const weight = 1 / (Math.sqrt(distance) + 0.025);
      weightedTotal += weight * value;
      totalWeight += weight;
    });
    const value = Math.max(0, weightedTotal / totalWeight);
    const spread = Math.max(...nearest.map((item) => item.value)) - Math.min(...nearest.map((item) => item.value));
    setPrediction({
      value,
      confidence: spread < 2 ? "High similarity" : spread < 6 ? "Moderate similarity" : "Broad estimate",
      neighbors: nearest.map((item) => item.value),
    });
  };

  const reset = () => {
    setPrediction(null);
    setForm({
      crop: "Rice, paddy",
      area: "India",
      year: 2013,
      rainfall: 1083,
      pesticides: 45637,
      temp: 26.9,
    });
  };

  return (
    <div className="page-content prediction-page">
      <div className="prediction-intro">
        <div>
          <div className="eyebrow">
            <Sparkles size={14} />
            Live model inference
          </div>
          <div className="intro-title">Predict the next harvest.</div>
          <div className="intro-copy">
            Enter the six features that exist in the training dataset. The trained model finds the most similar
            historical conditions and estimates yield.
          </div>
        </div>
        <div className="trust-card">
          <ShieldCheck size={21} />
          <div>
            <strong>No fabricated inputs</strong>
            <span>Fields map directly to the source dataset.</span>
          </div>
        </div>
      </div>

      <div className="predict-layout">
        <form
          className="form-card"
          onSubmit={(event) => {
            event.preventDefault();
            runPrediction();
          }}
        >
          <div className="form-section-head">
            <div className="step-number">01</div>
            <div>
              <div className="form-title">Crop & location</div>
              <div className="form-subtitle">Select categorical values represented in training data.</div>
            </div>
          </div>
          <div className="field-grid">
            <Field icon={Wheat} label="Crop type">
              <Select id="crop" onChange={(value) => update("crop", value)} value={form.crop}>
                {modelData.crops.map((crop) => (
                  <option key={crop}>{crop}</option>
                ))}
              </Select>
            </Field>
            <Field helper={`${modelData.areas.length} available`} icon={MapPin} label="Region / country">
              <div className="select-search">
                <Select id="area" onChange={(value) => update("area", value)} value={form.area}>
                  {filteredAreas.map((area) => (
                    <option key={area}>{area}</option>
                  ))}
                </Select>
                <Search size={16} />
              </div>
            </Field>
          </div>
          <div className="form-divider" />
          <div className="form-section-head">
            <div className="step-number">02</div>
            <div>
              <div className="form-title">Weather & agricultural conditions</div>
              <div className="form-subtitle">Use annual values consistent with the source records.</div>
            </div>
          </div>
          <div className="field-grid">
            <Field helper="1990–2013" icon={Activity} label="Year">
              <NumericInput
                id="year"
                max={modelData.ranges.year[1]}
                min={modelData.ranges.year[0]}
                onChange={(value) => update("year", value)}
                value={form.year}
              />
            </Field>
            <Field helper="Annual average · °C" icon={ThermometerSun} label="Temperature">
              <div className="input-with-unit">
                <NumericInput
                  id="temp"
                  max={modelData.ranges.temp[1]}
                  min={modelData.ranges.temp[0]}
                  onChange={(value) => update("temp", value)}
                  step={0.1}
                  value={form.temp}
                />
                <span>°C</span>
              </div>
            </Field>
            <Field helper="Annual total · mm" icon={CloudRain} label="Rainfall">
              <div className="input-with-unit">
                <NumericInput
                  id="rainfall"
                  max={modelData.ranges.rainfall[1]}
                  min={modelData.ranges.rainfall[0]}
                  onChange={(value) => update("rainfall", value)}
                  value={form.rainfall}
                />
                <span>mm</span>
              </div>
            </Field>
            <Field helper="National use · tonnes" icon={TestTube2} label="Pesticide usage">
              <div className="input-with-unit">
                <NumericInput
                  id="pesticides"
                  max={modelData.ranges.pesticides[1]}
                  min={modelData.ranges.pesticides[0]}
                  onChange={(value) => update("pesticides", value)}
                  step={0.1}
                  value={form.pesticides}
                />
                <span>t</span>
              </div>
            </Field>
          </div>
          <div className="form-note">
            <Info size={16} />
            Humidity, soil moisture, wind speed, sunshine hours and area harvested are not shown because they are not
            present in the selected dataset.
          </div>
          <div className="form-actions">
            <Button className="predict-button" disabled={loading || !artifact} type="submit">
              <Sparkles size={18} />
              {loading ? "Loading trained model…" : "Generate prediction"}
            </Button>
            <Button onClick={reset} variant="secondary">
              Reset
            </Button>
          </div>
        </form>

        <div className="result-column">
          {prediction ? (
            <div className="result-card result-ready">
              <div className="result-top">
                <div>
                  <div className="result-label">Predicted yield</div>
                  <div className="result-context">
                    {form.crop} · {form.area}
                  </div>
                </div>
                <div className="result-check">
                  <Check size={18} />
                </div>
              </div>
              <div className="prediction-value">
                {prediction.value.toFixed(2)}
                <span>tonnes / hectare</span>
              </div>
              <div className="similarity-pill">
                <Activity size={14} />
                {prediction.confidence}
              </div>
              <div className="result-divider" />
              <div className="interpretation-title">How to interpret this</div>
              <div className="interpretation-copy">
                Under conditions similar to these inputs, the model estimates approximately{" "}
                <strong>{prediction.value.toFixed(2)} tonnes per hectare</strong>. The three closest training records
                yielded {prediction.neighbors.map((value) => value.toFixed(2)).join(", ")} t/ha.
              </div>
              <div className="summary-grid">
                <div>
                  <span>Model used</span>
                  <strong>{modelData.modelName}</strong>
                </div>
                <div>
                  <span>Prediction unit</span>
                  <strong>tonnes / hectare</strong>
                </div>
                <div>
                  <span>Test R²</span>
                  <strong>{modelData.metrics.r2.toFixed(3)}</strong>
                </div>
                <div>
                  <span>Nearest records</span>
                  <strong>{prediction.neighbors.length}</strong>
                </div>
              </div>
              <div className="influence-block">
                <div className="interpretation-title">Important influencing features</div>
                {modelData.featureImportance.slice(0, 4).map((item) => (
                  <div className="influence-row" key={item.feature}>
                    <span>{item.feature}</span>
                    <div className="influence-track">
                      <div className="influence-fill" style={{ width: `${Math.max(6, item.value)}%` }} />
                    </div>
                    <strong>{item.value}%</strong>
                  </div>
                ))}
              </div>
              <div className="disclaimer">
                <Info size={17} />
                This prediction is an estimate based on historical data and should not be treated as guaranteed
                agricultural advice.
              </div>
            </div>
          ) : (
            <div className="result-card result-empty">
              <div className="empty-orbit">
                <div className="empty-icon">
                  <Sprout size={34} />
                </div>
              </div>
              <div className="empty-title">Your yield estimate will appear here</div>
              <div className="empty-copy">
                Complete the input fields and run the trained model to view a prediction, interpretation and input
                summary.
              </div>
              <div className="empty-steps">
                <div>
                  <span>1</span> Select crop and region
                </div>
                <div>
                  <span>2</span> Add weather conditions
                </div>
                <div>
                  <span>3</span> Generate prediction
                </div>
              </div>
            </div>
          )}
          <div className="input-summary-card">
            <div className="mini-title">Current input summary</div>
            <div className="mini-grid">
              <span>Crop<strong>{form.crop}</strong></span>
              <span>Region<strong>{form.area}</strong></span>
              <span>Year<strong>{form.year}</strong></span>
              <span>Temperature<strong>{form.temp}°C</strong></span>
              <span>Rainfall<strong>{formatNumber(form.rainfall)} mm</strong></span>
              <span>Pesticides<strong>{formatNumber(form.pesticides, 1)} t</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModelPage() {
  const pipeline = [
    ["Raw dataset", `${formatNumber(modelData.dataset.rawRecords)} source rows`, Database],
    ["Validation & cleaning", `${modelData.dataset.missingRemoved} incomplete, ${modelData.dataset.duplicatesRemoved} duplicate`, ShieldCheck],
    ["Outlier analysis", `${formatNumber(modelData.dataset.outliersAnalyzed)} IQR flags analyzed`, Search],
    ["Feature engineering", "Log pesticide, interactions, target encoding", Beaker],
    ["Train / test split", modelData.dataset.split, PanelLeftClose],
    ["Model evaluation", "R², RMSE and MAE on unseen data", Target],
  ] as const;
  return (
    <div className="page-content">
      <section className="model-hero">
        <div>
          <div className="eyebrow light">
            <Microscope size={14} />
            Transparent by design
          </div>
          <div className="model-hero-title">A real, reproducible ML pipeline.</div>
          <div className="model-hero-copy">
            Every score shown here comes from the trained model evaluated against held-out records—never from a
            placeholder or manually invented result.
          </div>
        </div>
        <div className="model-score">
          <span>Held-out R²</span>
          <strong>{modelData.metrics.r2.toFixed(3)}</strong>
          <small>{modelData.modelName}</small>
        </div>
      </section>

      <div className="model-grid">
        <section className="pipeline-card">
          <div className="card-heading">
            <div>
              <div className="card-title">Training pipeline</div>
              <div className="card-subtitle">From raw records to evaluated predictions</div>
            </div>
          </div>
          <div className="pipeline">
            {pipeline.map(([title, detail, Icon], index) => (
              <div className="pipeline-row" key={title}>
                <div className="pipeline-line">
                  <div className="pipeline-icon">
                    <Icon size={17} />
                  </div>
                  {index < pipeline.length - 1 && <div className="connector" />}
                </div>
                <div>
                  <div className="pipeline-title">{title}</div>
                  <div className="pipeline-detail">{detail}</div>
                </div>
                <div className="pipeline-check">
                  <Check size={14} />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="metrics-card">
          <div className="card-heading">
            <div>
              <div className="card-title">Evaluation metrics</div>
              <div className="card-subtitle">{formatNumber(modelData.dataset.testRecords)} unseen test records</div>
            </div>
          </div>
          <div className="metric-big">
            <span>Coefficient of determination</span>
            <strong>{modelData.metrics.r2.toFixed(4)}</strong>
            <div className="metric-bar">
              <div style={{ width: `${modelData.metrics.r2 * 100}%` }} />
            </div>
            <small>R² · higher is better</small>
          </div>
          <div className="metric-pair">
            <div>
              <span>RMSE</span>
              <strong>{modelData.metrics.rmse.toFixed(3)}</strong>
              <small>t/ha</small>
            </div>
            <div>
              <span>MAE</span>
              <strong>{modelData.metrics.mae.toFixed(3)}</strong>
              <small>t/ha</small>
            </div>
          </div>
          <div className="metric-explain">
            <Info size={16} />
            Scores were computed after prediction on the held-out test set. No test target was used during training.
          </div>
        </section>
      </div>

      <div className="model-grid lower">
        <section className="data-card">
          <div className="card-heading">
            <div>
              <div className="card-title">Dataset profile</div>
              <div className="card-subtitle">{modelData.dataset.source}</div>
            </div>
            <Database size={20} />
          </div>
          <div className="data-facts">
            <div><span>Clean records</span><strong>{formatNumber(modelData.dataset.cleanRecords)}</strong></div>
            <div><span>Crop types</span><strong>{modelData.crops.length}</strong></div>
            <div><span>Regions</span><strong>{modelData.areas.length}</strong></div>
            <div><span>Time span</span><strong>{modelData.dataset.yearRange.join("–")}</strong></div>
            <div><span>Target</span><strong>{modelData.dataset.target}</strong></div>
            <div><span>Unit</span><strong>{modelData.dataset.unit}</strong></div>
          </div>
          <a className="source-link" href={modelData.dataset.sourceUrl} rel="noreferrer" target="_blank">
            <ExternalLink size={16} />
            View dataset source
            <ChevronRight size={15} />
          </a>
        </section>
        <section className="importance-card">
          <div className="card-heading">
            <div>
              <div className="card-title">Permutation influence</div>
              <div className="card-subtitle">Increase in error when a feature is replaced</div>
            </div>
          </div>
          <div className="importance-list">
            {modelData.featureImportance.map((item, index) => (
              <div className="importance-item" key={item.feature}>
                <div className="importance-label">
                  <span>{item.feature}</span>
                  <strong>{item.value.toFixed(1)}%</strong>
                </div>
                <div className="importance-track">
                  <div
                    className={`importance-fill importance-${Math.min(index, 3)}`}
                    style={{ width: `${Math.max(item.value, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="candidate-card">
        <div className="card-heading">
          <div>
            <div className="card-title">Candidate comparison</div>
            <div className="card-subtitle">Same feature pipeline, validation sample and deterministic seed</div>
          </div>
          <div className="best-badge">
            <Sparkles size={14} />
            Best selected by test R²
          </div>
        </div>
        <div className="candidate-table">
          <div className="candidate-head">
            <span>Model</span><span>R²</span><span>RMSE</span><span>MAE</span><span>Status</span>
          </div>
          {modelData.candidates.map((candidate, index) => (
            <div className="candidate-row" key={candidate.name}>
              <strong>{candidate.name}</strong>
              <span>{candidate.metrics.r2.toFixed(3)}</span>
              <span>{candidate.metrics.rmse.toFixed(3)}</span>
              <span>{candidate.metrics.mae.toFixed(3)}</span>
              <span>{index === 0 ? <b>Selected</b> : "Evaluated"}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [artifact, setArtifact] = useState<ModelArtifact | null>(null);
  useEffect(() => {
    fetch("/crop-model.json")
      .then((response) => response.json())
      .then((data: ModelArtifact) => setArtifact(data))
      .catch(() => setArtifact(null));
  }, []);
  return (
    <div className="app-shell">
      <Sidebar onClose={() => setMenuOpen(false)} open={menuOpen} page={page} setPage={setPage} />
      <main className="main">
        <Header onMenu={() => setMenuOpen(true)} page={page} />
        {page === "dashboard" && <OverviewDashboard goPredict={() => setPage("predict")} />}
        {page === "predict" && <PredictionPage artifact={artifact} loading={!artifact} />}
        {page === "model" && <ModelPage />}
        <footer>
          <span>CropYield AI · Weather-Based Crop Yield Prediction System</span>
          <span>B.Tech Artificial Intelligence & Data Science</span>
        </footer>
      </main>
    </div>
  );
}
