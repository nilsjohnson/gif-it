CREATE DATABASE gif_it;
USE gif_it;

CREATE TABLE gif (
	id VARCHAR(32), -- The id
	descript VARCHAR(1000), -- A description, ie. 'This is how my dog playing fetch'
	fileName VARCHAR(32), -- The name of the file, ie. '8374jf7.gif'
	thumbName VARCHAR(38), -- The name of the gifs thumbnail, ie. '8374jf7.thumb.gif'
	dimensions VARCHAR(12),	-- The dimensions, ie. '800x600'
	duration float, -- The length of the gif in seconds, ie '47.32'
	PRIMARY KEY (id)
);

CREATE TABLE upload (
	id VARCHAR(32),
	date DATETIME,
	ipAddr VARCHAR(45),
	originalFilename VARCHAR(40),
	PRIMARY KEY (id) -- id is not a foreign key so that we can maintain
);					 -- record of uploads when a gif is deleted.

CREATE TABLE tag (
	id INT NOT NULL AUTO_INCREMENT,
	tag VARCHAR(32) NOT NULL UNIQUE,
	PRIMARY KEY (id)
);

CREATE TABLE gif_tag (
	gif_id VARCHAR(32),
	tag_id INT,
	FOREIGN KEY (gif_id) 
		REFERENCES gif(id)
		ON DELETE CASCADE,
	FOREIGN KEY (tag_id) 
		REFERENCES tag(id)
		ON DELETE CASCADE,
	UNIQUE KEY gif_id (gif_id, tag_id)
);

create user 'bryn'@'localhost' IDENTIFIED BY 'doggie';
GRANT ALL PRIVILEGES ON * TO 'bryn'@'localhost';

-- updated to allow for maximum length filenames under the linux OS
ALTER TABLE upload MODIFY originalFilename VARCHAR(255);

-- added an index on tags to allow for faster suggestions
ALTER TABLE tag ADD INDEX tag_index (tag);

-- added user accounts

CREATE TABLE user (
	id INT NOT NULL AUTO_INCREMENT,
	username VARCHAR(20) NOT NULL UNIQUE,
	email VARCHAR(128) NOT NULL UNIQUE,
	signupDate DATETIME NOT NULL,
	active TINYINT NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE user_credential (
	id INT NOT NULL,
	hashed CHAR(128) NOT NULL,
	salt CHAR(64) NOT NULL,
	FOREIGN KEY (id) REFERENCES user(id)
);
                  
CREATE TABLE user_verification (
	id INT NOT NULL,
	code CHAR(8) NOT NULL,
	verified TINYINT DEFAULT 0,
	FOREIGN KEY (id) REFERENCES user(id)
);

CREATE USER 'gracie'@'localhost' IDENTIFIED BY 'pass123$';

GRANT ALL PRIVILEGES ON user to 'gracie'@'localhost';
GRANT ALL PRIVILEGES ON user_credential to 'gracie'@'localhost';
GRANT ALL PRIVILEGES ON user_verification to 'gracie'@'localhost';
-- not really sure but we seem to need to do this.
ALTER USER 'gracie'@'localhost' IDENTIFIED BY 'pass123$'; 
ALTER USER 'gracie'@'localhost' IDENTIFIED WITH mysql_native_password BY 'pass123$';

-- gifs now belong to a user, or users
CREATE TABLE gif_owner (
	gif_id VARCHAR(32) NOT NULL,
	user_id INT NOT NULL,
	FOREIGN KEY (gif_id) REFERENCES gif(id),
	FOREIGN KEY (user_id) REFERENCES user(id)
);

-- users can now have photos
RENAME TABLE gif TO media;
RENAME TABLE gif_tag to media_tag;
RENAME TABLE gif_owner TO media_owner;

ALTER TABLE media ADD COLUMN fileType varchar(16) AFTER fileName;
ALTER TABLE media_tag RENAME COLUMN gif_id TO media_id;
ALTER TABLE media_owner RENAME COLUMN gif_id TO media_id;

update media set fileType = 'gif'; -- at this point, they're all gifs

-- we now have albums
CREATE TABLE album (
	id INT NOT NULL AUTO_INCREMENT,
	title VARCHAR(128),
	descript VARCHAR(10000),
	owner_id INT NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (owner_id) 
		REFERENCES user(id)
		ON DELETE CASCADE
);

CREATE TABLE album_items (
	media_id VARCHAR(32),
	album_id INT,
	item_index INT, -- is this the 3rd item? 4th item? etc.
	FOREIGN KEY (media_id) 
		REFERENCES media(id)
		ON DELETE CASCADE,
	FOREIGN KEY (album_id) 
		REFERENCES album(id)
		ON DELETE CASCADE,
	UNIQUE KEY id (media_id, album_id)
);