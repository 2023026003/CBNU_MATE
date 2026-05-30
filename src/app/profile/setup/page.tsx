'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import styles from '../../login/login.module.css' // Reuse login styles

export default function ProfileSetupPage() {
  const [nickname, setNickname] = useState('')
  const [major, setMajor] = useState('')
  const [studentId, setStudentId] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Check if profile already exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', user.id)
        .single()
      
      if (profile?.nickname) {
        router.push('/')
      }
    }
    
    checkUser()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다.')

      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          nickname,
          major,
          student_id: studentId,
        })

      if (insertError) {
        if (insertError.code === '23505') { // Unique violation
          throw new Error('이미 사용 중인 닉네임입니다.')
        }
        throw insertError
      }

      // Success
      router.push('/')
      router.refresh()
      
    } catch (err: any) {
      setError(err.message || '프로필 생성 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card} style={{ maxWidth: '500px' }}>
        <div className={styles.header}>
          <h1 className={styles.title}>프로필 설정</h1>
          <p className={styles.subtitle}>CBNU Match에서 사용할 프로필을 완성해주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="nickname" className={styles.label}>닉네임 (필수)</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 충북대불주먹"
              className={styles.input}
              disabled={loading}
              required
              maxLength={20}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="major" className={styles.label}>학과/전공 (필수)</label>
            <input
              id="major"
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="예: 컴퓨터공학과"
              className={styles.input}
              disabled={loading}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="studentId" className={styles.label}>학번 (필수)</label>
            <input
              id="studentId"
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="예: 20학번"
              className={styles.input}
              disabled={loading}
              required
            />
            <p className={styles.subtitle} style={{fontSize: '0.75rem', marginTop: '0.25rem'}}>
              * 'OO학번' 형식으로 입력해주세요.
            </p>
          </div>

          {error && <p className={styles.errorText} style={{textAlign: 'center'}}>{error}</p>}

          <button 
            type="submit" 
            className={styles.button}
            disabled={loading || !nickname || !major || !studentId}
            style={{ marginTop: '1rem' }}
          >
            {loading ? '저장 중...' : '시작하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
