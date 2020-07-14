CREATE DATABASE gif_it;
USE gif_it;

CREATE TABLE gif (
	id varchar(32),
	descript varchar(1000),
	fileName varchar(32),
	PRIMARY KEY (id)
);

CREATE TABLE upload (
	id varchar(32),
	date DATETIME,
	ipAddr varchar(45),
	originalFilename varchar(40),
	PRIMARY KEY (id) -- id is not a foreign key so that we can maintain
);					 -- record of uploads when a gif is deleted.

CREATE TABLE tag (
	id int NOT NULL AUTO_INCREMENT,
	tag varchar(32) NOT NULL UNIQUE,
	PRIMARY KEY (id)
);

CREATE TABLE gif_tag (
	gif_id varchar(32),
	tag_id int,
	FOREIGN KEY (gif_id) 
		REFERENCES gif(id)
		ON DELETE CASCADE,
	FOREIGN KEY (tag_id) 
		REFERENCES tag(id)
		ON DELETE CASCADE,
	UNIQUE KEY gif_id (gif_id, tag_id)
);

-- create user 'bryn'@'localhost' IDENTIFIED BY 'doggie';
-- GRANT ALL PRIVILEGES ON * TO 'bryn'@'localhost';


-- INSERT INTO tag (tag) VALUES ("cat");
-- INSERT INTO tag (tag) VALUES ("dog");

-- INSERT INTO gif values ("rbOPz0U9", "rbOPz0U9.gif");
-- INSERT INTO gif values ("djeA6HXu", "djeA6HXu.gif");

