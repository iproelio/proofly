
import { useState, useCallback } from 'react';
import { ProofRecording, SessionContext, GPSCoord, FailureFlags } from '../types';
import { saveRecording, getAllRecordings, deleteRecording } from '../services/storage';
import { generateSHA256 } from '../services/hash';

export const useProofStorage = () => {
  const [recordings, setRecordings] = useState<ProofRecording[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const fetchRecordings = useCallback(async () => {
    const list = await getAllRecordings();
    setRecordings(list);
  }, []);

  const storeProof = useCallback(async (
    session: SessionContext,
    blob: Blob,
    metadata: {
      gpsTimeline: GPSCoord[],
      failureFlags: FailureFlags,
      startedAt: number,
      endedAt: number
    }
  ) => {
    setIsSaving(true);
    try {
      const hash = await generateSHA256(blob);
      const proofId = `proof_${Date.now()}`;
      
      const recording: ProofRecording = {
        id: proofId,
        jobId: session.job.id,
        businessId: session.business.id,
        employeeId: session.employee.id,
        clientId: session.job.clientId,
        startedAt: metadata.startedAt,
        endedAt: metadata.endedAt,
        gpsStart: metadata.gpsTimeline[0] || null,
        gpsTimeline: metadata.gpsTimeline,
        videoBlob: blob,
        videoHash: hash,
        metadataHash: await generateSHA256(new Blob([JSON.stringify(metadata)])),
        uploadStatus: 'pending',
        failureFlags: metadata.failureFlags
      };

      await saveRecording(recording);
      await fetchRecordings();
      return recording;
    } finally {
      setIsSaving(false);
    }
  }, [fetchRecordings]);

  const removeProof = useCallback(async (id: string) => {
    await deleteRecording(id);
    await fetchRecordings();
  }, [fetchRecordings]);

  return {
    recordings,
    isSaving,
    storeProof,
    fetchRecordings,
    removeProof
  };
};
