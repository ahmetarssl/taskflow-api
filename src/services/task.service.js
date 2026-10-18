// Servis katmanı. Doğrulama, varsayılan değerler, id üretme ve CRUD işlemlerinin hepsi burada.
// Dosyaya direkt erişmiyoruz, okuma/yazma için store.js'i kullanıyoruz.

const store = require('../data/store');
const ApiError = require('../utils/ApiError');

const VALID_STATUSES = ['pending', 'in-progress', 'completed'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];
const DEFAULT_STATUS = 'pending';
const DEFAULT_PRIORITY = 'medium';

// kullanıcının değiştirebileceği alanlar. id, createdAt ve updatedAt'i sistem kendisi ayarlıyor
const EDITABLE_FIELDS = ['title', 'description', 'status', 'priority', 'assignee', 'project'];
const STRING_FIELDS = ['title', 'description', 'assignee', 'project'];

// URL'den gelen id string olduğu için sayıya çeviriyoruz.
// "abc" veya -3 gibi bir id zaten olamayacağı için direkt 404 veriyorum.
const parseTaskId = (rawId) => {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(404, 'Görev bulunamadı');
  }
  return id;
};

// status ve priority için ortak kontrol, hatalıysa geçerli değerleri mesaja ekliyor
const validateEnumField = (fieldName, value, allowedValues) => {
  if (value !== undefined && !allowedValues.includes(value)) {
    throw new ApiError(
      400,
      `Geçersiz ${fieldName} değeri: "${value}". Geçerli değerler: ${allowedValues.join(', ')}`
    );
  }
};

const validateStringFields = (payload) => {
  STRING_FIELDS.forEach((field) => {
    if (payload[field] !== undefined && typeof payload[field] !== 'string') {
      throw new ApiError(400, `"${field}" alanı metin (string) olmalıdır`);
    }
  });
};

// POST ve PUT ikisi de bunu kullanıyor.
// PUT'ta (isPartial = true) title zorunlu değil ama gönderilirse boş olmamalı.
const validateTaskPayload = (payload, { isPartial = false } = {}) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ApiError(400, 'İstek gövdesi geçerli bir JSON nesnesi olmalıdır');
  }

  validateStringFields(payload);

  const titleProvided = payload.title !== undefined;
  if ((!isPartial || titleProvided) && (!titleProvided || payload.title.trim() === '')) {
    throw new ApiError(400, '"title" alanı zorunludur ve boş bırakılamaz');
  }

  validateEnumField('status', payload.status, VALID_STATUSES);
  validateEnumField('priority', payload.priority, VALID_PRIORITIES);
};

// gövdeden sadece izin verilen alanları alıyoruz, başka bir şey gelirse görmezden geliniyor
const pickEditableFields = (payload) =>
  EDITABLE_FIELDS.reduce((picked, field) => {
    if (payload[field] !== undefined) {
      picked[field] = typeof payload[field] === 'string' ? payload[field].trim() : payload[field];
    }
    return picked;
  }, {});

// en büyük id'yi bulup 1 ekliyoruz, liste boşsa 1'den başlıyor
const generateNextId = (tasks) => tasks.reduce((maxId, task) => Math.max(maxId, task.id), 0) + 1;

// GET, PUT ve DELETE'te aynı arama tekrar etmesin diye ayrı fonksiyon yaptım
const findTaskIndexOrFail = (tasks, id) => {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    throw new ApiError(404, 'Görev bulunamadı');
  }
  return index;
};

const getAllTasks = async () => store.readTasks();

const getTaskById = async (rawId) => {
  const id = parseTaskId(rawId);
  const tasks = await store.readTasks();
  return tasks[findTaskIndexOrFail(tasks, id)];
};

const createTask = async (payload) => {
  validateTaskPayload(payload);

  const tasks = await store.readTasks();
  const now = new Date().toISOString();
  const fields = pickEditableFields(payload);

  // gönderilmeyen alanlara varsayılan değer veriyoruz (status -> pending, priority -> medium)
  const newTask = {
    id: generateNextId(tasks),
    title: fields.title,
    description: fields.description ?? '',
    status: fields.status ?? DEFAULT_STATUS,
    priority: fields.priority ?? DEFAULT_PRIORITY,
    assignee: fields.assignee ?? '',
    project: fields.project ?? '',
    createdAt: now,
    updatedAt: now,
  };

  tasks.push(newTask);
  await store.writeTasks(tasks);
  return newTask;
};

// kısmi güncelleme: eski görevin üstüne sadece gelen alanları yazıyoruz, updatedAt her seferinde yenileniyor
const updateTask = async (rawId, payload) => {
  const id = parseTaskId(rawId);
  validateTaskPayload(payload, { isPartial: true });

  const tasks = await store.readTasks();
  const index = findTaskIndexOrFail(tasks, id);

  const updatedTask = {
    ...tasks[index],
    ...pickEditableFields(payload),
    updatedAt: new Date().toISOString(),
  };

  tasks[index] = updatedTask;
  await store.writeTasks(tasks);
  return updatedTask;
};

const deleteTask = async (rawId) => {
  const id = parseTaskId(rawId);
  const tasks = await store.readTasks();
  const index = findTaskIndexOrFail(tasks, id);

  tasks.splice(index, 1);
  await store.writeTasks(tasks);
  return id;
};

module.exports = {
  VALID_STATUSES,
  VALID_PRIORITIES,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  validateTaskPayload,
};
