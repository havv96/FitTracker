# Software Requirements Specification (SRS)
**Проект:** FitTrack Pro  
**Версия:** 1.0  
**Дата:** 09.12.2025  
**Статус:** Draft  

---

## 1. Въведение

### 1.1 Цел на проекта
Целта е разработката на "FitTrack Pro" – уеб-базирано приложение (PWA) за цялостно проследяване на физическата активност и здраве. Приложението решава проблема с разпокъсаността на данните, като обединява тренировки, хранене, сън и хидратация в една платформа с интелигентни препоръки.

### 1.2 Технологичен Стек (Tech Stack)
* **Backend:** Java 25 (Spring Boot 3.x)
* **Frontend:** Angular 17+ (Standalone Components, Signals)
* **Database:** PostgreSQL
* **Security:** Spring Security + JWT (JSON Web Tokens)
* **Deployment:** Docker containers

---

## 2. Архитектура на системата

Приложението следва **Layered Architecture** (Слоеста архитектура):

1.  **Client Layer (Angular):** PWA Single Page Application. Работи офлайн и синхронизира данни при свързване.
2.  **API Layer (Spring Web):** REST Controllers, които приемат заявки и връщат DTOs.
3.  **Service Layer (Spring Service):** Бизнес логика, валидации, калкулации (BMR, Volume Load).
4.  **Data Layer (Spring Data JPA):** Комуникация с PostgreSQL.

---

## 3. Функционални Изисквания (Functional Requirements)

### 3.1 Модул "Потребител и Профил"
* **FR-AUTH-01:** Регистрация с Email/Password и криптиране на паролата (BCrypt).
* **FR-AUTH-02:** Вход в системата и генериране на JWT Access & Refresh tokens.
* **FR-PROF-01:** Въвеждане на антропологични данни (Ръст, Тегло, Пол, Години).
* **FR-PROF-02:** Автоматично изчисляване на BMR (Basal Metabolic Rate) и TDEE (Total Daily Energy Expenditure).
* **FR-PROF-03:** Настройка на цели (напр. "Свали 5кг") и скорост на промяна.

### 3.2 Модул "Тренировки" (Workout Tracker)
* **FR-WORK-01:** База данни с упражнения (филтър по мускулна група и уред).
* **FR-WORK-02:** Създаване на тренировъчни шаблони (Routines/Plans).
* **FR-WORK-03:** **Активна сесия (Logging):**
    * Въвеждане на серии, повторения, килограми.
    * RPE (Rate of Perceived Exertion) скала (1-10).
    * Таймер за почивка между сериите.
* **FR-WORK-04:** История на тренировките и възможност за редакция на минали записи.

### 3.3 Модул "Хранене" (Nutrition)
* **FR-NUTR-01:** Търсене на храни в база данни (външно API или собствена база).
* **FR-NUTR-02:** Логване на храна към хранене (Закуска/Обяд/Вечеря/Снак).
* **FR-NUTR-03:** Изчисляване на общи калории и макроси (Протеин/Въглехидрати/Мазнини) за деня в реално време.

### 3.4 Модул "Лайфстайл и Мерки"
* **FR-META-01:** Следене на вода (бързи бутони +250ml).
* **FR-META-02:** Следене на сън (часове и качество).
* **FR-META-03:** Следене на добавки (Checklist за деня).
* **FR-META-04:** Галерия със снимки на прогреса и графики на теглото.

### 3.5 Модул "Умни Препоръки"
* **FR-AI-01:** Напомняне (Notification/Email) при липса на активност над 3 дни.
* **FR-AI-02:** Препоръка за увеличаване на тежестта (**Progressive Overload**), ако потребителят прави едни и същи повторения с лекота.

---

## 4. Схема на Базата Данни (Database Schema)

| Таблица | Описание | Ключови колони |
| :--- | :--- | :--- |
| `users` | Основни акаунти | `id, email, password_hash, role` |
| `user_profiles` | Физически данни | `user_id, height, dob, gender, activity_lvl` |
| `exercises` | Каталог упражнения | `id, name, muscle_group, equipment_type` |
| `workouts` | Заглавна част на сесия | `id, user_id, date, start_time, end_time` |
| `workout_sets` | Детайли (Серии) | `id, workout_id, exercise_id, reps, weight_kg, rpe` |
| `food_items` | Номенклатура храни | `id, name, calories, protein, carbs, fat` |
| `nutrition_logs` | Дневник хранене | `id, user_id, date, food_item_id, quantity_g` |
| `daily_stats` | Вода, сън, тегло | `id, user_id, date, water_ml, sleep_hours, weight` |

---

## 5. API Specification (Endpoints)

Комуникацията се осъществява чрез REST API. Base URL: `/api/v1`

### Authentication
| Method | Endpoint | Описание |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Регистрация на потребител |
| `POST` | `/auth/login` | Вход (връща JWT) |

### Workouts (Тренировки)
| Method | Endpoint | Описание |
| :--- | :--- | :--- |
| `GET` | `/exercises` | Списък с всички упражнения |
| `POST` | `/workouts` | Започване на тренировка |
| `POST` | `/workouts/{id}/sets` | Добавяне на серия (log set) |
| `PUT` | `/workouts/{id}/finish` | Приключване на тренировка |
| `GET` | `/workouts/history` | История (за календар) |

### Nutrition (Хранене)
| Method | Endpoint | Описание |
| :--- | :--- | :--- |
| `GET` | `/nutrition/foods/search` | Търсене на храна (`?q=...`) |
| `POST` | `/nutrition/log` | Добавяне на изядено |
| `GET` | `/nutrition/daily/{date}` | Обобщение за деня (target vs. consumed) |

### Metrics & Dashboard
| Method | Endpoint | Описание |
| :--- | :--- | :--- |
| `GET` | `/metrics/dashboard` | Начален екран (Summary) |
| `POST` | `/metrics/weight` | Запис на тегло |
| `PATCH`| `/metrics/water` | Добавяне на вода |

---

## 6. Нефункционални Изисквания (NFR)

1.  **Performance:** API отговор < 200ms за основни заявки.
2.  **Scalability:** Stateless архитектура (заради JWT), позволяваща хоризонтално скалиране.
3.  **Usability (Mobile):** UI елементите трябва да са с височина поне 44px (за тъч скрийн).
4.  **Offline Capability:** Angular Service Worker трябва да кешира статичните ресурси и последните данни.
5.  **Security:** HTTPS е задължителен. Паролите се съхраняват само хеширани.

---

## 7. План за изпълнение (Roadmap)

1.  **Фаза 1: Setup & Auth**
    * Инициализиране на Spring Boot и Angular проектите.
    * Настройка на PostgreSQL и Docker.
    * Реализация на Login/Register.
2.  **Фаза 2: Core Workout Tracking**
    * CRUD за упражнения.
    * Логване на тренировка (Basic).
3.  **Фаза 3: Nutrition & Metrics**
    * База с храни и калкулатор.
    * Графики за тегло.
4.  **Фаза 4: Polish & Recommendations**
    * Напомняния.
    * UI подобрения и PWA настройки.