-- ========================
-- Table: role
-- ========================
CREATE TABLE role (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE
);

-- ========================
-- Table: "user"
-- ========================
CREATE TABLE "user" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_subscribed BOOLEAN NOT NULL DEFAULT FALSE,
    subscription_tier VARCHAR(50),
    subscription_expiry TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- ========================
-- Table: user_roles (many-to-many)
-- ========================
CREATE TABLE user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE
);

-- ========================
-- Table: subscription
-- ========================
CREATE TABLE subscription (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    start_date TIMESTAMP NOT NULL DEFAULT now(),
    end_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

-- ========================
-- Table: playlist
-- ========================
CREATE TABLE playlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

-- ========================
-- Table: playlist_item
-- ========================
CREATE TABLE playlist_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID NOT NULL,
    video_id UUID NOT NULL,
    position INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_playlist
        FOREIGN KEY (playlist_id) REFERENCES playlist(id) ON DELETE CASCADE,
    CONSTRAINT fk_video
        FOREIGN KEY (video_id) REFERENCES video(id) ON DELETE CASCADE
);


-- ========================
-- Indexes
-- ========================
CREATE INDEX idx_playlist_user ON playlist(user_id);
CREATE INDEX idx_playlist_item_playlist ON playlist_item(playlist_id);
CREATE UNIQUE INDEX idx_playlist_item_position ON playlist_item(playlist_id, position);


CREATE TABLE video (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INT NOT NULL, -- duration in seconds
    url VARCHAR(500) NOT NULL, -- URL to the video file or manifest
    thumbnail_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);