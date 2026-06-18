import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RiArrowLeftLine, RiCustomerService2Line, RiDropLine } from "react-icons/ri";

function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-6 py-20 dark:bg-slate-900">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-red-100/60 blur-3xl dark:bg-red-950/20" />
        <div className="absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-slate-100/80 blur-3xl dark:bg-slate-800/40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        {/* Ghost 404 */}
        <p className="select-none text-9xl font-black tracking-tighter text-red-100 dark:text-slate-800 lg:text-[160px]">
          404
        </p>

        {/* Drop icon floating over 404 */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 220 }}
          className="-mt-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 shadow-lg ring-4 ring-white dark:bg-red-950 dark:ring-slate-900"
        >
          <RiDropLine size={40} className="text-red-700 dark:text-red-400" />
        </motion.div>

        <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-slate-50 lg:text-3xl">
          Page Not Found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-slate-500 dark:text-slate-400">
          The page you're looking for doesn't exist or has been moved. You may have followed an outdated link or typed the URL incorrectly.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-7 py-3.5 font-semibold text-white shadow-md transition hover:bg-red-800">
            <RiArrowLeftLine size={18} /> Go Home
          </Link>
          <Link to="/contact"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 px-7 py-3 font-semibold text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-slate-600 dark:text-slate-300 dark:hover:border-red-700 dark:hover:text-red-400">
            <RiCustomerService2Line size={18} /> Contact Support
          </Link>
        </div>

        <p className="mt-8 text-xs text-slate-400 dark:text-slate-600">
          Think this is a mistake? Email{" "}
          <a href="mailto:info@ubts.go.ug" className="font-medium text-red-700 hover:underline dark:text-red-400">
            info@ubts.go.ug
          </a>
        </p>
      </motion.div>
    </div>
  );
}

export default NotFound;
