/** طابور وحدات AdSense الذي يعرّفه سكربت الناشر على النافذة */
declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export {};
