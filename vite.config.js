import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/mental-ID/', // GitHub Pages 배포 시 서브디렉토리 파일 깨짐 방지용 절대 경로 지정
  plugins: [react()],
})
