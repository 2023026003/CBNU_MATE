'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import styles from '../login.module.css'

function VerifyContent() {
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Get email from URL params or sessionStorage
    const emailParam = searchParams.get('email')
    const storedEmail = sessionStorage.getItem('cbnu_auth_email')
    
    if (emailParam) {
      setEmail(emailParam)
    } else if (storedEmail) {
      setEmail(storedEmail)
    } else {
      // If no email found, redirect back to login
      router.push('/login')
    }
  }, [searchParams, router])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || token.length !== 6) {
      setError('6자리 인증 번호를 입력해주세요.')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      })

      if (error) {
        throw error
      }

      // Successful verification
      // Check if user has a profile
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', data.user.id)
          .single()

        if (profileError || !profile?.nickname) {
          // No profile found or incomplete profile, redirect to setup
          router.push('/profile/setup')
        } else {
          // Profile exists, go to home
          router.push('/')
        }
      }

    } catch (err: any) {
      setError(err.message || '인증에 실패했습니다. 인증 번호를 확인해주세요.')
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>인증 번호 입력</h1>
          <p className={styles.subtitle}>
            <strong style={{color: 'var(--white)'}}>{email}</strong><br/>
            메일로 발송된 6자리 코드를 입력해주세요.
          </p>
        </div>

        <form onSubmit={handleVerify} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="token" className={styles.label}>인증 코드</label>
            <input
              id="token"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={token}
              onChange={(e) => {
                setToken(e.target.value.replace(/[^0-9]/g, ''))
                setError(null)
              }}
              placeholder="000000"
              className={styles.input}
              style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}
              disabled={loading}
              required
            />
            {error && <p className={styles.errorText} style={{textAlign: 'center'}}>{error}</p>}
          </div>

          <button 
            type="submit" 
            className={styles.button}
            disabled={loading || token.length !== 6}
          >
            {loading ? '확인 중...' : '인증 완료'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button 
              type="button" 
              onClick={() => router.push('/login')}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--text-muted)', 
                fontSize: '0.875rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              이메일 다시 입력하기
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.card} style={{display: 'flex', justifyContent: 'center'}}>
          <p style={{color: 'var(--text-muted)'}}>로딩 중...</p>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
