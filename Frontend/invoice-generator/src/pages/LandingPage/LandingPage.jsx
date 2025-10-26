import Faqs from "../../components/landing/Faqs";
import Features from "../../components/landing/Features";
import Footer from "../../components/landing/Footer";
import Header from "../../components/landing/Header";
import Hero from "../../components/landing/Hero";
import Testimonials from "../../components/landing/Testimonials";
const LandingPage = () => {
  return <div className="bg-[#ffffff] text-gray-600">
  <Header />
  <main className="mb-[100vh]">
    <Hero />
    <Features />
    <Testimonials />
    <Faqs />
    
    <Footer />
  </main>
  </div>;
};

export default LandingPage;
 