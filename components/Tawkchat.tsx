"use client"

import Script from 'next/script'

export default function Tawkchat() {
  return (
    <Script 
      id="tawk-script" 
      strategy="afterInteractive" 
      src="https://embed.tawk.to/6a23bc6ab2b8a31c33f0e759/1jqdpg0jm"
      onLoad={() => {
        try {
          const Tawk_API = (window as any).Tawk_API
          if (Tawk_API) {
            Tawk_API.onLoad = function() {
              const chatFrame = document.querySelector('#tawkchat-mobile-iframe') || document.querySelector('#tawkchat-iframe')
              if (chatFrame) {
                try {
                  chatFrame.setAttribute('allow', 'geolocation')
                } catch (_) {}
              }
            }
          }
        } catch (_) {}
      }}
    />
  )
}
