
import React, { Suspense, ErrorBoundary } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Stakeholders from "@/components/Stakeholders";
import CallToAction from "@/components/CallToAction";

// Simple error boundary component
class ErrorBoundaryComponent extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Index page error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">The page couldn't be displayed properly.</p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-leaf text-white rounded-md hover:bg-leaf-dark"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-leaf border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const Index = () => {
  return (
    <ErrorBoundaryComponent>
      <Suspense fallback={<LoadingFallback />}>
        <div className="min-h-screen bg-white">
          <Navbar />
          <Hero />
          <Features />
          <Stakeholders />
          <CallToAction />
          <Footer />
        </div>
      </Suspense>
    </ErrorBoundaryComponent>
  );
};

export default Index;
