--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'EMPLOYE',
    'RESPONSABLE',
    'ADMINISTRATEUR'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: Statut; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Statut" AS ENUM (
    'PRESENT',
    'ABSENT',
    'RETARD'
);


ALTER TYPE public."Statut" OWNER TO postgres;

--
-- Name: StatutDemande; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StatutDemande" AS ENUM (
    'SOUMISE',
    'APPROUVEE',
    'REJETEE'
);


ALTER TYPE public."StatutDemande" OWNER TO postgres;

--
-- Name: StatutTache; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StatutTache" AS ENUM (
    'A_FAIRE',
    'EN_COURS',
    'TERMINEE'
);


ALTER TYPE public."StatutTache" OWNER TO postgres;

--
-- Name: TypeResponsable; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TypeResponsable" AS ENUM (
    'RH',
    'CHEF_EQUIPE'
);


ALTER TYPE public."TypeResponsable" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Administrateur; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Administrateur" (
    id text NOT NULL
);


ALTER TABLE public."Administrateur" OWNER TO postgres;

--
-- Name: Demande; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Demande" (
    id text NOT NULL,
    "employeId" text NOT NULL,
    type text NOT NULL,
    "dateDebut" timestamp(3) without time zone NOT NULL,
    "dateFin" timestamp(3) without time zone,
    statut public."StatutDemande" DEFAULT 'SOUMISE'::public."StatutDemande" NOT NULL,
    raison text
);


ALTER TABLE public."Demande" OWNER TO postgres;

--
-- Name: Employe; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Employe" (
    id text NOT NULL,
    "responsableId" text,
    "heuresSupp" double precision DEFAULT 0 NOT NULL,
    "heuresTravail" double precision DEFAULT 0 NOT NULL,
    "soldeConges" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Employe" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    message text NOT NULL,
    "employeId" text,
    "responsableId" text,
    "dateEnvoi" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    lu boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: Pointage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Pointage" (
    id text NOT NULL,
    "employeId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "heureArrivee" timestamp(3) without time zone NOT NULL,
    "heureDepart" timestamp(3) without time zone,
    statut public."Statut" NOT NULL,
    "heureDepartDej" timestamp(3) without time zone,
    "heureRetourDej" timestamp(3) without time zone,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Pointage" OWNER TO postgres;

--
-- Name: Responsable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Responsable" (
    id text NOT NULL,
    "typeResponsable" public."TypeResponsable",
    "administrateurId" text
);


ALTER TABLE public."Responsable" OWNER TO postgres;

--
-- Name: Tache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Tache" (
    id text NOT NULL,
    "employeId" text NOT NULL,
    titre text NOT NULL,
    description text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    statut public."StatutTache" DEFAULT 'A_FAIRE'::public."StatutTache" NOT NULL,
    "dateLimite" timestamp(3) without time zone
);


ALTER TABLE public."Tache" OWNER TO postgres;

--
-- Name: Utilisateur; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Utilisateur" (
    id text NOT NULL,
    nom text NOT NULL,
    prenom text NOT NULL,
    email text NOT NULL,
    role public."Role" NOT NULL,
    "motDePasse" text NOT NULL,
    matricule character varying(255),
    datedenaissance date,
    "isActive" boolean DEFAULT false NOT NULL,
    "registrationToken" character varying(255),
    "tokenExpiresAt" timestamp(3) without time zone
);


ALTER TABLE public."Utilisateur" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "employeId" character varying NOT NULL,
    "responsableId" character varying,
    message character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notification OWNER TO postgres;

--
-- Data for Name: Administrateur; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Administrateur" (id) FROM stdin;
\.


