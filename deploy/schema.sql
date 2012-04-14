CREATE TABLE user (
    id integer primary key AUTOINCREMENT,
    name text,
    gender text,
    age text,
    created date default (datetime('now', 'localtime'))
);

CREATE TABLE game (
    id integer primary key AUTOINCREMENT,
    uid int,
    trial_no int,
    round_no int,
    invest int,
    returns int,
    image int,
    created date default (datetime('now', 'localtime'))
);

CREATE TABLE trial (
    id integer primary key AUTOINCREMENT,
    uid int,
    trial_no int,
    probability int,
    user_prob int,
    c1 int,
    c2 int,
    c3 int,
    c4 int,
    c5 int,
    created date default (datetime('now', 'localtime'))
);