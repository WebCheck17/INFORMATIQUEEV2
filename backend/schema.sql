-- Drop tables if exist (hati-hati di production!)
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS message_files CASCADE;
DROP TABLE IF EXISTS comment_replies CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS post_images CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS deadline_files CASCADE;
DROP TABLE IF EXISTS deadlines CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (name, slug, description) VALUES 
('Administrator', 'admin', 'Full access to all features'),
('Member', 'member', 'Regular member access');

-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL DEFAULT 2 REFERENCES roles(id) ON UPDATE CASCADE,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    nim VARCHAR(50),
    kelas VARCHAR(50),
    jurusan VARCHAR(100),
    bio TEXT,
    avatar VARCHAR(255) DEFAULT 'default-avatar.png',
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    email_verified_at TIMESTAMP,
    verification_token VARCHAR(255),
    remember_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Insert admin user (password: admin123)
INSERT INTO users (role_id, username, email, password, name, nim, kelas, jurusan, bio, avatar, is_active, email_verified_at, created_at, updated_at) 
VALUES (1, 'admin', 'admin@kelashub.com', '$2a$12$WM5dtbkvt639QP713KXb3.jUqDHf4cqDvyQTxbQs8qo3RsfH244Oe', 'Administrator', '15240869', 'Admin', 'Informatika', 'Administrator KelasHub', 'default-avatar.png', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert member user (password: test123)
INSERT INTO users (role_id, username, email, password, name, nim, kelas, jurusan, bio, avatar, is_active, created_at, updated_at) 
VALUES (2, 'Nanda', '15240869@bsi.ac.id', '$2a$10$zTTbHUoHaP91vSpURrE0BeUu6AhojUS0I00NXXi1ptckgJQjdjJ36', 'Finanda Maulana Ariva', '15240869', '15.5A.02', 'Teknik Informatika', 'Mahasiswa baru di KelasHub! 👋', 'default-avatar.png', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Chat Rooms
CREATE TABLE chat_rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'bi-chat-dots',
    color VARCHAR(20) DEFAULT '#4F46E5',
    is_private BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

INSERT INTO chat_rooms (name, slug, description, icon, color, is_private, is_active, created_by, created_at, updated_at) VALUES
('Pemrograman Web', 'pemrograman-web', 'Diskusi seputar mata kuliah Pemrograman Web', 'bi-code-slash', '#4F46E5', false, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Basis Data', 'basis-data', 'Diskusi seputar mata kuliah Basis Data', 'bi-database', '#7C3AED', false, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Artificial Intelligence', 'artificial-intelligence', 'Diskusi seputar mata kuliah AI', 'bi-cpu', '#06B6D4', false, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Data Warehouse', 'data-warehouse', 'Diskusi seputar mata kuliah Data Warehouse', 'bi-bar-chart', '#10B981', false, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Mobile Programming', 'mobile-programming', 'Diskusi seputar mata kuliah Mobile Programming', 'bi-phone', '#F59E0B', false, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Comments
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Comment Replies
CREATE TABLE comment_replies (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Deadlines
CREATE TABLE deadlines (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    mata_kuliah VARCHAR(100) NOT NULL,
    dosen VARCHAR(255),
    deadline_at TIMESTAMP NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'completed', 'archived')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Deadline Files
CREATE TABLE deadline_files (
    id SERIAL PRIMARY KEY,
    deadline_id INTEGER NOT NULL REFERENCES deadlines(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size INTEGER DEFAULT 0,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Likes
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

-- Messages
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reply_to_id INTEGER REFERENCES messages(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'code', 'file', 'image')),
    code_language VARCHAR(50),
    is_pinned BOOLEAN DEFAULT false,
    is_edited BOOLEAN DEFAULT false,
    mentions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Message Files
CREATE TABLE message_files (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size INTEGER DEFAULT 0,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100),
    tags JSONB,
    video_url VARCHAR(500),
    view_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Post Images
CREATE TABLE post_images (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size INTEGER DEFAULT 0,
    mime_type VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    type VARCHAR(50) DEFAULT 'string',
    group_name VARCHAR(50) DEFAULT 'general',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO settings (key, value, type, group_name, description) VALUES
('site_name', 'KelasHub', 'string', 'general', 'Website name'),
('site_description', 'Pusat Komunikasi dan Dokumentasi Kelas', 'string', 'general', 'Website description'),
('site_logo', 'logo.png', 'string', 'general', 'Website logo'),
('allow_registration', '1', 'boolean', 'auth', 'Allow user registration'),
('email_verification', '0', 'boolean', 'auth', 'Require email verification'),
('max_upload_size', '10485760', 'integer', 'upload', 'Maximum upload size in bytes'),
('allowed_image_types', 'jpg,jpeg,png,gif,webp', 'string', 'upload', 'Allowed image types'),
('allowed_file_types', 'pdf,doc,docx,xls,xlsx,ppt,pptx,zip,rar,txt', 'string', 'upload', 'Allowed file types');

-- Activity Logs
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    subject_type VARCHAR(100),
    subject_id INTEGER,
    properties JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

CREATE INDEX idx_chat_rooms_created_by ON chat_rooms(created_by);
CREATE INDEX idx_chat_rooms_slug ON chat_rooms(slug);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

CREATE INDEX idx_comment_replies_comment_id ON comment_replies(comment_id);
CREATE INDEX idx_comment_replies_user_id ON comment_replies(user_id);

CREATE INDEX idx_deadlines_user_id ON deadlines(user_id);
CREATE INDEX idx_deadlines_deadline_at ON deadlines(deadline_at);
CREATE INDEX idx_deadlines_status ON deadlines(status);

CREATE INDEX idx_deadline_files_deadline_id ON deadline_files(deadline_id);

CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);

CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_reply_to_id ON messages(reply_to_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE INDEX idx_message_files_message_id ON message_files(message_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_slug ON posts(slug);

CREATE INDEX idx_post_images_post_id ON post_images(post_id);

CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_settings_key ON settings(key);