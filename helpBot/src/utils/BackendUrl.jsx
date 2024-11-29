export const backEndUrl = async () => {
    // Define backend URLs for production and development environments
    const urls = {
      
      prod: import.meta.env.VITE_BACKEND_URL,
      dev: "http://localhost:5000",
    };
  
    try {
      // Try to connect to development server silently
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
  
      const response = await fetch(urls.dev, {
        method: "HEAD",
        cache: "no-cache",
        signal: controller.signal,
      }).catch(() => ({ ok: false })); // Catch fetch errors silently
  
      clearTimeout(timeoutId);
      return response.ok ? urls.dev : urls.prod;
    } catch {
      return urls.prod;
    }
  };