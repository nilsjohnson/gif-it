CREATE DATABASE gif_it;
USE gif_it;

CREATE TABLE gif (
	id varchar(32),
	filename varchar(32),
	PRIMARY KEY (id)
);

CREATE TABLE upload (
	id varchar(32),
	date DATETIME,
	ipAddr varchar(45),
	originalFilename varchar(40),
	FOREIGN KEY (id) REFERENCES gif(id)
);

CREATE TABLE tag (
	id int NOT NULL AUTO_INCREMENT,
	tag varchar(32) NOT NULL UNIQUE,
	PRIMARY KEY (id)
);

CREATE TABLE gif_tag (
	gif_id varchar(32),
	tag_id int,
	FOREIGN KEY (gif_id) REFERENCES gif(id),
	FOREIGN KEY (tag_id) REFERENCES tag(id)
);

INSERT INTO tag (tag) VALUES ("cat");
INSERT INTO tag (tag) VALUES ("dog");

INSERT INTO gif values ("rbOPz0U9", "rbOPz0U9.gif");
INSERT INTO gif values ("djeA6HXu", "djeA6HXu.gif");