--
-- Data for Name: Demande; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Demande" (id, "employeId", type, "dateDebut", "dateFin", statut, raison) FROM stdin;
ea3950f7-7074-49d6-96d2-0fb90b9102ca	b8ef4b16-d0cc-4125-8fea-e0b25633abb9	CONGE	2025-03-18 00:00:00	2025-03-20 00:00:00	SOUMISE	Besoin de repos apr├¿s une p├®riode intense de travail
0650578a-8a38-4376-9814-aad8abaebe63	4b2af381-247e-4ef7-82f9-40e31072c671	autorization_sortie	2025-04-03 23:00:00	2025-04-04 23:00:00	SOUMISE	visite medicale
5e1c9cde-3947-4da1-a2d7-108f1b8fdb34	4b2af381-247e-4ef7-82f9-40e31072c671	autorization_sortie	2025-04-03 23:00:00	2025-04-04 23:00:00	SOUMISE	visite medicale
2f69419c-9266-43d4-9da0-0ab23b3c301c	4b2af381-247e-4ef7-82f9-40e31072c671	autorization_sortie	2025-04-03 23:00:00	2025-04-04 23:00:00	SOUMISE	visite medicale
b9bbc919-f925-4ab8-86bd-20b76b1a3a03	18deb4c0-e7d2-47a5-8061-5a5801fe4af4	absence	2025-06-01 19:00:00	2025-06-30 18:37:00	REJETEE	marfoudh men 8er sbab
38c9cce5-b61c-4845-8eaf-0d442cd3782e	18deb4c0-e7d2-47a5-8061-5a5801fe4af4	cong├®	2025-04-30 23:00:00	2025-05-30 23:00:00	APPROUVEE	Vacances annuelles
9bc72a18-45e6-4126-ac70-f106cd9c8b0e	18deb4c0-e7d2-47a5-8061-5a5801fe4af4	absence	2025-04-28 01:00:00	2025-05-31 01:00:00	APPROUVEE	cvb
23237f5b-c4ca-4d13-a920-6c637ddf6a1a	18deb4c0-e7d2-47a5-8061-5a5801fe4af4	cong├®	2025-04-06 00:00:00	2025-04-10 00:00:00	APPROUVEE	Vacances familiales
7e9be018-73d3-458e-b238-863206362681	18deb4c0-e7d2-47a5-8061-5a5801fe4af4	cong├®	2025-06-01 08:38:00	2025-06-30 08:39:00	REJETEE	oooo
\.


--
-- Data for Name: Employe; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Employe" (id, "responsableId", "heuresSupp", "heuresTravail", "soldeConges") FROM stdin;
c8bf809d-7c50-4ad3-b042-224874abefc5	869150e8-b849-4b98-b489-dec7bca60657	0	0	0
18deb4c0-e7d2-47a5-8061-5a5801fe4af4	869150e8-b849-4b98-b489-dec7bca60657	0	0	0
b8ef4b16-d0cc-4125-8fea-e0b25633abb9	9e9be07a-35f6-43bf-ad60-92e24060ad73	0	0	0
4b2af381-247e-4ef7-82f9-40e31072c671	59a7c675-4d62-4837-aea6-ab553e15e42e	0	0	0
ff27172f-33ad-4470-95b4-1091fb277a08	\N	0	0	0
c7218406-a2f0-4a1c-a4d2-8cce3fe251b1	\N	0	0	0
d7bf1df1-f149-4276-919c-5feec34c9eab	4e765383-6f38-448a-b155-19fb7dec63d1	0	0	0
e66cfeec-37c3-458a-b6f4-35db3ba17630	9e9be07a-35f6-43bf-ad60-92e24060ad73	0	0	0
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, message, "employeId", "responsableId", "dateEnvoi", lu) FROM stdin;
\.


