import Script from 'next/script';
import AuthPanel from '@/component/AuthPanel';

export default function AuthPage() {
  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <AuthPanel />
    </>
  );
}
