const uploadFile = async (fileBuffer, fileName, folder) => {
  console.log(`[STORAGE SERVICE] Uploading ${fileName} to ${folder}`);
  // Mock Supabase storage upload
  return `https://supabase.co/storage/v1/object/public/internflow/${folder}/${fileName}`;
};

module.exports = { uploadFile };
