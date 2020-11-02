-- mysql  Ver 8.0.21-0ubuntu0.20.04.4 for Linux on x86_64 ((Ubuntu))

CREATE DATABASE gif_it;
USE gif_it;

-- User Tables
CREATE TABLE user (
	id INT NOT NULL AUTO_INCREMENT,
	username VARCHAR(32) NOT NULL UNIQUE,
	email VARCHAR(128) NOT NULL UNIQUE,
	signupDate DATETIME NOT NULL,
	active TINYINT NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE user_credential (
	id INT NOT NULL,
	hashed CHAR(128) NOT NULL,
	salt CHAR(64) NOT NULL,
	FOREIGN KEY (id) 
		REFERENCES user(id)
		ON DELETE CASCADE

);
                  
CREATE TABLE user_verification (
	id INT NOT NULL,
	code CHAR(8) NOT NULL,
	verified TINYINT DEFAULT 0,
	FOREIGN KEY (id) 
		REFERENCES user(id)
		ON DELETE CASCADE
);

-- Media Tables
CREATE TABLE media (
	id VARCHAR(32), -- The id
	descript VARCHAR(9000), -- A description, ie. 'This is how my dog playing fetch'
	fileName VARCHAR(64), -- The name of the file, ie. '8374jf7.gif'
	thumbName VARCHAR(64), -- The name of the gifs thumbnail, ie. '8374jf7.thumb.gif'
	fullSizeName VARCHAR(64),
	fileType VARCHAR(16),
	PRIMARY KEY (id)
);

CREATE TABLE upload (
	id VARCHAR(32),
	date DATETIME,
	ipAddr VARCHAR(45),
	originalFilename VARCHAR(255),
	PRIMARY KEY (id) -- id is not a foreign key so that we can maintain
);					 -- record of uploads when media is deleted.

CREATE TABLE tag (
	id INT NOT NULL AUTO_INCREMENT,
	tag VARCHAR(32) NOT NULL UNIQUE,
	PRIMARY KEY (id),
	INDEX tag_index (tag)
);

CREATE TABLE media_tag (
	media_id VARCHAR(32),
	tag_id INT,
	FOREIGN KEY (media_id) 
		REFERENCES media(id)
		ON DELETE CASCADE,
	FOREIGN KEY (tag_id) 
		REFERENCES tag(id)
		ON DELETE CASCADE,
	UNIQUE KEY media_tag_key (media_id, tag_id)
);


-- Albums and ownership
CREATE TABLE media_owner (
	media_id VARCHAR(32) NOT NULL,
	owner_id INT NOT NULL,
	FOREIGN KEY (media_id) 
		REFERENCES media(id)
		ON DELETE CASCADE,
	FOREIGN KEY (owner_id) 
		REFERENCES user(id)
		ON DELETE CASCADE
);

CREATE TABLE album (
	id INT NOT NULL AUTO_INCREMENT,
	title VARCHAR(256),
	owner_id INT NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (owner_id) 
		REFERENCES user(id)
		ON DELETE CASCADE
);

CREATE TABLE album_items (
	media_id VARCHAR(32),
	album_id INT,
	item_index INT,
	FOREIGN KEY (media_id) 
		REFERENCES media(id)
		ON DELETE CASCADE,
	FOREIGN KEY (album_id) 
		REFERENCES album(id)
		ON DELETE CASCADE,
	UNIQUE KEY id (media_id, album_id)
);


-- This user (is part of the webapp) is responsible for users/auth etc
CREATE USER 'gracie'@'localhost' IDENTIFIED BY 'pass123$';

GRANT ALL PRIVILEGES ON user to 'gracie'@'localhost';
GRANT ALL PRIVILEGES ON user_credential to 'gracie'@'localhost';
GRANT ALL PRIVILEGES ON user_verification to 'gracie'@'localhost';

-- this user (also the webapp) is responsible for media and uploading.
CREATE USER 'bryn'@'localhost' IDENTIFIED BY 'doggie';

GRANT ALL PRIVILEGES ON upload to 'bryn'@'localhost';
GRANT ALL PRIVILEGES ON media to 'bryn'@'localhost';
GRANT ALL PRIVILEGES ON tag to 'bryn'@'localhost';
GRANT ALL PRIVILEGES ON media_tag to 'bryn'@'localhost';
GRANT ALL PRIVILEGES ON media_owner to 'bryn'@'localhost';
GRANT ALL PRIVILEGES ON album to 'bryn'@'localhost';
GRANT ALL PRIVILEGES ON album_items to 'bryn'@'localhost';
GRANT SELECT ON user to 'bryn'@'localhost';

-- given that we're using mysql 8 mysqljs, we have to identify ourselves using a plain old password...
ALTER USER 'gracie'@'localhost' IDENTIFIED WITH mysql_native_password BY 'pass123$';
ALTER USER 'bryn'@'localhost' IDENTIFIED WITH mysql_native_password BY 'doggie';
flush privileges;

-- 10/20/2020 - Bug reports submit to DB
CREATE TABLE bugReport (
	id INT NOT NULL AUTO_INCREMENT,
	user_id INT,
	date DATETIME NOT NULL,
	message VARCHAR(1000),
	fileName VARCHAR(255),
	PRIMARY KEY (id)
);	


CREATE USER 'pickles'@'localhost' IDENTIFIED BY 'goodwoofer';
GRANT ALL PRIVILEGES ON bugReport TO 'pickles'@'localhost';
GRANT SELECT ON user TO 'pickles'@'localhost';
ALTER USER 'pickles'@'localhost' IDENTIFIED WITH mysql_native_password BY 'goodwoofer';
flush privileges;

-- 10/30 auth tokens now go in DB
CREATE TABLE authToken (
    tokenHash CHAR(128) NOT NULL,
    userId INT NOT NULL,
    dateCreated DATETIME NOT NULL,
    PRIMARY KEY (tokenHash),
    FOREIGN KEY (userId) 
		REFERENCES user(id)
		ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON authToken to 'gracie'@'localhost';
flush privileges;
