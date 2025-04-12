
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processQRCodeFromFile } from '../qrCodeScanner';
import QrScanner from 'qr-scanner';

// Mock the QR Scanner library
vi.mock('qr-scanner', () => ({
  default: {
    scanImage: vi.fn(),
  }
}));

describe('QR Code Scanner Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('processes a valid QR code from file', async () => {
    // Mock successful scan with data
    const mockResult = { data: 'https://example.com/qr-data' };
    QrScanner.scanImage = vi.fn().mockResolvedValue(mockResult);
    
    // Create a mock file
    const mockFile = new File(['dummy content'], 'qr-image.png', { type: 'image/png' });
    
    const result = await processQRCodeFromFile(mockFile);
    
    expect(QrScanner.scanImage).toHaveBeenCalledWith(mockFile, { returnDetailedScanResult: true });
    expect(result).toBe('https://example.com/qr-data');
  });

  it('returns null when no QR code is found', async () => {
    // Mock scan with no QR code detected
    QrScanner.scanImage = vi.fn().mockResolvedValue(null);
    
    // Create a mock file
    const mockFile = new File(['dummy content'], 'not-a-qr.png', { type: 'image/png' });
    
    const result = await processQRCodeFromFile(mockFile);
    
    expect(QrScanner.scanImage).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('handles errors during scanning', async () => {
    // Mock error during scan
    QrScanner.scanImage = vi.fn().mockRejectedValue(new Error('Invalid image data'));
    
    // Create a mock file
    const mockFile = new File(['dummy content'], 'corrupted.png', { type: 'image/png' });
    
    const result = await processQRCodeFromFile(mockFile);
    
    expect(QrScanner.scanImage).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('returns null for empty or undefined results', async () => {
    // Mock undefined data in result
    QrScanner.scanImage = vi.fn().mockResolvedValue({ });
    
    // Create a mock file
    const mockFile = new File(['dummy content'], 'qr-image.png', { type: 'image/png' });
    
    const result = await processQRCodeFromFile(mockFile);
    
    expect(QrScanner.scanImage).toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
