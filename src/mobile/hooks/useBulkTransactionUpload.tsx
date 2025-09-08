import { useState, useCallback } from "react";
import BulkTransactionUpload from "../components/BulkTransactionUpload";
import { BulkTransactionService } from "../../../services/bulkTransactionService";

interface UseBulkUploadOptions {
  onUploadComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

export function useBulkTransactionUpload(options: UseBulkUploadOptions = {}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const openUploadModal = useCallback(
    (accountId: string, accountName: string) => {
      setCurrentAccount({ id: accountId, name: accountName });
      setIsModalVisible(true);
    },
    []
  );

  const closeUploadModal = useCallback(() => {
    setIsModalVisible(false);
    setCurrentAccount(null);
  }, []);

  const handleUploadComplete = useCallback(
    (result: any) => {
      if (result.success) {
        options.onUploadComplete?.(result);
      } else {
        options.onError?.(result.error || "Upload failed");
      }
      closeUploadModal();
    },
    [options, closeUploadModal]
  );

  // Quick upload function for programmatic uploads
  const quickUpload = useCallback(
    async (
      csvContent: string,
      accountId: string,
      userId: string,
      onProgress?: (stage: string, progress: number) => void
    ) => {
      try {
        const transactions = BulkTransactionService.parseCSV(
          csvContent,
          accountId,
          userId
        );

        if (transactions.length === 0) {
          throw new Error("No valid transactions found");
        }

        const result = await BulkTransactionService.uploadWithValidation(
          transactions,
          userId,
          { onProgress }
        );

        if (result.success) {
          options.onUploadComplete?.(result);
        } else {
          options.onError?.(result.error || "Upload failed");
        }

        return result;
      } catch (error) {
        const errorMessage = error.message || "Upload failed";
        options.onError?.(errorMessage);
        throw error;
      }
    },
    [options]
  );

  const BulkUploadModal = useCallback(() => {
    if (!isModalVisible || !currentAccount) return null;

    return (
      <BulkTransactionUpload
        accountId={currentAccount.id}
        accountName={currentAccount.name}
        onUploadComplete={handleUploadComplete}
        onClose={closeUploadModal}
      />
    );
  }, [isModalVisible, currentAccount, handleUploadComplete, closeUploadModal]);

  return {
    openUploadModal,
    closeUploadModal,
    quickUpload,
    BulkUploadModal,
    isModalVisible,
    currentAccount,
  };
}

export default useBulkTransactionUpload;
