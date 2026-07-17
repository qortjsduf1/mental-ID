import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './', // GitHub Pages 배포 시 도메인 서브경로 파일 깨짐 방지용 상대경로 옵션
  plugins: [react()],
})
