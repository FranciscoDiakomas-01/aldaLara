// db.js - VERSÃO CORRIGIDA
class SchoolDB {
  constructor() {
    this.db = null;
    this.initialized = false;
    this.initPromise = this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("EscolaAldaLaraDB", 1);

      request.onerror = (event) => {
        console.error("Erro ao abrir o banco de dados:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.initialized = true;
        console.log("Banco de dados aberto com sucesso");

        // Inicializa cursos
        this.initializeCourses().then(() => {
          resolve(this.db);
        });
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Criação da store de usuários
        if (!db.objectStoreNames.contains("users")) {
          const userStore = db.createObjectStore("users", {
            keyPath: "id",
            autoIncrement: true,
          });
          userStore.createIndex("phone", "phone", { unique: true });
          userStore.createIndex("password", "password");
          userStore.createIndex("name", "name");
        }

        // Criação da store de matrículas
        if (!db.objectStoreNames.contains("enrollments")) {
          const enrollmentStore = db.createObjectStore("enrollments", {
            keyPath: "id",
            autoIncrement: true,
          });
          enrollmentStore.createIndex("userId", "userId");
          enrollmentStore.createIndex("courseId", "courseId");
          enrollmentStore.createIndex("courseName", "courseName");
          enrollmentStore.createIndex("enrollmentDate", "enrollmentDate");
        }

        // Criação da store de cursos disponíveis
        if (!db.objectStoreNames.contains("courses")) {
          const courseStore = db.createObjectStore("courses", {
            keyPath: "id",
            autoIncrement: true,
          });
          courseStore.createIndex("name", "name", { unique: true });
          courseStore.createIndex("duration", "duration");
          courseStore.createIndex("description", "description");
        }

        console.log("Estrutura do banco de dados criada com sucesso");
      };
    });
  }

  // Aguarda inicialização
  async waitForInit() {
    if (this.initialized) return this.db;
    return this.initPromise;
  }

  // Usuários
  async addUser(user) {
    await this.waitForInit();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["users"], "readwrite");
      const store = transaction.objectStore("users");
      const request = store.add(user);

      request.onsuccess = () => {
        console.log("Usuário adicionado com sucesso");
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error("Erro ao adicionar usuário:", event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getUserByPhone(phone) {
    await this.waitForInit();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");
      const index = store.index("phone");
      const request = index.get(phone);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error("Erro ao buscar usuário:", event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getAllUsers() {
    await this.waitForInit();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = (event) => {
        console.error("Erro ao buscar usuários:", event.target.error);
        reject(event.target.error);
      };
    });
  }

  // Matrículas
  async enrollUser(userId, courseId, courseName) {
    await this.waitForInit();

    return new Promise((resolve, reject) => {
      const enrollment = {
        userId: userId,
        courseId: courseId,
        courseName: courseName,
        enrollmentDate: new Date().toISOString(),
        status: "ativo",
      };

      const transaction = this.db.transaction(["enrollments"], "readwrite");
      const store = transaction.objectStore("enrollments");
      const request = store.add(enrollment);

      request.onsuccess = () => {
        console.log("Matrícula realizada com sucesso");
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error("Erro ao matricular usuário:", event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getUserEnrollments(userId) {
    await this.waitForInit();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["enrollments"], "readonly");
      const store = transaction.objectStore("enrollments");
      const index = store.index("userId");
      const request = index.getAll(userId);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = (event) => {
        console.error("Erro ao buscar matrículas:", event.target.error);
        reject(event.target.error);
      };
    });
  }

  async isUserEnrolled(userId, courseId) {
    await this.waitForInit();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["enrollments"], "readonly");
      const store = transaction.objectStore("enrollments");
      const index = store.index("userId");
      const request = index.openCursor();

      let isEnrolled = false;

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (
            cursor.value.userId === userId &&
            cursor.value.courseId === courseId
          ) {
            isEnrolled = true;
          }
          cursor.continue();
        } else {
          resolve(isEnrolled);
        }
      };

      request.onerror = (event) => {
        console.error("Erro ao verificar matrícula:", event.target.error);
        reject(event.target.error);
      };
    });
  }

  // Cursos
  async addCourse(course) {
    await this.waitForInit();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["courses"], "readwrite");
      const store = transaction.objectStore("courses");
      const request = store.add(course);

      request.onsuccess = () => {
        console.log("Curso adicionado com sucesso");
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error("Erro ao adicionar curso:", event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getCourse(id) {
    await this.waitForInit();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["courses"], "readonly");
      const store = transaction.objectStore("courses");
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error("Erro ao buscar curso:", event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getAllCourses() {
    await this.waitForInit();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["courses"], "readonly");
      const store = transaction.objectStore("courses");
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = (event) => {
        console.error("Erro ao buscar cursos:", event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getAllEnrollments() {
    await this.waitForInit();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["enrollments"], "readonly");
      const store = transaction.objectStore("enrollments");
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = (event) => {
        console.error("Erro ao buscar matrículas:", event.target.error);
        reject(event.target.error);
      };
    });
  }

  async initializeCourses() {
    try {
      await this.waitForInit();

      const courses = [
        {
          name: "Eletricidade",
          duration: "4 anos",
          description:
            "Aprenda os fundamentos da eletricidade de forma prática e segura.",
          image: "./assets/eletricity.jpeg",
        },
        {
          name: "Eletrônica e Telecomunicações",
          duration: "4 anos",
          description:
            "Domine os princípios da eletrônica e das telecomunicações.",
          image: "./assets/eletronic.jpeg",
        },
        {
          name: "Informática",
          duration: "3 anos",
          description:
            "Aprenda as principais ferramentas de informática e programação.",
          image: "./assets/infor.jpeg",
        },
        {
          name: "Construção Civil",
          duration: "4 anos",
          description:
            "Desenvolva habilidades práticas e teóricas em construção civil.",
          image: "./assets/constru.jpeg",
        },
      ];

      const existingCourses = await this.getAllCourses();
      if (existingCourses.length === 0) {
        console.log("Inicializando cursos...");
        for (const course of courses) {
          await this.addCourse(course);
        }
        console.log("Cursos iniciais adicionados com sucesso");
      }
    } catch (error) {
      console.error("Erro ao inicializar cursos:", error);
    }
  }

  // Verifica se o banco está pronto
  isReady() {
    return this.initialized && this.db !== null;
  }
}

// Instância global do banco de dados
const schoolDB = new SchoolDB();

// Para debugging
window.schoolDB = schoolDB;
console.log(
  "SchoolDB instanciado, estado inicial:",
  schoolDB.initialized ? "Pronto" : "Inicializando..."
);
