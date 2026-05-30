import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>CBNU Match</h1>
        <p>충북대학교 학생들을 위한 안전한 목적 지향형 매칭 플랫폼</p>
      </header>
      <main className={styles.main}>
        <div className={styles.categoryCard}>
          <h2>🏃‍♂️ 스포츠 / 운동</h2>
          <p>배드민턴, 헬스, 러닝 메이트를 찾아보세요.</p>
        </div>
        <div className={styles.categoryCard}>
          <h2>🏆 공모전 / 대회</h2>
          <p>해커톤, 기획전 등 프로젝트 팀원을 구해보세요.</p>
        </div>
        <div className={styles.categoryCard}>
          <h2>📚 스터디</h2>
          <p>전공, 어학, 자격증 스터디원을 모집하세요.</p>
        </div>
      </main>
    </div>
  );
}