--
-- Data for Name: Pointage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Pointage" (id, "employeId", date, "heureArrivee", "heureDepart", statut, "heureDepartDej", "heureRetourDej", "deletedAt") FROM stdin;
9a828532-cdf4-4e5b-95c1-4c950c0a328a	c8bf809d-7c50-4ad3-b042-224874abefc5	2025-06-12 07:00:00	2025-06-12 07:00:00	2025-06-12 17:00:00	PRESENT	\N	\N	\N
9bae75b6-f5b6-49f8-862a-f1e8312cd431	b8ef4b16-d0cc-4125-8fea-e0b25633abb9	2025-03-15 00:00:00	2025-03-15 08:30:00	2025-03-15 17:00:00	RETARD	\N	\N	\N
f3b05db4-15f7-472c-aa3a-fabf3966ad67	b8ef4b16-d0cc-4125-8fea-e0b25633abb9	2025-03-28 00:00:00	2025-03-28 08:00:00	2025-03-28 17:00:00	PRESENT	2025-03-28 12:00:00	2025-03-28 13:00:00	\N
a9a33be3-11dd-4f73-b3d2-7ba101e4e0d2	b8ef4b16-d0cc-4125-8fea-e0b25633abb9	2025-05-15 08:00:00	2025-05-15 08:00:00	2025-05-15 17:00:00	PRESENT	2025-05-15 12:00:00	2025-05-15 13:00:00	\N
5d0e1f2f-5c01-4b14-9a5c-04d1e0e4878e	c8bf809d-7c50-4ad3-b042-224874abefc5	2025-03-29 00:00:00	2025-03-29 21:19:15.526	\N	ABSENT	\N	\N	\N
2b7ffecf-1ac1-4589-81a2-f8ee6d30f0fe	b8ef4b16-d0cc-4125-8fea-e0b25633abb9	2025-05-15 08:00:00	2025-05-15 08:00:00	2025-05-15 17:00:00	PRESENT	2025-05-15 12:00:00	2025-05-15 13:00:00	\N
ebde0368-d984-4ac7-b369-c5b33d9aaae9	18deb4c0-e7d2-47a5-8061-5a5801fe4af4	2025-03-29 00:00:00	2025-03-29 21:19:15.539	\N	ABSENT	\N	\N	\N
e0198aa8-1959-450f-ba7a-f925489fbe44	b8ef4b16-d0cc-4125-8fea-e0b25633abb9	2025-05-15 08:00:00	2025-05-15 08:00:00	2025-05-15 17:00:00	PRESENT	2025-05-15 12:00:00	2025-05-15 13:00:00	\N
c5f5538d-25e5-447d-a807-73b8971d2f23	b8ef4b16-d0cc-4125-8fea-e0b25633abb9	2025-04-15 00:00:00	2025-04-15 08:12:00	2025-04-15 17:00:00	PRESENT	2025-04-15 12:00:00	2025-04-15 13:00:00	\N
3a6d66bf-2a93-4982-b56b-7e987f760d0c	b8ef4b16-d0cc-4125-8fea-e0b25633abb9	2025-03-29 00:00:00	2025-03-29 21:19:15.543	\N	ABSENT	\N	\N	\N
e9ef51d3-e248-47a5-b44e-b0f8b72bbf93	b8ef4b16-d0cc-4125-8fea-e0b25633abb9	2025-03-30 19:06:52.03	2025-03-30 19:06:52.03	\N	RETARD	\N	\N	\N
fc315662-57f3-4cca-a44c-95bcf190146e	18deb4c0-e7d2-47a5-8061-5a5801fe4af4	2025-03-30 19:07:25.729	2025-03-30 19:07:25.729	2025-03-30 17:00:00	RETARD	\N	\N	\N
a55ef665-0351-414d-8cf4-ea33fa0eeea1	18deb4c0-e7d2-47a5-8061-5a5801fe4af4	2025-04-01 14:16:11.188	2025-04-01 14:16:11.188	2025-04-01 16:23:50.781	RETARD	\N	\N	\N
cda3b8f0-5ea8-41e2-94f1-5da9cee2877c	18deb4c0-e7d2-47a5-8061-5a5801fe4af4	2025-04-02 10:30:41.806	2025-04-02 10:30:41.806	2025-04-02 11:35:38.127	RETARD	\N	\N	\N
b250fdb8-50c9-49da-a5fe-4756a264548f	c8bf809d-7c50-4ad3-b042-224874abefc5	2025-04-02 00:00:00	2025-04-02 18:57:56.992	\N	ABSENT	\N	\N	\N
359f2897-f041-4fdb-a2b7-a21685dc031e	18deb4c0-e7d2-47a5-8061-5a5801fe4af4	2025-04-02 00:00:00	2025-04-02 18:57:56.992	\N	ABSENT	\N	\N	\N
97f80d04-74bc-418d-b707-dc77cc044197	b8ef4b16-d0cc-4125-8fea-e0b25633abb9	2025-04-02 00:00:00	2025-04-02 18:57:56.992	2025-04-02 19:33:52.851	ABSENT	\N	\N	\N
17fea799-5163-467d-a1a3-7dbdeb11be60	b8ef4b16-d0cc-4125-8fea-e0b25633abb9	2025-04-03 09:48:17.356	2025-04-03 09:48:17.356	\N	RETARD	\N	\N	\N
edf80fdf-6802-40d4-835f-fdccf2ee387a	18deb4c0-e7d2-47a5-8061-5a5801fe4af4	2025-04-03 09:48:39.734	2025-04-03 09:48:39.734	\N	RETARD	\N	\N	\N
f9cba55d-0113-447d-831d-564a92956c82	18deb4c0-e7d2-47a5-8061-5a5801fe4af4	2025-04-08 08:38:01.98	2025-04-08 08:38:01.98	\N	RETARD	\N	\N	\N
\.


