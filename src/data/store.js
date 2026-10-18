// Veri katmanı. Veritabanı kullanmadığımız için görevleri tasks.json dosyasından okuyup yine oraya yazıyoruz.
// Bu dosyanın tek işi okuma ve yazma.

const fs = require('fs/promises');
const path = require('path');

const DATA_FILE_PATH = path.join(__dirname, 'tasks.json');
const JSON_INDENT = 2;

// dosya yoksa hata vermek yerine boş liste dönüyor, ilk kayıtta dosya zaten oluşuyor
const readTasks = async () => {
  try {
    const content = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return content.trim() === '' ? [] : JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

// önce .tmp dosyasına yazıp sonra adını değiştiriyorum.
// böylece yazma yarıda kesilirse tasks.json bozulmuyor
const writeTasks = async (tasks) => {
  const tempFilePath = `${DATA_FILE_PATH}.tmp`;
  await fs.writeFile(tempFilePath, JSON.stringify(tasks, null, JSON_INDENT), 'utf-8');
  await fs.rename(tempFilePath, DATA_FILE_PATH);
};

module.exports = {
  readTasks,
  writeTasks,
};
