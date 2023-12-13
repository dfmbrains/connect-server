create TABLE identity_users
(
    id       SERIAL PRIMARY KEY,
    password varchar(255),
    username varchar(255) UNIQUE
);

create TABLE profiles
(
    id        varchar(255) UNIQUE,
    username  varchar(255) UNIQUE,
    firstName varchar(255),
    lastName  varchar(255),
    avatar    varchar(255),
    birthdate varchar(255),
    role      varchar(255),
    sex       int,
    updated   date,
    created   date,
    FOREIGN KEY (username) REFERENCES identity_users (username)
);