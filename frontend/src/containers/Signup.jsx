import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../provider/AuthProvider'
import { useToast } from '../provider/ToastProvider'

const Signup = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { push } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password || !confirmPassword) {
      push({ type: 'error', message: 'All fields are required' })
      return
    }
    if (password !== confirmPassword) {
      push({ type: 'error', message: 'Passwords do not match' })
      return
    }
    setSubmitting(true)
    try {
      // Reuse login handler but expect your AuthProvider.onLogin to handle signup if routed accordingly
      await login({ email, password, signup: true })
      push({ type: 'success', message: 'Account created' })
      navigate('/')
    } catch (err) {
      push({ type: 'error', message: 'Signup failed' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0b1220] to-[#0b0f17] p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 text-white shadow-2xl shadow-black/30">
        <h1 className="text-2xl font-bold mb-6 text-center">Create account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-white/80">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/15 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-white/80">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/15 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-white/80">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/15 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 transition font-semibold disabled:opacity-60"
          >
            {submitting ? 'Creating...' : 'Create account'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-white/70">
          Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup


