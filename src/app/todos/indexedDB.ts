import type { TodoTemplate, TodoInstance } from '../../types/todo';

const DB_NAME = 'TodoDB';
const DB_VERSION = 2;
const STORE_TEMPLATES = 'templates';
const STORE_INSTANCES = 'instances';

class IndexedDBService {
  private db: IDBDatabase | null = null;

  private async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = reject;
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = () => {
        const db = request.result;

        // Store для шаблонов
        if (!db.objectStoreNames.contains(STORE_TEMPLATES)) {
          const store = db.createObjectStore(STORE_TEMPLATES, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Store для экземпляров
        if (!db.objectStoreNames.contains(STORE_INSTANCES)) {
          const store = db.createObjectStore(STORE_INSTANCES, { keyPath: 'id' });
          store.createIndex('templateId', 'templateId', { unique: false });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('date_template', ['date', 'templateId'], { unique: true });
          store.createIndex('completed', 'completed', { unique: false });
        }
      };
    });
  }

  // Шаблоны
  async getAllTemplates(): Promise<TodoTemplate[]> {
    const db = await this.openDB();
    return new Promise(resolve => {
      const transaction = db.transaction(STORE_TEMPLATES, 'readonly');
      const store = transaction.objectStore(STORE_TEMPLATES);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }
  async updateTemplateCompletion(
    templateId: string,
    date: string,
    completed: boolean
  ): Promise<void> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_TEMPLATES, 'readwrite');
      const store = transaction.objectStore(STORE_TEMPLATES);

      // Получаем шаблон
      const getRequest = store.get(templateId);

      getRequest.onsuccess = () => {
        const template = getRequest.result;
        if (!template) {
          reject(new Error(`Template ${templateId} not found`));
          return;
        }

        // Инициализируем completedDates если нет
        if (!template.completedDates) {
          template.completedDates = [];
        }

        // Форматируем дату (YYYY-MM-DD)
        const formattedDate = date.split('T')[0];

        if (completed) {
          // Добавляем дату если ее еще нет
          if (!template.completedDates.includes(formattedDate)) {
            template.completedDates.push(formattedDate);
            template.lastCompleted = new Date().toISOString();
          }
        } else {
          // Удаляем дату если задача отменена
          template.completedDates = template.completedDates.filter(d => d !== formattedDate);
        }

        // Сортируем даты
        template.completedDates.sort();

        // Обновляем шаблон
        const updateRequest = store.put(template);

        updateRequest.onsuccess = () => {
          console.log('✅ Template completion updated:', {
            templateId,
            date: formattedDate,
            completed,
            totalCompletedDates: template.completedDates.length,
          });
          resolve();
        };

        updateRequest.onerror = event => {
          console.error('❌ Error updating template completion:', event);
          reject(event);
        };
      };

      getRequest.onerror = event => {
        console.error('❌ Error getting template:', event);
        reject(event);
      };
    });
  }

  async saveTemplate(template: TodoTemplate): Promise<void> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_TEMPLATES, STORE_INSTANCES], 'readwrite');
      const templateStore = transaction.objectStore(STORE_TEMPLATES);
      const instanceStore = transaction.objectStore(STORE_INSTANCES);
      const templateToSave = {
        ...template,
        completedDates: template.completedDates || [],
      };
      const saveRequest = templateStore.put(templateToSave);

      saveRequest.onsuccess = () => {
        const index = instanceStore.index('templateId');

        // Важно: используем openKeyCursor или openCursor с range
        const keyRange = IDBKeyRange.only(template.id);
        const cursorRequest = index.openCursor(keyRange);

        let instancesFound = 0;

        cursorRequest.onsuccess = event => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

          if (cursor) {
            instancesFound++;
            const instance = cursor.value;
            // Обновляем экземпляр
            const updatedInstance = {
              ...instance,
              title: template.title,
              time: template.time,
              count: template.count || instance.count || '1',
            };

            const updateRequest = cursor.update(updatedInstance);

            updateRequest.onsuccess = () => {
              cursor.continue();
            };

            updateRequest.onerror = updateEvent => {
              console.error(
                `💾 SAVE TEMPLATE - Error updating instance ${instancesFound}:`,
                updateEvent
              );
              cursor.continue();
            };
          } else {
            resolve();
          }
        };

        cursorRequest.onerror = event => {
          console.error('💾 SAVE TEMPLATE - Cursor error:', event);
          // Даже если ошибка курсора, шаблон уже сохранен
          resolve();
        };
      };

      saveRequest.onerror = event => {
        console.error('💾 SAVE TEMPLATE - Error saving template:', event);
        reject(event);
      };

      transaction.onerror = event => {
        console.error('💾 SAVE TEMPLATE - Transaction error:', event);
        // Не reject'им здесь, т.к. шаблон может быть уже сохранен
        resolve();
      };
    });
  }
  async deleteTemplate(id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_TEMPLATES, 'readwrite');
      const store = transaction.objectStore(STORE_TEMPLATES);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = reject;
    });
  }

  // Экземпляры
  async getInstancesForDate(date: string): Promise<TodoInstance[]> {
    const db = await this.openDB();
    return new Promise(resolve => {
      const transaction = db.transaction(STORE_INSTANCES, 'readonly');
      const store = transaction.objectStore(STORE_INSTANCES);
      const index = store.index('date');
      const request = index.getAll(date);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }

  async saveInstance(instance: TodoInstance): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_INSTANCES, 'readwrite');
      const store = transaction.objectStore(STORE_INSTANCES);
      const request = store.put(instance);
      request.onsuccess = () => resolve();
      request.onerror = reject;
    });
  }

  async getInstance(date: string, templateId: string): Promise<TodoInstance | null> {
    const db = await this.openDB();
    return new Promise(resolve => {
      const transaction = db.transaction(STORE_INSTANCES, 'readonly');
      const store = transaction.objectStore(STORE_INSTANCES);
      const index = store.index('date_template');
      const request = index.get([date, templateId]);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }

  // Утилиты
  async deleteInstancesForTemplate(templateId: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_INSTANCES, 'readwrite');
      const store = transaction.objectStore(STORE_INSTANCES);
      const index = store.index('templateId');
      const request = index.openCursor(IDBKeyRange.only(templateId));

      request.onsuccess = event => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = reject;
    });
  }

  async getInstancesInDateRange(startDate: string, endDate: string): Promise<TodoInstance[]> {
    const db = await this.openDB();
    return new Promise(resolve => {
      const transaction = db.transaction(STORE_INSTANCES, 'readonly');
      const store = transaction.objectStore(STORE_INSTANCES);
      const index = store.index('date');
      const range = IDBKeyRange.bound(startDate, endDate);
      const request = index.getAll(range);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }
}

export const indexedDBService = new IndexedDBService();
