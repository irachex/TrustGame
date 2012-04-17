CREATE TABLE user (
    id integer primary key AUTOINCREMENT,
    name text,
    gender text,
    age text,
    created timestamp default CURRENT_TIMESTAMP
);

CREATE TABLE game (
    id text primary key,
    uid int,
    trial_no int,
    round_no int,
    invest int,
    returns int,
    time int,
    created timestamp default CURRENT_TIMESTAMP
);

CREATE TABLE trial (
    id text primary key,
    uid int,
    trial_no int,
    probability int,
    image int,
    user_prob int,
    c1 int,
    c2 int,
    c3 int,
    c4 int,
    c5 int,
    created timestamp default CURRENT_TIMESTAMP
);