--
-- Data for Name: Responsable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Responsable" (id, "typeResponsable", "administrateurId") FROM stdin;
869150e8-b849-4b98-b489-dec7bca60657	CHEF_EQUIPE	\N
9e9be07a-35f6-43bf-ad60-92e24060ad73	CHEF_EQUIPE	\N
59a7c675-4d62-4837-aea6-ab553e15e42e	CHEF_EQUIPE	\N
4e765383-6f38-448a-b155-19fb7dec63d1	CHEF_EQUIPE	\N
f6e1bc2b-a883-474b-956a-16a0b2f5a2c1	CHEF_EQUIPE	\N
e5e2cd21-ead7-4e87-945d-92abdfe38609	RH	\N
fcb4e566-4d7d-458d-97c8-6de95d7a32eb	CHEF_EQUIPE	\N
\.


--
-- Data for Name: Tache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Tache" (id, "employeId", titre, description, date, statut, "dateLimite") FROM stdin;
15a58167-3188-488b-8e0d-3213af1aae8c	18deb4c0-e7d2-47a5-8061-5a5801fe4af4	Terminer le rapport de performance	R├®diger un rapport de performance pour le trimestre.	2025-04-06 15:38:17.025	A_FAIRE	2025-04-08 18:00:00
ffda1048-9004-4627-96d3-9756dd531339	18deb4c0-e7d2-47a5-8061-5a5801fe4af4	string	aaaa	2025-04-06 16:36:45.139	EN_COURS	2025-04-06 14:11:00
31c93a0e-e3e3-468e-b804-4472fcf2934b	18deb4c0-e7d2-47a5-8061-5a5801fe4af4	R├®union hebdomadaire	R├®union pour discuter de l'avancement des projets en cours.	2025-04-06 14:16:34.687	TERMINEE	2025-04-10 13:00:00
\.


