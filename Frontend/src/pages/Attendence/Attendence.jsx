import React from 'react'
import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

const  Attendence = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Everything here shifts right by sidebar width */}
      <div className="md:ml-[280px]">
        <Navbar onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <div className="space-y-4 md:space-y-6">

            {/* Your page content goes here */}
            <h1 className="text-2xl font-bold">Welcome to Attendence  Page</h1>

          </div>
        </main>
      </div>
    </div>
  );
};

export default  Attendence;