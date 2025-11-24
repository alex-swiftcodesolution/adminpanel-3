// app/page.tsx

import Link from "next/link";
import {
  Lock,
  Key,
  Users,
  Shield,
  Smartphone,
  Clock,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-linear-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl mb-8">
              <Lock className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Smart Lock Management
              <br />
              <span className="text-blue-200">Made Simple</span>
            </h1>

            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Comprehensive control over your Tuya smart locks. Manage
              passwords, users, unlock methods, and monitor your door security
              from anywhere.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold text-lg inline-flex items-center gap-2 justify-center shadow-xl"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>

              <a
                href="#features"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white hover:bg-opacity-10 transition-colors font-semibold text-lg"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features for complete smart lock control
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            {[
              {
                icon: Key,
                title: "Password Management",
                description:
                  "Create temporary, dynamic, and offline passwords with custom validity periods.",
                color: "purple",
              },
              {
                icon: Users,
                title: "User Management",
                description:
                  "Add and manage users with different roles and access permissions.",
                color: "pink",
              },
              {
                icon: Smartphone,
                title: "Multiple Unlock Methods",
                description:
                  "Support for passwords, fingerprints, cards, Bluetooth, and face recognition.",
                color: "green",
              },
              {
                icon: Shield,
                title: "Advanced Security",
                description:
                  "Duress alarms, security logs, and real-time monitoring.",
                color: "red",
              },
              {
                icon: Clock,
                title: "Complete History",
                description:
                  "Track all unlock attempts and security events with detailed logs.",
                color: "yellow",
              },
              {
                icon: Lock,
                title: "Remote Control",
                description:
                  "Lock and unlock your door from anywhere in the world.",
                color: "indigo",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow"
              >
                <div
                  className={`inline-flex p-4 bg-${feature.color}-100 rounded-xl mb-4`}
                >
                  <feature.icon
                    className={`w-8 h-8 text-${feature.color}-600`}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose Our Platform?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Built on top of Tuya&apos;s robust IoT platform, our smart lock
                management system provides enterprise-grade security with
                consumer-friendly ease of use.
              </p>

              <div className="space-y-4">
                {[
                  "Real-time device status monitoring",
                  "Cloud-to-cloud secure integration",
                  "Comprehensive API coverage",
                  "Mobile-responsive design",
                  "Advanced security features",
                  "Detailed access logs and analytics",
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-linear-to-br from-blue-100 to-purple-100 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Door Unlocked
                      </p>
                      <p className="text-sm text-gray-500">Just now</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    John Doe used fingerprint to unlock the front door
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-500">
                      Active Users
                    </span>
                    <span className="text-2xl font-bold text-gray-900">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Temp Passwords
                    </span>
                    <span className="text-2xl font-bold text-gray-900">8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-linear-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Take control of your smart lock today. It only takes a minute to set
            up.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold text-lg shadow-xl"
          >
            Access Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <Lock className="w-6 h-6" />
              <span className="font-semibold text-lg">Smart Lock Manager</span>
            </div>
            <div className="text-sm text-gray-400">
              Powered by Tuya IoT Platform • © 2024 All rights reserved
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
