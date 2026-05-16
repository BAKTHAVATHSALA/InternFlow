const generatePdf = async (templateName, data) => {
  console.log(`[PDF GENERATOR] Generating PDF for ${templateName}`);
  // Mock PDF generation
  return Buffer.from('Mock PDF Content');
};

module.exports = { generatePdf };
