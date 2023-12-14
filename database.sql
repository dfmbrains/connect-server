CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE refresh_tokens
(
    id            SERIAL PRIMARY KEY,
    refresh_token TEXT
);

CREATE TABLE identity_users
(
    id       UUID PRIMARY KEY UNIQUE DEFAULT uuid_generate_v4(),
    password TEXT,
    username VARCHAR(255) UNIQUE,
    status   BOOLEAN                 DEFAULT true
);

CREATE TABLE images
(
    id      UUID PRIMARY KEY         DEFAULT uuid_generate_v4(),
    path    TEXT NOT NULL,
    created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profiles
(
    id        UUID PRIMARY KEY REFERENCES identity_users (id),
    firstName VARCHAR(255),
    lastName  VARCHAR(255),
    avatar    UUID REFERENCES images (id),
    birthdate TIMESTAMP WITH TIME ZONE,
    role      VARCHAR(255)             DEFAULT 'CLIENT',
    sex       INT CHECK (sex IN (0, 1)),
    updated   TIMESTAMP WITH TIME ZONE,
    created   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions
(
    id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target  UUID REFERENCES profiles (id),
    user_id UUID REFERENCES profiles (id)
);

CREATE TABLE posts
(
    id          UUID PRIMARY KEY         DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES profiles (id),
    title       VARCHAR(255),
    description TEXT,
    likes       INTEGER                  DEFAULT 0,
    image       UUID REFERENCES images (id),
    updated     TIMESTAMP WITH TIME ZONE,
    created     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);