-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  customer_name TEXT,
  phone TEXT,
  email TEXT,
  tv_model TEXT,
  issue_summary TEXT,
  description TEXT,
  status TEXT DEFAULT 'open',
  assigned_to TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

-- Technicians
CREATE TABLE IF NOT EXISTS technicians (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT,
  email TEXT,
  skills TEXT,
  coverage TEXT,
  created_at INTEGER
);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  ticket_id TEXT,
  technician_id TEXT,
  assigned_at INTEGER,
  eta INTEGER,
  status TEXT DEFAULT 'assigned',
  notes TEXT
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'admin',
  password_hash TEXT,
  created_at INTEGER
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  item_name TEXT,
  category TEXT,
  quantity INTEGER,
  location TEXT,
  vendor TEXT,
  description TEXT,
  low_threshold INTEGER DEFAULT 5,
  created_at INTEGER,
  updated_at INTEGER
);

-- Stock logs
CREATE TABLE IF NOT EXISTS stock_logs (
  id TEXT PRIMARY KEY,
  inventory_id TEXT,
  change INTEGER,
  reason TEXT,
  user_id TEXT,
  ticket_id TEXT,
  created_at INTEGER
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  message TEXT,
  read INTEGER DEFAULT 0,
  created_at INTEGER
);

-- Seed technician
INSERT OR IGNORE INTO technicians (id,name,phone,email,skills,created_at) VALUES ('tech-1','Ravi Kumar','9876543210','ravi@tech.local','LED,OLED,Smart TVs', strftime('%s','now'));
