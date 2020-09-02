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