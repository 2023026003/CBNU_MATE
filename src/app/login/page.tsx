'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import styles from './login.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const validateEmail = (email: string) => {
    if (!email) return '이메일을 입력해주세요.'
    if (!email.endsWith('@cbnu.ac.kr') && !email.endsWith('@chungbuk.ac.kr')) {
      return '충북대학교 이메일(@cbnu.ac.kr, @chungbuk.ac.kr)만 사용 가능합니다.'
    }
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    const validationError = validateEmail(email)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      })

      if (error) {
        throw error
      }

      setMessage('인증 메일이 발송되었습니다. 메일함을 확인해주세요.')
      // Store email in sessionStorage to pre-fill on verify page
      sessionStorage.setItem('cbnu_auth_email', email)
      
      // Delay redirect slightly to show message
      setTimeout(() => {
        router.push(`/login/verify?email=${encodeURIComponent(email)}`)
      }, 1500)

    } catch (err: any) {
      setError(err.message || '인증 메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>CBNU Match</h1>
          <p className={styles.subtitle}>충북대학교 학생들을 위한 매칭 플랫폼</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>학교 이메일</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null)
              }}
              placeholder="id@cbnu.ac.kr"
              className={styles.input}
              disabled={loading || !!message}
              required
            />
            {error && <p className={styles.errorText}>{error}</p>}
          </div>

          <button 
            type="submit" 
            className={styles.button}
            disabled={loading || !!message}
          >
            {loading ? '인증 메일 발송 중...' : '인증 번호 받기'}
          </button>
          
          {message && <p className={styles.successText}>{message}</p>}
        </form>
      </div>
    </div>
  )
}