--
-- Data for Name: Utilisateur; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Utilisateur" (id, nom, prenom, email, role, "motDePasse", matricule, datedenaissance, "isActive", "registrationToken", "tokenExpiresAt") FROM stdin;
07597762-2347-4e7e-ac00-16fc89a46832	eya	ben	eya@gmail.com	RESPONSABLE	eya123*	\N	\N	f	\N	\N
c8bf809d-7c50-4ad3-b042-224874abefc5	sameh	John	sameh@example.com	EMPLOYE	sameh123	\N	\N	f	\N	\N
18deb4c0-e7d2-47a5-8061-5a5801fe4af4	amina	amina	amina@gmail.com	EMPLOYE	$2b$10$ZDvcteVflINz6Ou2Kc4Yee5iVrVmrY4JSd013FJYZ.YrDi0H5JGDG	\N	\N	f	\N	\N
b8ef4b16-d0cc-4125-8fea-e0b25633abb9	halima	halima	halima@gmail.com	EMPLOYE	$2b$10$fzXCzJH51yUtGTnU624gf.dTNwZGMuWcm1VUxWlnVs.XhaVSVFOEm	\N	\N	f	\N	\N
4b2af381-247e-4ef7-82f9-40e31072c671	doua	ezzar	doua@gmail.com	EMPLOYE	$2b$10$BXF00wvmD0Jvzd4CbMsJ8.BkHUzde56ClOk5fR7JUcPcipLVD2Qw.	\N	\N	f	\N	\N
ff27172f-33ad-4470-95b4-1091fb277a08	chaima	ezzar	chaima@gmail.com	EMPLOYE	$2b$10$peZHnQpOl.HbFvTH8RLFc.eUiqbzR8SBB8qOOZpaE5xjpV8Q1Nfka	14045713	1998-12-22	f	\N	\N
c7218406-a2f0-4a1c-a4d2-8cce3fe251b1	hamida	hami	hamida@gmail.com	EMPLOYE	$2b$10$wzZVZ4R3e/jQjRe7ZWfuFObNqzMhfwZrfieF87R8UaT.cmAEdGnEe	14047598	1991-04-06	f	\N	\N
4e765383-6f38-448a-b155-19fb7dec63d1	yassmin	yassmin	yassmin@gmail.com	RESPONSABLE	$2b$10$xU31zDCEzciHy4zIN.7/3.Qx60ZfhQmbAqcjQ06CS9GcvePR6XuMG	14045712	\N	f	\N	\N
59a7c675-4d62-4837-aea6-ab553e15e42e	zahra 	sallemi	zahra@gmail.com	RESPONSABLE	$2b$10$dOnKCUSLu6Sh./P3Kc0zV.QDIa65lCWexdWh1ZV2mXGZBDhG3BQAm	14045713	\N	f	\N	\N
869150e8-b849-4b98-b489-dec7bca60657	ala	krata	ala.Kr@example.com	RESPONSABLE	123456*	14045714	\N	f	\N	\N
9e9be07a-35f6-43bf-ad60-92e24060ad73	Karim	Ezzar	karim@gmail.com	EMPLOYE	$2b$10$Ox1YO5oJh5tynmalYKCDte.WVsOkudHTvaqTJJl3fMJr0vurwyhDG	14045721	\N	f	\N	\N
e5e2cd21-ead7-4e87-945d-92abdfe38609	chourouk	chourouk	chourouk@gmail.com	RESPONSABLE	$2b$10$N95/YHYwTX1/9A0mv14K6OZCJf2qxbxv8sylTK8/gVPapG99lLgNa	14045722	\N	f	\N	\N
f6e1bc2b-a883-474b-956a-16a0b2f5a2c1	folla	folla	folla@gmail.com	RESPONSABLE	$2b$10$AQBSy5IoJ0izIhOpcsz0pOeh4P5lAZJXhGcejMd9KKtDfJbcURNJ2	14045723	\N	f	\N	\N
d7bf1df1-f149-4276-919c-5feec34c9eab	Walid	Boufahja	walide@gmail.com	EMPLOYE	$2b$10$E5u42JSDY47SNRGVP8Wvre1R0AWmzfeDJbWSo4V2hpi/XOBgMDqJu	12345678	1995-07-22	f	\N	\N
e66cfeec-37c3-458a-b6f4-35db3ba17630	aaa	zzzz	aaa@gmail.com	EMPLOYE	$2b$10$f1qn.xbL2vQOO9PyO2MgL.OpAVfki9BCj2DfpXO.9USJG7XtPJ6JO	1234568	1993-01-01	f	\N	\N
fcb4e566-4d7d-458d-97c8-6de95d7a32eb	malek	malek	malek@gmail.com	RESPONSABLE	$2b$10$IA9jPpWugHIX8geHa4UTLuAENaEQ4AeD4n0UKyN6mDnfGgGYGS62i	12345699	2000-01-01	f	\N	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
664de58f-d29e-43f6-9bfd-e7ff1155a4f5	d645ab9492fb08857b473979f626535cf24966edd75edb84280d67caa0702b38	2025-03-10 23:36:57.166947+01	20250303113353_init	\N	\N	2025-03-10 23:36:57.105627+01	1
c7870210-b80d-4153-a107-6fcc80f0af14	8e1c5d051efa3120e06e3bccbdbf5a795dd985e0cce27e3f86fd108704b215e9	2025-03-21 14:15:04.030217+01	20250321131504_ajout_statut_tache	\N	\N	2025-03-21 14:15:04.026699+01	1
9713c0a1-2bb7-41c7-9efc-36d4e26272ae	b8cf4acd7714dc5bcd156a3a54a92e83ccede3947c5fc5366c6c170b392130ad	2025-03-10 23:36:57.17203+01	20250307231119_update_schema	\N	\N	2025-03-10 23:36:57.168186+01	1
02a2cc77-113a-44db-ba1f-8ce9b06cb0aa	2317c558b702bb849d472ac96a880aa466f1f488935d27d83fd1c5690ab0d1b5	2025-03-10 23:36:57.176691+01	20250309105529_update_all_changes	\N	\N	2025-03-10 23:36:57.173202+01	1
2b94f4bb-a505-4729-9036-012f54909e8a	1d33594d0e3ff5493cb3c70cf22fde5514c616867fa736de842caa3b45a2a957	2025-03-10 23:36:57.181493+01	20250309113324_remove_administrateur_id_from_responsable	\N	\N	2025-03-10 23:36:57.177849+01	1
5b238188-b38a-4d8c-a262-935c382f9416	674f15f44da50b68a55e26d03d2ee69ad14dab02113b31f8be0799da240479f0	2025-03-21 15:03:04.858646+01	20250321140304_remove_heure_debut_travail	\N	\N	2025-03-21 15:03:04.854148+01	1
99e61d10-a145-41d9-9e94-72b33aa1bb9f	9d953548d2936e11d3ded838027f35d09835074536fb46cd932c4ecb599e3738	2025-03-10 23:36:57.19331+01	20250309120537_update_all_changes	\N	\N	2025-03-10 23:36:57.182795+01	1
bca31d24-d39c-4c9d-88f0-4e61d6b339d2	ace09e782eb7a05ddd94231578ece3828637812acb452fdf26d5e1aff2386115	2025-03-10 23:36:57.203863+01	20250309123256_update_all_changes	\N	\N	2025-03-10 23:36:57.194548+01	1
afacae88-7f93-414f-ab50-0098dcb53a95	f008e6e27bc3fbfa80d43fc515459d432b985d887a17466dd822831a38b5ec4b	2025-03-10 23:36:57.211574+01	20250309125507_update_all_changes	\N	\N	2025-03-10 23:36:57.205212+01	1
737d6e56-2cb8-4959-ac19-1ad0419ffef1	4a15bcbd22e02a4b5ece2abcd7c938d92aba313cb318774949c748e1885e1de6	2025-03-22 23:47:47.672271+01	20250322224747_update_employe_responsable_relation	\N	\N	2025-03-22 23:47:47.663838+01	1
22417f2b-df17-4cd8-b7f0-5726a962ce01	b61f7c7fc6c052c327d1237eb85e7f552c1bb717cc07d385dfecb7dddb6f6113	2025-03-10 23:36:57.217268+01	20250309140049_update_all_changes	\N	\N	2025-03-10 23:36:57.212984+01	1
0e4c68f8-e534-4bde-8786-c1d3d5df8557	1c493dc52d81ad14c2e2280be58f9007b9f1c88d9d4359fe92b5d528546a1764	2025-03-11 12:22:04.110869+01	20250311112204_add_statuts_to_pointage	\N	\N	2025-03-11 12:22:04.104616+01	1
d01540b6-c8a3-40d5-8ac1-b60aafb28017	16748dced962965560dee01542f11f99d4914becb821b1b63d0413a964a23ed7	2025-03-12 09:45:55.522233+01	20250312084555_ajout_pointage_statut	\N	\N	2025-03-12 09:45:55.516551+01	1
09b4414b-a58b-4196-a0de-23affb90799d	043dd81f76cdb83e1f7dd3d9ab00f0ff9ecec16735d3c2cf073158781f3e2eb2	2025-03-28 17:49:23.066008+01	20250328164923_add_retard_status	\N	\N	2025-03-28 17:49:23.061828+01	1
60112f23-4bf3-453b-b6df-f3abdfaba366	114aee0c7f3e17baf9e96f33dc1cfb9a020f7c8b778bb58ddc4c4dc0c05df44f	2025-03-15 21:48:46.555187+01	20250315204846_ajout_pause_dejeuner	\N	\N	2025-03-15 21:48:46.55197+01	1
e4f204b4-50a5-4da4-a092-8e1ae1a8c082	3512115f4ce709db84849763b5f127978c9c5d680f31364ee6e35c5f224ac9ba	2025-03-21 13:26:35.448996+01	20250321122635_ajout_taches	\N	\N	2025-03-21 13:26:35.432126+01	1
30699622-65b9-4ced-8531-a84ddb4e8a8e	fa5833296de38f571e8eef1e35cd94551f26f70507546990211957625bb6772e	2025-03-21 13:35:27.278163+01	20250321123527_ajout_statut_tache	\N	\N	2025-03-21 13:35:27.270779+01	1
cdd27fb1-1317-4ce6-945a-6714a7f62f1f	7375ea9819c483d81c0081d050c7df41dd50ae572b979ee622fe52ed6545574d	2025-03-29 23:13:20.229722+01	20250329221320_add_deleted_at_to_pointage	\N	\N	2025-03-29 23:13:20.223628+01	1
\.


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification (id, "employeId", "responsableId", message, "createdAt") FROM stdin;
\.


