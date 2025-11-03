--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Debian 16.9-1.pgdg120+1)
-- Dumped by pg_dump version 16.9 (Debian 16.9-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_user; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.app_user (
                                 id integer NOT NULL,
                                 name character varying NOT NULL,
                                 mail character varying NOT NULL,
                                 forbidden integer[],
                                 "secretSantaId" integer,
                                 gift_to integer,
                                 creation_date timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.app_user OWNER TO "user";

--
-- Name: app_user_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.app_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.app_user_id_seq OWNER TO "user";

--
-- Name: app_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.app_user_id_seq OWNED BY public.app_user.id;


--
-- Name: secretsanta; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.secretsanta (
                                    id integer NOT NULL,
                                    name character varying NOT NULL,
                                    code character varying NOT NULL,
                                    mail_date timestamp with time zone NOT NULL,
                                    creation_date timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.secretsanta OWNER TO "user";

--
-- Name: secretsanta_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.secretsanta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.secretsanta_id_seq OWNER TO "user";

--
-- Name: secretsanta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.secretsanta_id_seq OWNED BY public.secretsanta.id;


--
-- Name: app_user id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.app_user ALTER COLUMN id SET DEFAULT nextval('public.app_user_id_seq'::regclass);


--
-- Name: secretsanta id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.secretsanta ALTER COLUMN id SET DEFAULT nextval('public.secretsanta_id_seq'::regclass);

--
-- Name: app_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.app_user_id_seq', 63, true);


--
-- Name: secretsanta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.secretsanta_id_seq', 11, true);


--
-- Name: secretsanta PK_0f9a9dcc68e7c523813f30f0110; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.secretsanta
    ADD CONSTRAINT "PK_0f9a9dcc68e7c523813f30f0110" PRIMARY KEY (id);


--
-- Name: app_user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: secretsanta UQ_fc0d4b1326c4dda2db0d51bcef7; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.secretsanta
    ADD CONSTRAINT "UQ_fc0d4b1326c4dda2db0d51bcef7" UNIQUE (code);


--
-- Name: app_user FK_6fc33dd9a212e7e1b7eae746fd3; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT "FK_6fc33dd9a212e7e1b7eae746fd3" FOREIGN KEY ("secretSantaId") REFERENCES public.secretsanta(id);


--
-- PostgreSQL database dump complete
--
