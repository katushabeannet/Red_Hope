import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="rounded-2xl bg-white p-8 text-center shadow">
      <h2 className="text-3xl font-bold text-slate-900">Page Not Found</h2>
      <p className="mt-3 text-slate-600">
        The page you are looking for does not exist.
      </p>

      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-red-700 px-5 py-3 text-white hover:bg-red-800"
      >
        Go Home
      </Link>
    </div>
  );
}

export default NotFound;