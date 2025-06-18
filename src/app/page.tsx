'use client';

import { ResearchFindings } from '@/components/main-page/research-findings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
// logos
import medipalLogo from '@/public/brand-01.png';
import sghLogo from '@/public/sgh-logo.png';
import rafflesLogo from '@/public/raffles-logo.png';
import healthcareProLogo from '@/public/healthcare-pro-logo.png';
// page bg
import bgImage from '@/public/landing-bg.png';
import {
  Brain,
  CheckCircle,
  Clock,
  Heart,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, type Variants } from 'motion/react';
import { PresentationSlides } from '@/components/main-page/ppt-carousel';

// Reusable animation variants
const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1], // Custom easing for smooth animation
    },
  },
};

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const fadeUpStaggerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function LandingPage() {
  return (
    <div
      className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 '
      style={{
        backgroundImage: `url(${bgImage.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className='container mx-auto px-4 py-6'
      >
        <nav className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Image src={medipalLogo} alt='Medipal' width={180} height={32} />
          </div>

          {/* badges */}
          <div className='flex items-center space-x-2'>
            <Badge
              variant='secondary'
              className='bg-emerald-50 text-emerald-800 border-green-200'
            >
              Research-Backed
            </Badge>
            <Badge className=' bg-cyan-700 text-white border-blue-200'>
              AI-Powered Healthcare Innovation
            </Badge>
          </div>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        initial='hidden'
        animate='visible'
        variants={staggerContainerVariants}
        className='container mx-auto px-4 py-16 text-center'
      >
        <div className='max-w-4xl mx-auto'>
          <motion.h1
            variants={fadeUpStaggerVariants}
            className='text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-600 via-emerald-600 to-teal-800 bg-clip-text text-transparent leading-tight'
          >
            Your AI Companion During Emergency Room Waits
          </motion.h1>

          <motion.p
            variants={fadeUpStaggerVariants}
            className='text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed'
          >
            Supporting patients through 2.5+ hour ED wait times with real-time
            interaction, emotional support, and intelligent triaging assistance.
            Augmenting human care, never replacing it.
          </motion.p>

          {/* Main CTAs */}
          <motion.div
            variants={fadeUpStaggerVariants}
            className='flex flex-row gap-4 justify-center mb-10'
          >
            {/* nurse */}
            <Link href='/nurse'>
              <Button
                variant='outline'
                className='border-2 border-cyan-700 text-cyan-700 hover:bg-cyan-700 hover:text-white w-60 h-12 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300'
              >
                <Shield className='w-5 h-5 mr-2' />
                For Healthcare Staff
              </Button>
            </Link>

            {/* patient */}
            <Link href='/patient'>
              <div className='w-full relative inline-flex group items-center shadow-none rounded-lg'>
                {/* Button glow */}
                <div className='absolute z-10 -inset-0.5 opacity-100 bg-gradient-to-r from-emerald-400 via-sky-400 to-teal-500 rounded-lg blur-sm group-hover:opacity-100 group-hover:-inset-1.5 group-hover:blur-md group-hover:animate-pulse transition-all duration-300'></div>
                {/* Patients */}
                <Button className='z-20 bg-gradient-to-br from-cyan-600 via-emerald-500 to-blue-700 text-white w-60 h-12 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer'>
                  <Users className='w-5 h-5 mr-2' />
                  For Patients
                </Button>
              </div>
              <motion.p
                className='text-xs text-cyan-800 mt-1 font-semibold'
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                Click here first
              </motion.p>
            </Link>
          </motion.div>

          {/* Research Credibility */}
          <Link href={'#research-findings'}>
            <motion.div
              variants={fadeUpStaggerVariants}
              className='bg-white/40 hover:bg-white backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-[0_1px_10px_rgba(52,211,153,0.8)] [transition:box-shadow_0.3s_ease-in-out,color_0.2s_linear,background-color_0.2s_linear]'
            >
              <p className='text-sm text-slate-600 mb-2'>
                Research conducted with
              </p>
              <div className='flex items-center justify-center space-x-4 sm:space-x-8 text-gray-500'>
                <Image
                  src={sghLogo}
                  alt='Singapore General Hospital'
                  width={120}
                  height={50}
                  className='inline-block mb-1'
                />
                <span className='text-gray-300'>•</span>
                <Image
                  src={rafflesLogo}
                  alt='Raffles Medical'
                  width={120}
                  height={50}
                  className='inline-block mb-1'
                />
                <span className='text-gray-300'>•</span>
                <Image
                  src={healthcareProLogo}
                  alt='Healthcare Pro'
                  width={120}
                  height={50}
                  className='inline-block mb-1'
                />
              </div>
            </motion.div>
          </Link>
        </div>
      </motion.section>

      {/* Problem & Solution */}
      <motion.section
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUpVariants}
        className='container mx-auto px-4 py-16'
      >
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4 text-gray-900'>
              Transforming Emergency Department Experience
            </h2>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              Long wait times shouldn&apos;t mean patients feel abandoned. Our
              AI companion bridges the gap when clinical staff are busy and
              families can&apos;t be present.
            </p>
          </div>

          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainerVariants}
            className='grid md:grid-cols-2 gap-8 mb-16'
          >
            <motion.div variants={fadeUpStaggerVariants}>
              <Card className='p-8 bg-red-50 border-red-200'>
                <CardContent className='p-0'>
                  <div className='flex items-center mb-4'>
                    <Clock className='w-8 h-8 text-red-600 mr-3' />
                    <h3 className='text-2xl font-bold text-red-800'>
                      The Challenge
                    </h3>
                  </div>
                  <ul className='space-y-3 text-red-700'>
                    <li className='flex items-start'>
                      <span className='w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0'></span>
                      2.5+ hour average wait times in emergency departments
                    </li>
                    <li className='flex items-start'>
                      <span className='w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0'></span>
                      Patients often separated from family support
                    </li>
                    <li className='flex items-start'>
                      <span className='w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0'></span>
                      Clinical staff too busy for continuous patient interaction
                    </li>
                    <li className='flex items-start'>
                      <span className='w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0'></span>
                      Anxiety and uncertainty during vulnerable moments
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUpStaggerVariants}>
              <Card className='p-8 bg-green-50 border-green-200'>
                <CardContent className='p-0'>
                  <div className='flex items-center mb-4'>
                    <Brain className='w-8 h-8 text-green-600 mr-3' />
                    <h3 className='text-2xl font-bold text-green-800'>
                      Our Solution
                    </h3>
                  </div>
                  <ul className='space-y-3 text-green-700'>
                    <li className='flex items-start'>
                      <CheckCircle className='w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0' />
                      AI companion provides real-time emotional support
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle className='w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0' />
                      Instant access to medical history and insurance info
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle className='w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0' />
                      Accelerated triaging through intelligent data collection
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle className='w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0' />
                      Sentiment tracking for healthcare staff insights
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Benefits for Stakeholders */}
      <motion.section
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUpVariants}
        className='bg-white py-16'
      >
        <div className='container mx-auto px-4'>
          <div className='max-w-6xl mx-auto'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl md:text-4xl font-bold mb-4 text-gray-900'>
                Benefits for Everyone
              </h2>
              <p className='text-lg text-gray-600'>
                Our AI companion creates value across the entire healthcare
                ecosystem
              </p>
            </div>

            <motion.div
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainerVariants}
              className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'
            >
              <motion.div variants={fadeUpStaggerVariants}>
                <Card className='p-6 hover:shadow-lg transition-shadow duration-300'>
                  <CardContent className='p-0 text-center md:h-[180px]'>
                    <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                      <Users className='w-6 h-6 text-blue-600' />
                    </div>
                    <h3 className='text-lg font-semibold mb-2 text-gray-900'>
                      Patients
                    </h3>
                    <p className='text-sm text-gray-600'>
                      Feel less anxious and more informed during long waits with
                      real-time support and guidance
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeUpStaggerVariants}>
                <Card className='p-6 hover:shadow-lg transition-shadow duration-300'>
                  <CardContent className='p-0 text-center md:h-[180px]'>
                    <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                      <Heart className='w-6 h-6 text-purple-600' />
                    </div>
                    <h3 className='text-lg font-semibold mb-2 text-gray-900'>
                      Family Members
                    </h3>
                    <p className='text-sm text-gray-600'>
                      Peace of mind knowing their loved one is supported and
                      monitored even when they can&apos;t be there
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeUpStaggerVariants}>
                <Card className='p-6 hover:shadow-lg transition-shadow duration-300'>
                  <CardContent className='p-0 text-center md:h-[180px]'>
                    <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                      <Shield className='w-6 h-6 text-green-600' />
                    </div>
                    <h3 className='text-lg font-semibold mb-2 text-gray-900'>
                      Healthcare Staff
                    </h3>
                    <p className='text-sm text-gray-600'>
                      Receive structured information ahead of time, helping
                      prioritize and treat patients more efficiently
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeUpStaggerVariants}>
                <Card className='p-6 hover:shadow-lg transition-shadow duration-300'>
                  <CardContent className='p-0 text-center md:h-[180px]'>
                    <div className='w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                      <TrendingUp className='w-6 h-6 text-orange-600' />
                    </div>
                    <h3 className='text-lg font-semibold mb-2 text-gray-900'>
                      Hospitals
                    </h3>
                    <p className='text-sm text-gray-600'>
                      Improve patient experience and operational flow without
                      adding more staff workload
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Research Findings */}
      <div className='bg-white'>
        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUpVariants}
        >
          <ResearchFindings />
        </motion.div>
      </div>

      {/* Presentation Slides Section */}
      <div className='bg-white'>
        <motion.section
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUpVariants}
          className='py-8'
        >
          <PresentationSlides />
        </motion.section>
      </div>

      {/* Video section */}
        <motion.section
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUpVariants}
          className='container mx-auto px-4 py-8 text-center'
        >
          <div className='max-w-3xl mx-auto'>
            <h2 className='text-3xl md:text-4xl font-bold mb-6 text-cyan-900'>
              Watch Our AI Companion in Action
            </h2>
            <p className='text-lg text-gray-600 mb-8'>
              See how Medipal enhances the emergency department experience
            </p>
            {/* TODO */}
            <iframe
              src='https://www.youtube.com/embed/your-video-id' // TODO
              title='Medipal Demo Video'
              className='w-full aspect-video rounded-lg shadow-lg'
              allowFullScreen
            ></iframe>
          </div>
        </motion.section>

      {/* CTA Section */}
      <motion.section
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUpVariants}
        className='bg-gradient-to-r from-emerald-300 via-cyan-700 to-slate-500 py-16'
      >
        <div className='container mx-auto px-4 text-center'>
          <div className='max-w-3xl mx-auto'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4 text-white'>
              Ready to Transform Emergency Care?
            </h2>
            <p className='text-xl text-blue-100 mb-8'>
              Join us in revolutionizing the emergency department experience
              with AI-powered patient support
            </p>
            <motion.div
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true, amount: 0.5 }}
              variants={staggerContainerVariants}
              className='flex flex-col sm:flex-row gap-4 justify-center'
            >
              <motion.div variants={fadeUpStaggerVariants}>
                <Link href='/patient'>
                  <Button
                    size='lg'
                    variant='secondary'
                    className='bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300'
                  >
                    <Users className='w-5 h-5 mr-2' />
                    Patient Experience
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={fadeUpStaggerVariants}>
                <Link href='/nurse'>
                  <Button
                    size='lg'
                    variant='outline'
                    className='bg-teal-500/20 border-2 border-teal-400/60 text-teal-100 hover:bg-teal-500/20 hover:border-teal-300 hover:text-white backdrop-blur-sm px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300'
                  >
                    <Shield className='w-5 h-5 mr-2' />
                    Healthcare Dashboard
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUpVariants}
        className='bg-white/50  text-white py-12'
      >
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl mx-auto text-center'>
            <Image
              src={medipalLogo}
              alt='Medipal'
              width={120}
              height={32}
              className='mb-4 mx-auto'
            />
            <p className='text-gray-400 mb-6'>
              Augmenting human care with AI-powered patient support
            </p>
            <p className='text-sm text-gray-500'>
              © 2025 Medipal. Built with research from Singapore General
              Hospital and Raffles Medical.
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
