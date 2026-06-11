import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n' // i18n সেটআপ ইমপোর্ট করা হলো
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Query Client তৈরি করা হলো
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // বারবার উইন্ডো চেঞ্জ করলে যেন অযথা API কল না হয়
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)