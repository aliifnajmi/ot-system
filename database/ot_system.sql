-- ============================================================
-- BMS OT MANAGEMENT SYSTEM — FRESH DATABASE
-- Exchange 106 · Mulia Property Development Sdn. Bhd.
--
-- CARA GUNA:
-- 1. Buka phpMyAdmin → tab SQL
-- 2. Paste semua ni dan klik Go
-- 3. Login: admin/supervisor/tech01 → password: Admin@123
-- ============================================================

DROP DATABASE IF EXISTS ot_system;
CREATE DATABASE ot_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ot_system;

-- ============================================================
-- TABLE: users  (system login)
-- ============================================================
CREATE TABLE users (
    id          INT          AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(100) NOT NULL,
    role        ENUM('admin','supervisor','technician') DEFAULT 'technician',
    phone       VARCHAR(20)  DEFAULT NULL,
    is_active   TINYINT(1)   DEFAULT 1,
    last_login  TIMESTAMP    NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: workers  (profil pekerja — isi sekali, auto-load)
-- STANDARD column: ic_passport
-- ============================================================
CREATE TABLE workers (
    id               INT           AUTO_INCREMENT PRIMARY KEY,
    user_id          INT           NULL,
    full_name        VARCHAR(100)  NOT NULL,
    ic_passport      VARCHAR(30)   NOT NULL UNIQUE,
    phone            VARCHAR(20)   DEFAULT NULL,
    email            VARCHAR(100)  DEFAULT NULL,
    company          VARCHAR(150)  DEFAULT NULL,
    trade            VARCHAR(100)  DEFAULT NULL,
    hourly_rate      DECIMAL(8,2)  DEFAULT 0.00,
    default_location VARCHAR(100)  DEFAULT NULL,
    photo            VARCHAR(255)  DEFAULT NULL,
    is_active        TINYINT(1)    DEFAULT 1,
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- TABLE: locations  (lokasi kerja Exchange 106)
-- ============================================================
CREATE TABLE locations (
    id    INT          AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(100) NOT NULL,
    zone  VARCHAR(50)  DEFAULT NULL,
    floor VARCHAR(30)  DEFAULT NULL
);

-- ============================================================
-- TABLE: ot_records  (rekod overtime)
-- ============================================================
CREATE TABLE ot_records (
    id                INT            AUTO_INCREMENT PRIMARY KEY,
    worker_id         INT            NULL,
    submitted_by      INT            NULL,
    submitted_by_name VARCHAR(100)   DEFAULT NULL,
    worker_name       VARCHAR(100)   NOT NULL,
    trade             VARCHAR(100)   DEFAULT NULL,
    ic_number         VARCHAR(30)    DEFAULT NULL,
    phone             VARCHAR(20)    DEFAULT NULL,
    location          VARCHAR(100)   DEFAULT NULL,
    ot_date           DATE           NOT NULL,
    start_time        TIME           NOT NULL,
    end_time          TIME           NOT NULL,
    total_hours       DECIMAL(5,2)   DEFAULT 0.00,
    hourly_rate       DECIMAL(8,2)   DEFAULT 0.00,
    total_cost        DECIMAL(10,2)  DEFAULT 0.00,
    reason            TEXT           DEFAULT NULL,
    status            ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
    approved_by       INT            NULL,
    approved_at       TIMESTAMP      NULL,
    qr_code           VARCHAR(100)   DEFAULT NULL,
    created_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id)    REFERENCES workers(id) ON DELETE SET NULL,
    FOREIGN KEY (submitted_by) REFERENCES users(id)   ON DELETE SET NULL,
    FOREIGN KEY (approved_by)  REFERENCES users(id)   ON DELETE SET NULL
);

-- ============================================================
-- TABLE: audit_log
-- ============================================================
CREATE TABLE audit_log (
    id         INT          AUTO_INCREMENT PRIMARY KEY,
    user_id    INT          NULL,
    action     VARCHAR(100) NOT NULL,
    table_name VARCHAR(50)  DEFAULT NULL,
    record_id  INT          DEFAULT NULL,
    old_value  TEXT         DEFAULT NULL,
    new_value  TEXT         DEFAULT NULL,
    ip_address VARCHAR(45)  DEFAULT NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- SEED: Users  (password semua = Admin@123)
-- ============================================================
INSERT INTO users (username, password, full_name, role, phone) VALUES
('admin',
 '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77bqEG',
 'System Administrator', 'admin', '60123456789'),

('supervisor',
 '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77bqEG',
 'BMS Supervisor', 'supervisor', '60129876543'),

('tech01',
 '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77bqEG',
 'Ahmad Technician', 'technician', '60111234567');

-- ============================================================
-- SEED: Locations Exchange 106
-- ============================================================
INSERT INTO locations (name, zone, floor) VALUES
('LV Switchroom',       'Electrical', 'Basement 1'),
('HV Room',             'Electrical', 'Level 2'),
('BAS Control Room',    'BMS',        'Ground Floor'),
('Chiller Plant Room',  'Mechanical', 'Basement 1'),
('AHU Room Level 5',    'Mechanical', 'Level 5'),
('AHU Room Level 10',   'Mechanical', 'Level 10'),
('AHU Room Level 15',   'Mechanical', 'Level 15'),
('Main DB Room',        'Electrical', 'Level 1'),
('Sub DB Room B1',      'Electrical', 'Basement 1'),
('Generator Room',      'Mechanical', 'Basement 2'),
('Rooftop Plant Room',  'Mechanical', 'Rooftop'),
('Cooling Tower',       'Mechanical', 'Rooftop'),
('Server Room',         'IT',         'Level 3'),
('Lift Motor Room',     'Mechanical', 'Rooftop'),
('Loading Bay',         'Civil',      'Ground Floor'),
('Car Park B1',         'Civil',      'Basement 1'),
('Car Park B2',         'Civil',      'Basement 2'),
('External Area',       'Civil',      'External');

-- ============================================================
-- SEED: Worker profile untuk tech01 (user_id=3)
-- ============================================================
INSERT INTO workers
    (user_id, full_name, ic_passport, phone, company, trade, hourly_rate, default_location)
VALUES
    (3, 'Ahmad Technician', '900101-14-1234', '60111234567',
     'Mulia FM Services Sdn Bhd', 'BMS Technician', 25.00, 'BAS Control Room');

-- ============================================================
-- VERIFY — pastikan semua table ada data
-- ============================================================
SELECT 'USERS'      AS tbl, COUNT(*) AS rows FROM users     UNION ALL
SELECT 'WORKERS',          COUNT(*)          FROM workers   UNION ALL
SELECT 'LOCATIONS',        COUNT(*)          FROM locations UNION ALL
SELECT 'OT_RECORDS',       COUNT(*)          FROM ot_records UNION ALL
SELECT 'AUDIT_LOG',        COUNT(*)          FROM audit_log;
