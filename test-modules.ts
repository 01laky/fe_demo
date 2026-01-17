// Test file to check if TypeScript can see modules
import { BrowserRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

// If you see errors here, TypeScript editor is not seeing PnP modules
// If no errors, everything is working!
export const test = {
  BrowserRouter,
  toast,
  useTranslation
}
