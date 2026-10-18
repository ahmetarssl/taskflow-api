// Görev controller'ı. İsteği alıp servise gönderiyor, gelen sonucu JSON olarak geri dönüyor.
// İş mantığını buraya koymadım, hepsi task.service.js içinde.

const taskService = require('../services/task.service');

const HTTP_OK = 200;
const HTTP_CREATED = 201;

// Express 4 async fonksiyonlardaki hataları kendisi yakalamıyor.
// Bu yüzden her fonksiyonu bununla sardım, hata olursa next() ile errorHandler'a gidiyor.
const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

// başarılı yanıtlar hep aynı formatta olsun diye ortak fonksiyon
const sendSuccess = (res, statusCode, data) => {
  res.status(statusCode).json({ success: true, data });
};

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.body);
  sendSuccess(res, HTTP_CREATED, task);
});

// listede ayrıca count da döndüğü için sendSuccess kullanmadım
const getAllTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.getAllTasks();
  res.status(HTTP_OK).json({ success: true, count: tasks.length, data: tasks });
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id);
  sendSuccess(res, HTTP_OK, task);
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body);
  sendSuccess(res, HTTP_OK, task);
});

const deleteTask = asyncHandler(async (req, res) => {
  const deletedId = await taskService.deleteTask(req.params.id);
  sendSuccess(res, HTTP_OK, { message: 'Görev silindi', id: deletedId });
});

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
