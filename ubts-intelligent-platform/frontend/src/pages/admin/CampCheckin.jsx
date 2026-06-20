import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  RiCheckboxCircleLine,
  RiHeartPulseLine,
  RiLoginBoxLine,
  RiMapPinLine,
} from "react-icons/ri";

import { useAuth } from "../../context/AuthContext";
import { campCheckin } from "../../services/donorService";
import { getCampDetail } from "../../services/campService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";

function CampCheckin() {
  const { campId } = useParams();
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();

  const [camp, setCamp] = useState(null);
  const [campLoading, setCampLoading] = useState(true);
  const [campError, setCampError] = useState("");

  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinResult, setCheckinResult] = useState(null);
  const [checkinError, setCheckinError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setCampLoading(true);
        const data = await getCampDetail(campId);
        setCamp(data);
      } catch {
        setCampError("Camp not found or is no longer available.");
      } finally {
        setCampLoading(false);
      }
    };
    if (campId) load();
  }, [campId]);

  const handleCheckin = async () => {
    try {
      setCheckinLoading(true);
      setCheckinError("");
      const result = await campCheckin(campId);
      setCheckinResult(result);
    } catch (err) {
      setCheckinError(
        err.response?.data?.error || "Check-in failed. Please try again."
      );
    } finally {
      setCheckinLoading(false);
    }
  };

  if (authLoading || campLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[var(--text-secondary)]">
        Loading...
      </div>
    );
  }

  if (campError) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-lg font-semibold text-red-600">{campError}</p>
        <Button className="mt-6" variant="secondary" onClick={() => navigate("/")}>
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
      <div className="text-center">
        <p className="text-sm font-medium text-[var(--crimson)]">
          UBTS Blood Donation
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
          Camp Check-in
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Confirm your attendance and record today&apos;s donation.
        </p>
      </div>

      {camp && (
        <Card>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--crimson-light)] text-[var(--crimson)]">
              <RiMapPinLine size={22} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {camp.name}
              </h2>
              <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                {camp.venue}, {camp.district}
                {camp.region ? `, ${camp.region}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge label={camp.status} variant={camp.status?.toLowerCase()} />
                {camp.start_date && (
                  <span className="text-xs text-[var(--text-muted)]">
                    {camp.start_date} — {camp.end_date}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {!user ? (
        <Card>
          <div className="text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              You must be logged in as a donor to check in.
            </p>
            <Button
              className="mt-4"
              onClick={() =>
                navigate(`/login?next=/camp-checkin/${campId}`)
              }
            >
              <RiLoginBoxLine /> Log in to Check In
            </Button>
          </div>
        </Card>
      ) : user.role !== "DONOR" ? (
        <Card className="border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-900/20">
          Only registered donors can check in at a camp.
        </Card>
      ) : checkinResult ? (
        <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10">
          <div className="flex items-start gap-4">
            <RiCheckboxCircleLine
              size={32}
              className="shrink-0 text-emerald-600"
            />
            <div>
              <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                {checkinResult.message}
              </p>
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                Donation date: {checkinResult.donation_date}
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Total donations: {checkinResult.total_donations}
              </p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => navigate("/donor-dashboard")}
              >
                View My Dashboard
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          {checkinError && (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20">
              {checkinError}
            </p>
          )}
          <p className="text-sm text-[var(--text-secondary)]">
            Logged in as{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              {user.full_name || user.email}
            </span>
            . Clicking below will record your donation at{" "}
            <span className="font-semibold">{camp?.name}</span> for today.
          </p>
          <Button
            className="mt-4 w-full"
            loading={checkinLoading}
            onClick={handleCheckin}
          >
            <RiHeartPulseLine /> Record My Check-in
          </Button>
        </Card>
      )}
    </div>
  );
}

export default CampCheckin;
