"use client";

import { Separator } from "@/components/ui/separator";
import { TypographyH2, TypographyP } from "@/components/ui/typography";
import { motion } from "framer-motion";
import Image from "next/image";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default function Home() {
  return (
    <motion.div initial="initial" animate="animate" variants={staggerChildren}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mb-8 flex justify-center"
      >
        <Image src="/logo.png" alt="SquadPulse Logo" width={100} height={100} priority />
      </motion.div>

      <motion.div variants={fadeIn}>
        <TypographyH2>
          <motion.span
            className="text-green-400"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            SquadPulse
          </motion.span>
          : Command-Level Health Intelligence for Mission Readiness
        </TypographyH2>
      </motion.div>

      <motion.div variants={fadeIn}>
        <TypographyP>
          SquadPulse transforms individual health data into actionable squad-level insights, enabling commanders to make
          informed decisions about mission readiness and tactical deployment.
        </TypographyP>
      </motion.div>

      <Separator className="my-4" />

      <motion.div variants={fadeIn}>
        <TypographyP className="font-semibold text-muted-foreground">Key Capabilities:</TypographyP>
      </motion.div>

      <motion.ul className="mt-2 list-disc space-y-2 pl-6">
        {[
          "Real-time heart health monitoring using advanced PPG waveform analysis",
          "Squad-wide health trend identification and early warning system",
          "Predictive analytics for cardiovascular anomalies and combat readiness",
          "Tactical deployment recommendations based on health metrics",
        ].map((capability, index) => (
          <motion.li
            key={index}
            className="text-muted-foreground"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
          >
            {capability}
          </motion.li>
        ))}
      </motion.ul>

      <Separator className="my-4" />

      <motion.div variants={fadeIn} transition={{ delay: 1.5 }}>
        <TypographyP>
          Leveraging over 2,800 PPG recordings and advanced AI analysis, SquadPulse provides commanders with a
          comprehensive view of their squad&apos;s cardiovascular health, stress levels, and overall readiness status.
        </TypographyP>
      </motion.div>

      <motion.div variants={fadeIn} transition={{ delay: 1.7 }}>
        <TypographyP className="mt-4">
          <motion.span className="font-semibold" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Secure Access:
          </motion.span>{" "}
          Log in through the top right to access your squad&apos;s health command center.
        </TypographyP>
      </motion.div>
    </motion.div>
  );
}