--
-- Name: Administrateur Administrateur_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Administrateur"
    ADD CONSTRAINT "Administrateur_pkey" PRIMARY KEY (id);


--
-- Name: Demande Demande_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Demande"
    ADD CONSTRAINT "Demande_pkey" PRIMARY KEY (id);


--
-- Name: Employe Employe_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Employe"
    ADD CONSTRAINT "Employe_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: notification PK_705b6c7cdf9b2c2ff7ac7872cb7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY (id);


--
-- Name: Pointage Pointage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pointage"
    ADD CONSTRAINT "Pointage_pkey" PRIMARY KEY (id);


--
-- Name: Responsable Responsable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Responsable"
    ADD CONSTRAINT "Responsable_pkey" PRIMARY KEY (id);


--
-- Name: Tache Tache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tache"
    ADD CONSTRAINT "Tache_pkey" PRIMARY KEY (id);


--
-- Name: Utilisateur Utilisateur_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Utilisateur"
    ADD CONSTRAINT "Utilisateur_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Utilisateur_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Utilisateur_email_key" ON public."Utilisateur" USING btree (email);


--
-- Name: Administrateur Administrateur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Administrateur"
    ADD CONSTRAINT "Administrateur_id_fkey" FOREIGN KEY (id) REFERENCES public."Utilisateur"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Demande Demande_employeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Demande"
    ADD CONSTRAINT "Demande_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES public."Employe"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Employe Employe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Employe"
    ADD CONSTRAINT "Employe_id_fkey" FOREIGN KEY (id) REFERENCES public."Utilisateur"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Employe Employe_responsableId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Employe"
    ADD CONSTRAINT "Employe_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES public."Responsable"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_employeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES public."Employe"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_responsableId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES public."Responsable"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Pointage Pointage_employeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pointage"
    ADD CONSTRAINT "Pointage_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES public."Employe"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Responsable Responsable_administrateurId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Responsable"
    ADD CONSTRAINT "Responsable_administrateurId_fkey" FOREIGN KEY ("administrateurId") REFERENCES public."Administrateur"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Responsable Responsable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Responsable"
    ADD CONSTRAINT "Responsable_id_fkey" FOREIGN KEY (id) REFERENCES public."Utilisateur"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Tache Tache_employeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tache"
    ADD CONSTRAINT "Tache_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES public."Employe"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

