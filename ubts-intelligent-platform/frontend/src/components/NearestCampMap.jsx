import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { RiMapPinLine } from "react-icons/ri";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function NearestCampMap({ camp }) {
  if (!camp) return null;

  const latitude = Number(camp.latitude);
  const longitude = Number(camp.longitude);

  if (!latitude || !longitude) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
        Camp coordinates are not available.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--crimson-light)] text-[var(--crimson)]">
            <RiMapPinLine size={20} />
          </div>

          <div>
            <h4 className="font-semibold text-[var(--text-primary)]">
              Camp Location Map
            </h4>
            <p className="text-xs text-[var(--text-muted)]">
              OpenStreetMap nearest camp visualization
            </p>
          </div>
        </div>
      </div>

      <MapContainer
        center={[latitude, longitude]}
        zoom={14}
        scrollWheelZoom={false}
        className="h-[380px] w-full"
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[latitude, longitude]}>
          <Popup>
            <strong>{camp.name}</strong>
            <br />
            {camp.venue}
            <br />
            {camp.district}
          </Popup>
        </Marker>
      </MapContainer>

      <div className="grid gap-3 border-t border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm md:grid-cols-3">
        <MapInfo label="Latitude" value={latitude} />
        <MapInfo label="Longitude" value={longitude} />
        <MapInfo label="Venue" value={camp.venue || "Not available"} />
      </div>
    </div>
  );
}

function MapInfo({ label, value }) {
  return (
    <div>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

export default NearestCampMap;