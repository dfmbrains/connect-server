create TABLE refresh_tokens
(
    id            SERIAL PRIMARY KEY,
    refresh_token varchar(255)
);

create TABLE identity_users
(
    id       SERIAL PRIMARY KEY,
    password varchar(255),
    username varchar(255) UNIQUE,
    status   BOOLEAN DEFAULT false
);

create TABLE images
(
    id      varchar(255) UNIQUE,
    path    TEXT NOT NULL,
    created timestamp with time zone
);

create TABLE profiles
(
    id        varchar(255) UNIQUE,
    username  varchar(255) UNIQUE,
    firstName varchar(255),
    lastName  varchar(255),
    avatar    varchar(255),
    birthdate timestamp with time zone,
    role      varchar(255),
    sex       int,
    updated   timestamp with time zone null,
    created   timestamp with time zone,
    FOREIGN KEY (username) REFERENCES identity_users (username),
    FOREIGN KEY (avatar) REFERENCES images (id)
);

create TABLE posts
(
    id          varchar(255) UNIQUE,
    user_id     varchar(255) UNIQUE,
    title       varchar(255),
    description varchar(255),
    likes       varchar(255),
    image       varchar(255),
    updated     timestamp with time zone,
    created     timestamp with time zone,
    FOREIGN KEY (user_id) REFERENCES profiles (id),
    FOREIGN KEY (image) REFERENCES images (id)
);