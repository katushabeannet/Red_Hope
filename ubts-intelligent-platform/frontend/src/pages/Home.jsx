function Home() {
  return (
    <section className="rounded-2xl bg-white p-8 shadow">
      <h2 className="mb-4 text-3xl font-bold text-slate-900">
        Welcome to the UBTS Intelligent Donor Assistance Platform
      </h2>

      <p className="mb-6 max-w-3xl text-slate-600">
        This prototype supports donor eligibility checks, availability
        prediction, nearest donation camp recommendation, chatbot assistance,
        and admin campaign-ready donor scanning.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 p-5">
          <h3 className="mb-2 font-semibold text-red-700">Donor Assistance</h3>
          <p className="text-sm text-slate-600">
            Donors can check eligibility, availability, and nearby donation camps.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 p-5">
          <h3 className="mb-2 font-semibold text-red-700">Admin Intelligence</h3>
          <p className="text-sm text-slate-600">
            Admin users can scan campaign-ready donors and view summaries.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 p-5">
          <h3 className="mb-2 font-semibold text-red-700">Knowledge Graph</h3>
          <p className="text-sm text-slate-600">
            Neo4j stores reasoning traces for explainability and transparency.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Home;