import { ResearchFindings } from "@/components/main-page/research-findings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  CheckCircle,
  Clock,
  Heart,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import medipalLogo from "../../public/brand-01.png";
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image src={medipalLogo} alt="Medipal" width={180} height={32} />
          </div>
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 border-green-200"
          >
            Research-Backed
          </Badge>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">
            AI-Powered Healthcare Innovation
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
            Your AI Companion During Emergency Room Waits
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Supporting patients through 2.5+ hour ED wait times with real-time
            interaction, emotional support, and intelligent triaging assistance.
            Augmenting human care, never replacing it.
          </p>

          {/* Main CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/patient">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Users className="w-5 h-5 mr-2" />
                For Patients
              </Button>
            </Link>
            <Link href="/nurse">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Shield className="w-5 h-5 mr-2" />
                For Healthcare Staff
              </Button>
            </Link>
          </div>

          {/* Research Credibility */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
            <p className="text-sm text-gray-600 mb-2">
              Research conducted with
            </p>
            <div className="flex items-center justify-center space-x-8 text-gray-500">
              <span className="font-semibold">Singapore General Hospital</span>
              <span className="text-gray-300">•</span>
              <span className="font-semibold">Raffles Medical</span>
              <span className="text-gray-300">•</span>
              <span className="font-semibold">Healthcare Professionals</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Transforming Emergency Department Experience
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Long wait times shouldn&apos;t mean patients feel abandoned. Our AI
              companion bridges the gap when clinical staff are busy and
              families can&apos;t be present.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="p-8 bg-red-50 border-red-200">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <Clock className="w-8 h-8 text-red-600 mr-3" />
                  <h3 className="text-2xl font-bold text-red-800">
                    The Challenge
                  </h3>
                </div>
                <ul className="space-y-3 text-red-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    2.5+ hour average wait times in emergency departments
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Patients often separated from family support
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Clinical staff too busy for continuous patient interaction
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Anxiety and uncertainty during vulnerable moments
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8 bg-green-50 border-green-200">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <Brain className="w-8 h-8 text-green-600 mr-3" />
                  <h3 className="text-2xl font-bold text-green-800">
                    Our Solution
                  </h3>
                </div>
                <ul className="space-y-3 text-green-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    AI companion provides real-time emotional support
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    Instant access to medical history and insurance info
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    Accelerated triaging through intelligent data collection
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    Sentiment tracking for healthcare staff insights
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits for Stakeholders */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Benefits for Everyone
              </h2>
              <p className="text-lg text-gray-600">
                Our AI companion creates value across the entire healthcare
                ecosystem
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-0 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                    Patients
                  </h3>
                  <p className="text-sm text-gray-600">
                    Feel less anxious and more informed during long waits with
                    real-time support and guidance
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-0 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                    Family Members
                  </h3>
                  <p className="text-sm text-gray-600">
                    Peace of mind knowing their loved one is supported and
                    monitored even when they can&apos;t be there
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-0 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                    Healthcare Staff
                  </h3>
                  <p className="text-sm text-gray-600">
                    Receive structured information ahead of time, helping
                    prioritize and treat patients more efficiently
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-0 text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                    Hospitals
                  </h3>
                  <p className="text-sm text-gray-600">
                    Improve patient experience and operational flow without
                    adding more staff workload
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Research Findings */}
      <ResearchFindings />

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to Transform Emergency Care?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join us in revolutionizing the emergency department experience
              with AI-powered patient support
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/patient">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Patient Experience
                </Button>
              </Link>
              <Link href="/nurse">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-teal-500/20 border-2 border-teal-400/60 text-teal-100 hover:bg-teal-500/20 hover:border-teal-300 hover:text-white backdrop-blur-sm px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Healthcare Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Image
              src={medipalLogo}
              alt="Medipal"
              width={120}
              height={32}
              className="mb-4 mx-auto"
            />
            <p className="text-gray-400 mb-6">
              Augmenting human care with AI-powered patient support
            </p>
            <p className="text-sm text-gray-500">
              © 2024 Medipal. Built with research from Singapore General
              Hospital and Raffles Medical.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
