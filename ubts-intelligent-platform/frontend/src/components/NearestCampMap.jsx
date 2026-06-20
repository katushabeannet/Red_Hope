import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { RiMapPinLine } from "react-icons/ri";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function NearestCampMap({ camp }) {
  if (!camp) return null;

  const lat = Number(camp.latitude);
  const lng = Number(camp.longitude);

  if (!lat || !lng) {
    return (
      <div style={{
        borderRadius: 14, border: "1.5px solid #FCD34D",
        background: "#FFFBEB", padding: "16px 18px",
        fontSize: 13, color: "#92400E", lineHeight: 1.6,
      }}>
        Camp coordinates are not available.
      </div>
    );
  }

  return (
    <div style={{
      borderRadius: 16,
      border: "1.5px solid var(--border)",
      background: "#fff",
      overflow: "hidden",
      boxShadow: "0 2px 10px rgba(0,0,0,.05)",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        background: "#fff",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: "#FDEEF1", color: "var(--cr)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <RiMapPinLine size={20} />
        </div>
        <div>
          <h4 style={{ fontWeight: 700, color: "var(--ink)", fontSize: 14, margin: 0 }}>
            Camp Location Map
          </h4>
          <p style={{ fontSize: 11, color: "var(--ink-l)", margin: "3px 0 0" }}>
            OpenStreetMap nearest camp visualization
          </p>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: 380, width: "100%" }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>
          <Popup>
            <strong>{camp.name}</strong><br />
            {camp.venue}<br />
            {camp.district}
          </Popup>
        </Marker>
      </MapContainer>

      {/* Info footer */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: 12, padding: "14px 20px",
        borderTop: "1px solid var(--border)",
        background: "var(--canvas)",
      }}>
        {[
          { label: "Latitude",  value: lat },
          { label: "Longitude", value: lng },
          { label: "Venue",     value: camp.venue || "Not available" },
        ].map(({ label, value }) => (
          <div key={label}>
            <p style={{ fontSize: 11, color: "var(--ink-l)", margin: "0 0 3px" }}>{label}</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NearestCampMap;
