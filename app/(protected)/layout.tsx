import { Navbar } from '@/components/layout/Navbar';
import { ModalProvider } from '@/contexts/ModalContext';
import { Modal } from '@/components/ui';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModalProvider>
      <Navbar />
      <main className="min-h-screen" style={{ background: '#000' }}>
        {children}
      </main>
      <Modal />
    </ModalProvider>
  );
}
