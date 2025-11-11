import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url, idempotencyKey, requestId } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    const email = process.env.EMAIL
    const authToken = process.env.AUTH_TOKEN

    if (!email || !authToken) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing credentials' },
        { status: 500 }
      )
    }

    const response = await fetch(`${apiUrl}/api/v1/analyzes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({
        requestId,
        email,
        url
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { 
          error: `HTTP ${response.status}: ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to analyze URL',
        details: error.message 
      },
      { status: 500 }
    )
  }
}