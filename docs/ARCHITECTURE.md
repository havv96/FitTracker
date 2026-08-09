# Архитектурен Обзор: FitTrack Pro

**Проект:** FitTrack Pro
**Версия:** 1.0
**Дата:** 09.12.2025 (Според SRS) [1]
**Цел:** Разработка на уеб-базирано приложение (PWA) за цялостно проследяване на физическата активност и здраве, обединяващо тренировки, хранене и хидратация [1].

---

## 1. Технологичен Стек (Tech Stack)

Системата FitTrack Pro ще бъде изградена с помощта на следния технологичен стек [2]:

*   **Backend:** Java 25 (Spring Boot 3.x) [2]
*   **Frontend:** Angular 17+ (използвайки Standalone Components и Signals) [2]
*   **База данни:** PostgreSQL [2]
*   **Сигурност:** Spring Security + JWT (JSON Web Tokens) [2]
*   **Деплоймънт:** Docker containers [2]

---

## 2. Архитектурен Модел

Приложението следва **Слоеста Архитектура (Layered Architecture)**, разделена на четири основни слоя [2]:

1.  **Client Layer (Angular PWA):** Представлява Single Page Application (SPA), което има възможност да работи офлайн и да синхронизира данни при възстановяване на връзката [2-4].
2.  **API Layer (Spring Web):** Съдържа REST Controllers, които приемат заявки и връщат DTOs (Data Transfer Objects) [2].
3.  **Service Layer (Spring Service):** Съдържа цялата бизнес логика, валидации и автоматични калкулации (като BMR/TDEE и Volume Load) [2, 5].
4.  **Data Layer (Spring Data JPA):** Отговаря за комуникацията с базата данни PostgreSQL [2].

---

## 3. Ключови Нефункционални Изисквания (NFR)

Тези изисквания имат пряко отношение към дизайна и изпълнението на архитектурата [4]:

*   **Сигурност:** Паролите трябва да се съхраняват само като **BCrypt хеш** [4-6]. HTTPS е задължителен за комуникацията [4].
*   **Скаeлируемост:** Архитектурата е **Stateless** (поради използването на JWT), което позволява хоризонтално скалиране [4].
*   **Производителност (Performance):** Отговорът на API за основни заявки трябва да бъде **под 200ms** [4].
*   **Офлайн Възможности (Offline Capability):** Чрез Angular Service Worker се кешират статични ресурси и последни данни [3, 4]. Потребителят трябва да може да записва серии офлайн, като данните се съхраняват в IndexedDB/LocalStorage и се синхронизират автоматично при възстановяване на връзката [3].

---

## 4. Схема на Базата Данни (Database Schema)

Основните таблици за съхранение на данни включват [7]:

| Таблица | Описание | Ключови колони |
| :------ | :------ | :------ |
| `users` | Основни акаунти | `id`, `email`, `password_hash`, `role` |
| `user_profiles` | Физически данни | `user_id`, `height`, `dob`, `gender`, `activity_lvl` |
| `exercises` | Каталог упражнения | `id`, `name`, `muscle_group`, `equipment_type` |
| `workouts` | Заглавна част на сесия | `id`, `user_id`, `date`, `start_time`, `end_time` |
| `workout_sets` | Детайли (Серии) | `id`, `workout_id`, `exercise_id`, `reps`, `weight_kg`, `rpe` |
| `food_items` | Номенклатура храни | `id`, `name`, `calories`, `protein`, `carbs`, `fat` |
| `nutrition_logs` | Дневник хранене | `id`, `user_id`, `date`, `food_item_id`, `quantity_g` |
| `daily_stats` | Вода, сън, тегло | `id`, `user_id`, `date`, `water_ml`, `sleep_hours`, `weight` |

---

## 5. Основни API Endpoints (REST)

Комуникацията между Client Layer и API Layer се осъществява чрез REST API, като базовият URL е `/api/v1` [8].

### Authentication

| Method | Endpoint | Описание |
| :------ | :------ | :------ |
| `POST` | `/auth/register` | Регистрация на потребител [8] |
| `POST` | `/auth/login` | Вход (връща **JWT** Access Token и Refresh Token) [8, 9] |

### Workouts (Тренировки)

| Method | Endpoint | Описание |
| :------ | :------ | :------ |
| `GET` | `/exercises` | Списък с всички упражнения [8] |
| `POST` | `/workouts` | Започване на тренировка [8] |
| `POST` | `/workouts/{id}/sets` | Добавяне на серия (Logging) [8, 10] |
| `GET` | `/workouts/history` | История (за календар) [8, 11] |

### Nutrition (Хранене)

| Method | Endpoint | Описание |
| :------ | :------ | :------ |
| `GET` | `/nutrition/foods/search` | Търсене на храна [4] |
| `POST` | `/nutrition/log` | Добавяне на изядена храна към хранене [4, 12] |
| `GET` | `/nutrition/daily/{date}` | Обобщение на дневния прием (target vs. consumed) [4] |

### Metrics &amp; Dashboard

| Method | Endpoint | Описание |
| :------ | :------ | :------ |
| `GET` | `/metrics/dashboard` | Начален екран (Summary) [4] |
| `POST` | `/metrics/weight` | Запис на тегло [4, 13] |
| `PATCH` | `/metrics/water` | Бързо добавяне на вода (+250ml) [4, 13] |
