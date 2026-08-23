/**
 * Driving Licence Scanner Service
 * 
 * This service simulates the extraction of details from a driving licence image.
 * When the real OCR backend is ready, replace this mock implementation with an API call.
 */

export interface LicenseData {
  fullName?: string;
  licenseNumber?: string;
  dateOfBirth?: string;
  expiryDate?: string;
  address?: string;
}

export const scanLicenseImage = async (imageUri: string): Promise<LicenseData> => {
  return new Promise((resolve, reject) => {
    // Simulate network delay for OCR processing
    setTimeout(() => {
      try {
        // DEMO / MOCK ONLY
        // In a real implementation, this would send `imageUri` to an OCR backend
        // and parse the response into the LicenseData format.
        
        const mockExtractedData: LicenseData = {
          fullName: 'Raj Patel',
          licenseNumber: 'DL-14202300123',
          dateOfBirth: '15/04/1998',
          expiryDate: '14/04/2038',
          // address is purposely left undefined to demonstrate partial extraction handling
        };

        resolve(mockExtractedData);
      } catch (error) {
        reject(new Error('Failed to process licence image.'));
      }
    }, 2000); // 2-second simulated delay
  });
};
