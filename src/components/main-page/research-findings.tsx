"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, type Variants } from "motion/react";
import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const waitTimeData = [
  { range: "0-1 hours", patients: 15, percentage: 12 },
  { range: "1-2 hours", patients: 25, percentage: 20 },
  { range: "2-3 hours", patients: 35, percentage: 28 },
  { range: "3-4 hours", patients: 30, percentage: 24 },
  { range: "4+ hours", patients: 20, percentage: 16 },
];

const anxietyLevels = [
  { level: "Low", value: 20, color: "#14b8a6" },
  { level: "Moderate", value: 45, color: "#F59E0B" },
  { level: "High", value: 35, color: "#EF4444" },
];

const supportNeeds = [
  { need: "Information about wait times", percentage: 85 },
  { need: "Emotional support", percentage: 72 },
  { need: "Insurance/billing questions", percentage: 68 },
  { need: "Medical history access", percentage: 61 },
  { need: "Family communication", percentage: 54 },
];

// Animation variants
const fadeUpVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 60 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const fadeUpStaggerVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 40 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const countUpVariants: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.8
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

// Animated Progress Bar Component
function AnimatedProgressBar({ 
  value, 
  className = "h-2",
  delay = 0 
}: { 
  value: number;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: { delay }
        }
      }}
    >
      <motion.div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${className}`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-teal-600 rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ 
            duration: 1.5, 
            delay: delay + 0.2,
            ease: [0.16, 1, 0.3, 1]
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// Animated Counter Component
function AnimatedCounter({ 
  value, 
  suffix = "",
  duration = 2 
}: { 
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isVisible, value, duration]);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      variants={countUpVariants}
      onViewportEnter={() => setIsVisible(true)}
      className="text-3xl font-bold mb-2"
    >
      {count}{suffix}
    </motion.div>
  );
}

export function ResearchFindings() {
  return (
    <motion.section 
      id='research-findings' 
      className="container mx-auto px-4 py-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeUpVariants}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          variants={fadeUpStaggerVariants}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Research Findings
          </h2>
          <p className="text-lg text-gray-600">
            Insights from interviews with healthcare professionals and patient
            surveys across multiple institutions.{" "}
            {/* <Link
              href="https://docs.google.com/spreadsheets/d/1F5lJeUYFFhjbwgb7kRFgDixxbJqvtqSH-c4q18fgMng/edit?usp=sharing"
              target="_blank"
              className="text-cyan-700 underline hover:text-cyan-800 transition-colors"
            >
              Actual research findings
            </Link> */}
          </p>
        </motion.div>

      {/* Survey Responses Section */}
      <motion.div
          className='mb-12'
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUpVariants}
        >
          <Card className='p-6 hover:shadow-lg transition-shadow duration-300'>
            <CardHeader className='p-0 '>
              <CardTitle className='text-xl font-semibold text-center'>
                Live Survey Response Data - 41 Responses
              </CardTitle>
              <p className='text-sm text-gray-600 text-center'>
                Real-time responses from healthcare professionals and patients
              </p>
            </CardHeader>
            <CardContent className='p-0 overflow-y-auto h-[500px]'>
              <div className='w-full flex justify-center'>
                <div className='w-full'>
                  <iframe
                    src='https://docs.google.com/spreadsheets/d/e/2PACX-1vSjkf5zp8uGeDzRCbPU__Iq5EIKlk0c_zml0NnNSE-09G8m3dQ4h0zDVRAnM5q1iD0MvqgG_hdhlzsP/pubhtml?gid=598576747&single=true'
                    className='w-full h-[800px] border-0 rounded-lg'
                    title='Survey Response Analytics'
                  >
                    Loading survey responses...
                  </iframe>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          className="grid lg:grid-cols-2 gap-8 mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainerVariants}
        >
          
          {/* Wait Times Distribution */}
          <motion.div variants={fadeUpStaggerVariants}>
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-xl font-semibold">
                  Emergency Department Wait Times
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Distribution of patient wait times in hours
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={waitTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar
                        dataKey="percentage"
                        fill="#0f766e"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Anxiety Levels */}
          <motion.div variants={fadeUpStaggerVariants}>
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-xl font-semibold">
                  Patient Anxiety Levels During Wait
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Self-reported anxiety levels from patient interviews
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                >
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={anxietyLevels}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ level, value }) => `${level}: ${value}%`}
                      >
                        {anxietyLevels.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Support Needs - Animated Progress Bars */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUpVariants}
        >
          <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-semibold">
                Top Patient Support Needs
              </CardTitle>
              <p className="text-sm text-gray-600">
                What patients most want help with during ED visits
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <motion.div 
                className="space-y-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={staggerContainerVariants}
              >
                {supportNeeds.map((item, index) => (
                  <motion.div 
                    key={index} 
                    className="space-y-2"
                    variants={fadeUpStaggerVariants}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {item.need}
                      </span>
                      <motion.span 
                        className="text-sm font-semibold text-gray-900"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                      >
                        {item.percentage}%
                      </motion.span>
                    </div>
                    <AnimatedProgressBar 
                      value={item.percentage} 
                      delay={index * 0.1}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Insights - Animated Counters */}
        <motion.div 
          className="grid md:grid-cols-3 gap-6 mt-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainerVariants}
        >
          <motion.div variants={fadeUpStaggerVariants}>
            <Card className="p-6 bg-blue-50 border-blue-200 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0 text-center">
                <AnimatedCounter value={68} suffix="%" duration={2} />
                <p className="text-sm text-cyan-800 font-semibold">
                  of patients wait 2+ hours in ED
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeUpStaggerVariants}>
            <Card className="p-6 bg-orange-50 border-orange-200 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0 text-center">
                <AnimatedCounter value={80} suffix="%" duration={2} />
                <p className="text-sm text-orange-800 font-semibold">
                  report moderate to high anxiety
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeUpStaggerVariants}>
            <Card className="p-6 bg-emerald-50 border-green-200 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0 text-center">
                <AnimatedCounter value={92} suffix="%" duration={2} />
                <p className="text-sm text-emerald-600">
                  of nurses support AI assistance
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
