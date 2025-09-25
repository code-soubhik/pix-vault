import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0b1220] to-[#0b0f17] p-6">
      <div className="w-full max-w-[560px] text-center text-white rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 p-8">
        <div className="text-6xl font-extrabold tracking-wider mb-2 text-blue-400">404</div>
        <h1 className="m-0 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 mb-6 text-white/70">The page you're looking for doesn't exist or was moved.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 transition text-white font-semibold">Go Home</Link>
          <button onClick={() => window.history.back()} className="px-4 py-2 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/5 transition">Go Back</button>
        </div>
      </div>
    </div>
  )
}

export default NotFound

