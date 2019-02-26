CREATE DATABASE merakidb;

CREATE SCHEMA meraki;

CREATE SEQUENCE meraki.scanning_ap_data_unique_scanning_key_seq;
CREATE SEQUENCE meraki.pos_data_key_seq;


CREATE TABLE meraki.scanning_ap_data
(
    unique_scanning_key integer NOT NULL DEFAULT nextval('meraki.scanning_ap_data_unique_scanning_key_seq'::regclass),
    ap_mac_address character varying(80) COLLATE pg_catalog."default",
	client_mac_address character varying(80) COLLATE pg_catalog."default",
    datetime character varying COLLATE pg_catalog."default",
    dateformat_date character varying(12) COLLATE pg_catalog."default",
	dateformat_year integer DEFAULT 2019,
    dateformat_month integer,
    dateformat_week integer,
    dateformat_day integer,
    dateformat_hour integer,
    dateformat_minute integer,
	rssi integer,
	seen_epoch character varying COLLATE pg_catalog."default",
    CONSTRAINT scanning_ap_data_pkey PRIMARY KEY (unique_scanning_key)
)

CREATE TABLE meraki.pos_data
(
    unique_pos_data_key integer NOT NULL DEFAULT nextval('meraki.pos_data_key_seq'::regclass),
    datetime character varying COLLATE pg_catalog."default",
    dateformat_date character varying(12) COLLATE pg_catalog."default",
	dateformat_year integer DEFAULT 2019,
    dateformat_month integer,
    dateformat_week integer,
    dateformat_day integer,
    dateformat_hour integer,
    dateformat_minute integer,
	uuid integer,
    no_of_items integer,
    total_amount integer,
    pos_counter_number integer,
    CONSTRAINT pos_data_pkey PRIMARY KEY (unique_pos_data_key)
)

WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE meraki.scanning_ap_data
    OWNER to postgres;

ALTER TABLE meraki.pos_data
    OWNER to postgres;