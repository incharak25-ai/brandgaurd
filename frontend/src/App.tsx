import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { DocumentListView } from './components/DocumentListView';
import { DocumentDetailView } from './components/DocumentDetailView';
import { ApprovalQueueView } from './components/ApprovalQueueView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { ClaimsRegisterView } from './components/ClaimsRegisterView';
import { TerminologyView } from './components/TerminologyView';
import { AuditLogView } from './components/AuditLogView';
import { NewDocumentModal } from './components/NewDocumentModal';
import { api } from './api/client';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  const handleSelectDocument = (id: number) => {
    setSelectedDocId(id);
    setCurrentTab('document_detail');
  };

  const handleBackFromDetail = () => {
    setSelectedDocId(null);
    setCurrentTab('documents');
  };

  const handleDocumentCreated = (id: number) => {
    setSelectedDocId(id);
    setCurrentTab('document_detail');
  };

  const handleSeedDemoData = async () => {
    try {
      setIsSeeding(true);
      await api.seedDemoData(true);
      setSeedNotice('Fictional demo data populated successfully!');
      setTimeout(() => setSeedNotice(null), 5000);
      // Refresh current tab
      if (currentTab === 'document_detail') {
        setCurrentTab('dashboard');
        setSelectedDocId(null);
      } else {
        // Trigger re-render by switching
        const tab = currentTab;
        setCurrentTab('dashboard');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to seed demo data');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setSelectedDocId(null);
          setCurrentTab(tab);
        }}
        onOpenNewDoc={() => setIsNewDocModalOpen(true)}
        onSeedData={handleSeedDemoData}
        isSeeding={isSeeding}
      />

      {seedNotice && (
        <div className="bg-emerald-600 text-white text-center py-2 text-xs font-bold animate-fade-in">
          {seedNotice}
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            onSelectDocument={handleSelectDocument}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'documents' && (
          <DocumentListView
            onSelectDocument={handleSelectDocument}
            onOpenNewDoc={() => setIsNewDocModalOpen(true)}
          />
        )}

        {currentTab === 'document_detail' && selectedDocId !== null && (
          <DocumentDetailView
            documentId={selectedDocId}
            onBack={handleBackFromDetail}
          />
        )}

        {currentTab === 'reviews' && (
          <ApprovalQueueView onSelectDocument={handleSelectDocument} />
        )}

        {currentTab === 'kb' && <KnowledgeBaseView />}

        {currentTab === 'claims' && <ClaimsRegisterView />}

        {currentTab === 'terminology' && <TerminologyView />}

        {currentTab === 'audit' && <AuditLogView />}
      </main>

      <NewDocumentModal
        isOpen={isNewDocModalOpen}
        onClose={() => setIsNewDocModalOpen(false)}
        onCreated={handleDocumentCreated}
      />

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>BrandGuard © 2026 • Evidence-Backed Brand Compliance Platform</p>
      </footer>
    </div>
  );
};

export default App;
