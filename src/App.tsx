/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { JoinUsModal } from "./components/JoinUsModal";
import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Support from "./pages/Support";
import OverallLeads from "./pages/OverallLeads";
import Join from "./pages/Join";
import Tools from "./pages/Tools";
import QRCodeGenerator from "./pages/tools/QRCodeGenerator";
import ImageToPDF from "./pages/tools/ImageToPDF";
import ImageConverter from "./pages/tools/ImageConverter";
import Whiteboard from "./pages/tools/Whiteboard";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";

function Layout() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin") || pathname === "/login";

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdmin && <Navbar />}
      
      <div className="grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/support" element={<Support />} />
          <Route path="/overall-leads" element={<OverallLeads />} />
          <Route path="/join" element={<Join />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/qr-generator" element={<QRCodeGenerator />} />
          <Route path="/tools/image-to-pdf" element={<ImageToPDF />} />
          <Route path="/tools/image-converter" element={<ImageConverter />} />
          <Route path="/tools/whiteboard" element={<Whiteboard />} />
          
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>

      {!isAdmin && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout />
    </Router>
  );
}

