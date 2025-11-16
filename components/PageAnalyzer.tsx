'use client'

import React, { useState, useEffect } from 'react'
import { Globe, Clock, FileText, Heading, Link2, XCircle, CheckCircle } from 'lucide-react'

interface AnalysisResults {
  html_version: string
  title: string
  headings: {
    h1: number
    h2: number
    h3: number
    h4: number
    h5: number
    h6: number
  }
  links: {
    internal: number
    external: number
    inaccessible: number
  }
  has_login_form: boolean
}

export default function PageAnalyzer() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [error, setError] = useState<{ message: string } | null>(null)
  const [idempotencyKey, setIdempotencyKey] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [timerActive, setTimerActive] = useState(false)

  // Generate idempotency key
  const generateIdempotencyKey = () => {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  }

  // Generate request ID
  const generateRequestId = () => {
    return `req-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  }

  // Initialize idempotency key on mount
  useEffect(() => {
    setIdempotencyKey(generateIdempotencyKey())
  }, [])

  // Timer countdown
  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timerActive && timeRemaining === 0) {
      // Reset idempotency key after 30 seconds
      setIdempotencyKey(generateIdempotencyKey())
      setTimerActive(false)
    }
  }, [timeRemaining, timerActive])

  const analyzeUrl = async () => {
    if (!url.trim()) {
      setError({ message: 'Please enter a valid URL' })
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)
    // next URL need to use after 5 seconds, 5 second wait time to reduce server load.
    setTimeRemaining(5)
    setTimerActive(true)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          idempotencyKey,
          requestId: generateRequestId()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      setResults(data)
    } catch (err: any) {
      setError({
        message: err.message || 'Failed to analyze the URL'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-normal text-gray-800">Web page analyzer</h1>
        </div>
        {timerActive && timeRemaining > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">
              Wait time for next WebPage input in: {timeRemaining}s
            </span>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Report Header */}
        <div className="mb-6">
          <h2 className="text-xl text-gray-700">
            Report from {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}, {new Date().toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </h2>
        </div>

        {/* URL Input */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              // Replaced deprecated onKeyPress with onKeyDown
              onKeyDown={(e) => e.key === 'Enter' && analyzeUrl()}
              placeholder="Enter web page URL"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={analyzeUrl}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6 flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Analysis Failed</h3>
              <p className="text-red-700">{error.message}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-medium text-gray-800">
                Analysis Results
              </h2>
            </div>

            {/* Document Information Table */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Document Information
              </h3>
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Property</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">HTML Version</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{results.html_version}</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">Page Title</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{results.title}</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">Has Login Form</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {results.has_login_form ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="text-sm font-medium text-green-600">Yes</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-gray-400" />
                              <span className="text-sm font-medium text-gray-600">No</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Headings Table */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Heading className="w-5 h-5" />
                Heading Levels
              </h3>
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Heading Level</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Count</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Visual</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(results.headings).map(([level, count]) => (
                      <tr key={level} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-700 uppercase">{level}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{count}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden max-w-xs">
                              <div
                                className="h-full bg-blue-500 transition-all rounded-full"
                                style={{ width: `${Math.min((count / 10) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Links Table */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                Links Analysis
              </h3>
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Link Type</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Count</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">Internal Links</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{results.links.internal}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Active
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">External Links</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{results.links.external}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">Inaccessible Links</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{results.links.inaccessible}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          results.links.inaccessible === 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {results.links.inaccessible === 0 ? 'Good' : 'Issues Found'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Analyzing your webpage...</p>
          </div>
        )}
      </div>
    </div>
  )
}