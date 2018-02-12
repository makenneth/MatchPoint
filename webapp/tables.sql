DROP TABLE IF EXISTS club_players;
DROP TABLE IF EXISTS club_geolocations;
DROP TABLE IF EXISTS player_histories;
DROP TABLE IF EXISTS roundrobin_players;
DROP TABLE IF EXISTS roundrobins;
DROP TABLE IF EXISTS clubs;
DROP TABLE IF EXISTS players;

CREATE TABLE users (
  id MEDIUMINT NOT NULL AUTO_INCREMENT,
  account_type VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  verified TINYINT(1) DEFAULT 0,
  username VARCHAR(50) NOT NULL,
  short_id VARCHAR(14) NOT NULL,
  PRIMARY KEY (id);
);

CREATE TABLE user_devices (
  id MEDIUMINT NOT NULL AUTO_INCREMENT,
  device_id VARCHAR(255) NOT NULL,
  api_token VARCHAR(255) NOT NULL,
  user_id MEDIUMINT NOT NULL,
  FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE
  PRIMARY KEY (id);
);


CREATE TABLE tokens (

  usatt_url
);

CREATE TABLE clubs (
  id MEDIUMINT NOT NULL AUTO_INCREMENT,
  password_digest VARCHAR(64) NOT NULL,
  session_token VARCHAR(50) NOT NULL,
  club_name VARCHAR(80) NOT NULL,
  token VARCHAR(50),
  confirm_token VARCHAR(50),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE (short_id),
  UNIQUE (username),
  UNIQUE (email),
  UNIQUE (club_name)
);

CREATE TABLE club_geolocations (
  id MEDIUMINT NOT NULL AUTO_INCREMENT,
  club_id MEDIUMINT NOT NULL,
  city VARCHAR(50),
  state CHAR(2),
  country VARCHAR(40),
  address TEXT,
  geolat decimal(10, 6),
  geolng decimal(10, 6),
  PRIMARY KEY (id),
  FOREIGN KEY (club_id)
    REFERENCES clubs (id)
    ON DELETE CASCADE,
  KEY geolat (geolat),
  KEY geolng (geolng)
);

CREATE TABLE players (
  id INT NOT NULL AUTO_INCREMENT,
  short_id VARCHAR(14) NOT NULL,
  usatt_url VARCHAR(255),
  name VARCHAR(126) NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE (short_id)
);

CREATE TABLE club_players (
  id MEDIUMINT NOT NULL AUTO_INCREMENT,
  club_id MEDIUMINT NOT NULL,
  player_id INT NOT NULL,
  FOREIGN KEY (club_id)
    REFERENCES clubs (id)
    ON DELETE CASCADE,
  FOREIGN KEY (player_id)
    REFERENCES players (id)
    ON DELETE CASCADE,
  PRIMARY KEY (id)
);

CREATE TABLE roundrobins (
  id INT NOT NULL AUTO_INCREMENT,
  club_id MEDIUMINT NOT NULL,
  date DATETIME NOT NULL,
  short_id VARCHAR(14) NOT NULL,
  finalized TINYINT(1) DEFAULT 0,
  num_players SMALLINT NOT NULL,
  selected_schema JSON,
  results JSON,
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (short_id),
  FOREIGN KEY (club_id) REFERENCES clubs (id) ON DELETE CASCADE,
  PRIMARY KEY (id)
);

CREATE TABLE player_histories (
  id MEDIUMINT NOT NULL,
  player_id INT NOT NULL,
  roundrobin_id INT,
  club_id MEDIUMINT NOT NULL,
  old_rating SMALLINT NOT NULL,
  rating_change SMALLINT NOT NULL,
  rating SMALLINT NOT NULL,
  result JSON,
  change_date DATETIME NOT NULL,
  won TINYINT(1) DEFAULT 0,
  FOREIGN KEY (club_id) REFERENCES clubs (id),
  FOREIGN KEY (roundrobin_id) REFERENCES roundrobins (id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE CASCADE,
  PRIMARY KEY (player_id, id),
  UNIQUE KEY `player_roundrobin_key` (player_id, roundrobin_id)
);

CREATE TABLE roundrobin_players (
  id MEDIUMINT NOT NULL,
  player_id INT NOT NULL,
  roundrobin_id INT NOT NULL,
  group_id TINYINT NOT NULL,
  pos TINYINT NOT NULL,
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players (id),
  FOREIGN KEY (roundrobin_id) REFERENCES roundrobins (id) ON DELETE CASCADE,
  PRIMARY KEY (roundrobin_id, id)
);

DELIMITER $$
CREATE TRIGGER ensure_roundrobin_player_id BEFORE INSERT ON roundrobin_players
FOR EACH ROW BEGIN
    SET NEW.id = (
       SELECT IFNULL(MAX(id), 0) + 1
       FROM roundrobin_players
       WHERE roundrobin_id  = NEW.roundrobin_id
    );
END $$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER ensure_player_history_id BEFORE INSERT ON player_histories
FOR EACH ROW BEGIN
    SET NEW.id = (
       SELECT IFNULL(MAX(id), 0) + 1
       FROM player_histories
       WHERE player_id = NEW.player_id
    );
END $$
DELIMITER ;

INSERT INTO matchpoints.clubs (
  password_digest, session_token, short_id, username, club_name, email, verified
) VALUES (
  "$2a$10$HIbdZshO2lDyo6PXxvFLEe4d43087WhkssVqPt8ZfVzkjHxcWj0CK", "ABCEDEFSDFSDF",
  "Hkz-TkHCZ",
  "soma_ttc",
  "SomaTTC",
  "help.matchpoints@gmail.com",
  1
);

INSERT INTO matchpoints.club_geolocations (
  city, state, country, club_id
) VALUES (
  "San Francisco", "CA", "United States", 1
);

INSERT INTO matchpoints.clubs (
  password_digest, session_token, short_id, username, club_name, email, verified
) VALUES (
  "$2a$10$HIbdZshO2lDyo6PXxvFLEe4d43087WhkssVqPt8ZfVzkjHxcWj0CK", "ABCEDEFSDFSDF",
  "B1d8g4B0-",
  "guest",
  "Test Club",
  "test@gmail.com",
  1
);

INSERT INTO matchpoints.club_geolocations (
  city, state, country, club_id
) VALUES (
  "San Francisco", "CA", "United States", 2
);

CREATE TABLE matchpoints.hours (
  id MEDIUMINT NOT NULL AUTO_INCREMENT,
  type VARCHAR(255) NOT NULL,
  open DATETIME NOT NULL,
  close DATETIME NOT NULL,
  day TINYINT(4) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE matchpoints.club_hours (
  id MEDIUMINT NOT NULL AUTO_INCREMENT,
  club_id MEDIUMINT NOT NULL,
  hour_id MEDIUMINT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (club_id)
    REFERENCES clubs (id)
    ON DELETE CASCADE,
  FOREIGN KEY (hour_id)
    REFERENCES hours (id)
    ON DELETE CASCADE
);

ALTER TABLE roundrobins MODIFY COLUMN date DATE;
