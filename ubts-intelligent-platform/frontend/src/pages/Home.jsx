import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiRobot2Line,
  RiMapPinLine,
  RiHeartPulseLine,
  RiShieldCheckLine,
} from "react-icons/ri";

import Card from "../components/common/Card";
import Button from "../components/common/Button";

function Home() {
  return (
    <div className="space-y-12">
      <section className="grid items-center gap-10 py-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <span className="inline-flex rounded-full bg-[var(--crimson-light)] px-4 py-2 text-sm font-semibold text-[var(--crimson)]">
            Intelligent Blood Donation Support
          </span>

          <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)] md:text-6xl">
            Smarter donor assistance for UBTS operations.
          </h1>

          <p className="max-w-xl text-lg text-[var(--text-secondary)]">
            A sample intelligent platform for donor eligibility checks,
            availability prediction, nearest camp recommendation, chatbot
            support, and campaign-ready donor planning.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/chatbot">
              <Button size="lg">Ask the Chatbot</Button>
            </Link>

            <Link to="/login">
              <Button size="lg" variant="outline">
                Login
              </Button>
            </Link>
          </div>
        </motion.div>

        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-red-100 blur-3xl dark:bg-red-900/30" />

          <div className="relative space-y-5">
            {[
              ["Eligibility Engine", "Rule-based donor safety checks"],
              ["Availability Model", "Predict likely donor response"],
              ["Neo4j Traceability", "Explainable reasoning records"],
              ["Geospatial Camps", "Nearest active donation camp"],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4"
              >
                <h3 className="font-semibold text-[var(--text-primary)]">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-5 md:grid-cols-4">
        {[
          [RiHeartPulseLine, "Donor Support", "Eligibility and availability tools"],
          [RiMapPinLine, "Camp Finder", "Location-based camp recommendation"],
          [RiRobot2Line, "AI Chatbot", "Blood donation Q&A assistance"],
          [RiShieldCheckLine, "Traceability", "Neo4j reasoning audit trails"],
        ].map(([Icon, title, text]) => (
          <Card key={title}>
            <Icon className="mb-4 text-[var(--crimson)]" size={28} />
            <h3 className="font-semibold text-[var(--text-primary)]">
              {title}
            </h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{text}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}

export default Home;