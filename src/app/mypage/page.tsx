'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import styles from './mypage.module.css'

export default function MyPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  
  const [formData, setFormData] = useState({
    nickname: '',
    major: '',
    student_id: '',
    bio: '',
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
      } else if (data) {
        setProfile(data)
        setFormData({
          nickname: data.nickname || '',
          major: data.major || '',
          student_id: data.student_id || '',
          bio: data.bio || '',
        })
      }
      setLoading(false)
    }

    loadProfile()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다.')

      const { error } = await supabase
        .from('profiles')
        .update({
          nickname: formData.nickname,
          major: formData.major,
          student_id: formData.student_id,
          bio: formData.bio,
        })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ text: '프로필이 성공적으로 저장되었습니다.', type: 'success' })
    } catch (err: any) {
      setMessage({ text: err.message || '저장 중 오류가 발생했습니다.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>로딩 중...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>마이페이지</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          로그아웃
        </button>
      </header>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>나의 매너 온도</h2>
        <div className={styles.temperature}>
          <span className={styles.tempValue}>{profile?.manner_temperature}°C</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            기본 온도 36.5°C 에서 시작하여 매너 평가에 따라 온도가 올라가거나 내려갑니다.
          </span>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>프로필 정보 수정</h2>
        <form onSubmit={handleSave}>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="nickname" className={styles.label}>닉네임</label>
              <input
                id="nickname"
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="major" className={styles.label}>학과/전공</label>
              <input
                id="major"
                type="text"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="student_id" className={styles.label}>학번</label>
              <input
                id="student_id"
                type="text"
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                className={styles.input}
                required
              />
            </div>
            
            <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="bio" className={styles.label}>한줄 소개 (선택)</label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className={styles.textarea}
                placeholder="나를 표현할 수 있는 간단한 소개를 적어주세요."
                maxLength={200}
              />
            </div>
          </div>

          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? '저장 중...' : '변경사항 저장'}
          </button>
          
          {message && (
            <p className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
