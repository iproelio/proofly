
import { useState, useCallback } from 'react';
import { ProofRecording } from '../types';
import { saveRecording } from '../services/storage';

export const useProofUploader = (onUpdate: () => void) => {
  const [activeUploads, setActiveUploads] = useState<Set<string>>(new Set());

  const uploadProof = useCallback(async (proof: ProofRecording) => {
    if (proof.uploadStatus === 'uploaded' || activeUploads.has(proof.id)) return;

    // Start Uploading
    setActiveUploads(prev => new Set(prev).add(proof.id));
    const uploadingProof: ProofRecording = { ...proof, uploadStatus: 'uploading' };
    await saveRecording(uploadingProof);
    onUpdate();

    // Mock Upload Delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

    // Determine Result (90% success rate for demo)
    const isSuccess = Math.random() > 0.1;
    const finalStatus = isSuccess ? 'uploaded' : 'failed';

    const finalProof: ProofRecording = { ...proof, uploadStatus: finalStatus };
    await saveRecording(finalProof);
    
    setActiveUploads(prev => {
      const next = new Set(prev);
      next.delete(proof.id);
      return next;
    });
    onUpdate();
    
    return isSuccess;
  }, [activeUploads, onUpdate]);

  const uploadAll = useCallback(async (proofs: ProofRecording[]) => {
    const pending = proofs.filter(p => p.uploadStatus !== 'uploaded');
    await Promise.all(pending.map(p => uploadProof(p)));
  }, [uploadProof]);

  return {
    uploadProof,
    uploadAll,
    isAnyUploading: activeUploads.size > 0,
    activeUploads
  };
};
