--
-- PostgreSQL database dump
--

\restrict siWwl1cTocTNWdn1lfv3vcjBs0dB3YaIV0cyB0jARffsM2vpZlDlKV7WCFiBhlO

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

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

--
-- Name: ArticleKind; Type: TYPE; Schema: public; Owner: khabarfori
--

CREATE TYPE public."ArticleKind" AS ENUM (
    'NEWS',
    'EXPERT_OPINION',
    'EDITOR_NOTE',
    'EXCLUSIVE'
);


ALTER TYPE public."ArticleKind" OWNER TO khabarfori;

--
-- Name: MessageStatus; Type: TYPE; Schema: public; Owner: khabarfori
--

CREATE TYPE public."MessageStatus" AS ENUM (
    'NEW',
    'REVIEWING',
    'COMPLETED'
);


ALTER TYPE public."MessageStatus" OWNER TO khabarfori;

--
-- Name: NewsStatus; Type: TYPE; Schema: public; Owner: khabarfori
--

CREATE TYPE public."NewsStatus" AS ENUM (
    'DRAFT',
    'REVIEW',
    'PUBLISHED',
    'ARCHIVED'
);


ALTER TYPE public."NewsStatus" OWNER TO khabarfori;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: khabarfori
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'VERIFIED',
    'FAILED'
);


ALTER TYPE public."PaymentStatus" OWNER TO khabarfori;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: khabarfori
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


ALTER TABLE public._prisma_migrations OWNER TO khabarfori;

--
-- Name: admin_logs; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.admin_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "actorId" uuid,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.admin_logs OWNER TO khabarfori;

--
-- Name: analytics; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.analytics (
    id uuid NOT NULL,
    event text NOT NULL,
    "userId" uuid,
    "newsId" uuid,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.analytics OWNER TO khabarfori;

--
-- Name: bookmarks; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.bookmarks (
    "newsId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.bookmarks OWNER TO khabarfori;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.categories (
    id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL
);


ALTER TABLE public.categories OWNER TO khabarfori;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.comments (
    id uuid NOT NULL,
    "newsId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    body character varying(2000) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.comments OWNER TO khabarfori;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.departments (
    id uuid NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.departments OWNER TO khabarfori;

--
-- Name: devices; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.devices (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    token text NOT NULL
);


ALTER TABLE public.devices OWNER TO khabarfori;

--
-- Name: editor_messages; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.editor_messages (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    subject character varying(200) NOT NULL,
    body text NOT NULL,
    type text NOT NULL,
    status public."MessageStatus" DEFAULT 'NEW'::public."MessageStatus" NOT NULL,
    reply text,
    "repliedBy" uuid,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.editor_messages OWNER TO khabarfori;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.employees (
    id uuid NOT NULL,
    "fullName" text NOT NULL,
    photo text,
    "position" text NOT NULL,
    "departmentId" uuid NOT NULL,
    biography text NOT NULL,
    email text NOT NULL,
    phone text,
    "employeeCode" text NOT NULL,
    "employmentDate" timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL
);


ALTER TABLE public.employees OWNER TO khabarfori;

--
-- Name: news; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.news (
    id uuid NOT NULL,
    title character varying(200) NOT NULL,
    description character varying(500) NOT NULL,
    content text NOT NULL,
    "coverImage" text,
    "categoryId" uuid NOT NULL,
    "authorId" uuid NOT NULL,
    status public."NewsStatus" DEFAULT 'DRAFT'::public."NewsStatus" NOT NULL,
    kind public."ArticleKind" DEFAULT 'NEWS'::public."ArticleKind" NOT NULL,
    vip boolean DEFAULT false NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    CONSTRAINT news_nonnegative_views CHECK ((views >= 0))
);


ALTER TABLE public.news OWNER TO khabarfori;

--
-- Name: news_tags; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.news_tags (
    "newsId" uuid NOT NULL,
    "tagId" uuid NOT NULL
);


ALTER TABLE public.news_tags OWNER TO khabarfori;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO khabarfori;

--
-- Name: password_resets; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.password_resets (
    id uuid NOT NULL,
    hash text NOT NULL,
    "userId" uuid NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone
);


ALTER TABLE public.password_resets OWNER TO khabarfori;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.payments (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "planId" text NOT NULL,
    amount integer NOT NULL,
    currency text NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "providerReference" text,
    "transactionId" text,
    "idempotencyKey" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "verifiedAt" timestamp(3) without time zone,
    CONSTRAINT payments_positive_amount CHECK ((amount > 0))
);


ALTER TABLE public.payments OWNER TO khabarfori;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.permissions (
    id uuid NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.permissions OWNER TO khabarfori;

--
-- Name: reactions; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.reactions (
    "newsId" uuid NOT NULL,
    "userId" uuid NOT NULL
);


ALTER TABLE public.reactions OWNER TO khabarfori;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.refresh_tokens (
    id uuid NOT NULL,
    hash text NOT NULL,
    "userId" uuid NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "revokedAt" timestamp(3) without time zone
);


ALTER TABLE public.refresh_tokens OWNER TO khabarfori;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.role_permissions (
    "roleId" uuid NOT NULL,
    "permissionId" uuid NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO khabarfori;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.roles (
    id uuid NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.roles OWNER TO khabarfori;

--
-- Name: salary_profiles; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.salary_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "employeeId" uuid NOT NULL,
    "salaryPasswordHash" text NOT NULL,
    "failedAttempts" integer DEFAULT 0 NOT NULL,
    "lockedUntil" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.salary_profiles OWNER TO khabarfori;

--
-- Name: salary_records; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.salary_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "salaryProfileId" uuid NOT NULL,
    period character varying(7) NOT NULL,
    "grossAmount" integer NOT NULL,
    "netAmount" integer NOT NULL,
    currency text DEFAULT 'IRR'::text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.salary_records OWNER TO khabarfori;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.settings (
    key text NOT NULL,
    value jsonb NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.settings OWNER TO khabarfori;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.subscriptions (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "planId" text NOT NULL,
    "paymentId" uuid NOT NULL,
    "startsAt" timestamp(3) without time zone NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    CONSTRAINT subscriptions_valid_interval CHECK (("expiresAt" > "startsAt"))
);


ALTER TABLE public.subscriptions OWNER TO khabarfori;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.tags (
    id uuid NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.tags OWNER TO khabarfori;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.user_roles (
    "userId" uuid NOT NULL,
    "roleId" uuid NOT NULL
);


ALTER TABLE public.user_roles OWNER TO khabarfori;

--
-- Name: users; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email text,
    phone text,
    name text NOT NULL,
    "passwordHash" text NOT NULL,
    "tokenVersion" integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastActiveAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT users_identifier_required CHECK (((email IS NOT NULL) OR (phone IS NOT NULL)))
);


ALTER TABLE public.users OWNER TO khabarfori;

--
-- Name: vip_plans; Type: TABLE; Schema: public; Owner: khabarfori
--

CREATE TABLE public.vip_plans (
    id text NOT NULL,
    name text NOT NULL,
    months integer NOT NULL,
    amount integer NOT NULL,
    currency text DEFAULT 'IRR'::text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    CONSTRAINT vip_plans_positive_values CHECK (((amount > 0) AND (months > 0)))
);


ALTER TABLE public.vip_plans OWNER TO khabarfori;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
23553d5a-c33a-4e91-b358-625d8773a88d	6ada4f6a5ef02fed70f747ac934ff984aa2d14e5206cae0eb434f8f5578aab6d	2026-09-22 13:30:19.435073+00	202609080001_initial	\N	\N	2026-09-22 13:30:18.927378+00	1
b70cabf2-0852-4643-80f4-ccc646d427e6	f7a8330cd7728849969ae60544e336a44d36d22aadb57406102336c8d87cd45b	2026-09-22 13:30:19.547031+00	202609140001_hr	\N	\N	2026-09-22 13:30:19.438118+00	1
\.


--
-- Data for Name: admin_logs; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.admin_logs (id, "actorId", action, entity, "entityId", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: analytics; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.analytics (id, event, "userId", "newsId", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: bookmarks; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.bookmarks ("newsId", "userId", "createdAt") FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.categories (id, name, slug) FROM stdin;
4c762fed-575e-48a7-a1f9-131394eef44e	سیاست	politics
05a04ea7-df5d-4dc0-932c-b9921b79af7f	اقتصاد	economy
70f3d6ac-223d-4f0a-be3d-24d143a84e35	جامعه	society
e1b6675c-72c0-48f5-b9b2-0d841568d2be	فناوری	technology
89fb5f8b-c5f5-4733-b0b2-6c37d0ae58f7	بین‌الملل	international
1a75db3c-ef8d-4820-8218-938b750209bc	فرهنگ	culture
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.comments (id, "newsId", "userId", body, "createdAt") FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.departments (id, name) FROM stdin;
4a711dde-5c65-4b41-b109-68d301cf0d1e	مدیریت
2bcace67-bd78-44c0-af54-8050b48382a8	تحریریه
2b768001-68fa-45e0-b404-def32af49d52	خبرنگاری
b1bd413a-e961-4478-9936-5d3a0638698e	روابط عمومی
52aab152-a2f9-4d14-96df-91a9d043cb5a	فنی
7fa835a9-774c-45bd-845d-d7f1de17fd2c	پشتیبانی
\.


--
-- Data for Name: devices; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.devices (id, "userId", token) FROM stdin;
\.


--
-- Data for Name: editor_messages; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.editor_messages (id, "userId", subject, body, type, status, reply, "repliedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.employees (id, "fullName", photo, "position", "departmentId", biography, email, phone, "employeeCode", "employmentDate", status) FROM stdin;
\.


--
-- Data for Name: news; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.news (id, title, description, content, "coverImage", "categoryId", "authorId", status, kind, vip, featured, views, "publishedAt", "createdAt", "updatedAt") FROM stdin;
b8cb7fe3-727e-4dbf-9591-d7f05f2a2d50	خبر تست مستقیم خبرفوری	خبر تست مستقیم خبرفوری	خبر تست مستقیم خبرفوری	\N	70f3d6ac-223d-4f0a-be3d-24d143a84e35	2c20e705-df50-4be1-a181-06d1685e6d0d	PUBLISHED	NEWS	f	f	0	2026-09-23 11:29:16.851	2026-09-23 11:29:16.853	2026-09-23 11:29:16.853
\.


--
-- Data for Name: news_tags; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.news_tags ("newsId", "tagId") FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.notifications (id, "userId", title, body, "readAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: password_resets; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.password_resets (id, hash, "userId", "expiresAt", "usedAt") FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.payments (id, "userId", "planId", amount, currency, status, "providerReference", "transactionId", "idempotencyKey", "createdAt", "verifiedAt") FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.permissions (id, name) FROM stdin;
37abe229-7a96-4df6-9c14-e218d0e0da9a	*
97ceaf41-44c1-41e0-b7d0-ae7b14c7a3cb	analytics:read
b2986465-fa46-41f6-8dc8-5c947af5b94d	employees:read
b2eec461-50f0-4ac3-b950-dbb29f7db66e	employees:write
91a8db80-f26e-460e-acfd-8b3fb99ed438	news:read-internal
d03155de-8138-4559-b5df-a02f76b47c55	messages:read
2bf1586f-909e-4f94-8e04-5733b07324a9	messages:reply
74f44373-ff81-45a3-89bd-7db1d975a6c0	messages:write
89f3472f-0d16-49fc-b4a1-29d2780d5c46	users:read
d377a76b-50f3-4bc0-afa4-61e8b099c512	news:write
16fd24f5-bf76-4e2d-a0a1-0753b1acdcd4	news:publish
\.


--
-- Data for Name: reactions; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.reactions ("newsId", "userId") FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.refresh_tokens (id, hash, "userId", "expiresAt", "revokedAt") FROM stdin;
234bfdbe-1913-451e-96a2-91963341865d	6c9168c29e59d146ed4cda50c9a8f195c55eea3240e9824f675ac3ba5edeaffe	2c20e705-df50-4be1-a181-06d1685e6d0d	2026-10-23 07:39:15.854	\N
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.role_permissions ("roleId", "permissionId") FROM stdin;
c9ccd9d5-53aa-4726-8b82-883970585d0e	37abe229-7a96-4df6-9c14-e218d0e0da9a
fde97357-2f88-41d7-9295-e4d07a5cc594	97ceaf41-44c1-41e0-b7d0-ae7b14c7a3cb
fde97357-2f88-41d7-9295-e4d07a5cc594	b2986465-fa46-41f6-8dc8-5c947af5b94d
fde97357-2f88-41d7-9295-e4d07a5cc594	b2eec461-50f0-4ac3-b950-dbb29f7db66e
fde97357-2f88-41d7-9295-e4d07a5cc594	91a8db80-f26e-460e-acfd-8b3fb99ed438
fde97357-2f88-41d7-9295-e4d07a5cc594	d03155de-8138-4559-b5df-a02f76b47c55
fde97357-2f88-41d7-9295-e4d07a5cc594	2bf1586f-909e-4f94-8e04-5733b07324a9
fde97357-2f88-41d7-9295-e4d07a5cc594	74f44373-ff81-45a3-89bd-7db1d975a6c0
fde97357-2f88-41d7-9295-e4d07a5cc594	89f3472f-0d16-49fc-b4a1-29d2780d5c46
078618e1-b4ab-464f-9425-165137a81554	d377a76b-50f3-4bc0-afa4-61e8b099c512
078618e1-b4ab-464f-9425-165137a81554	16fd24f5-bf76-4e2d-a0a1-0753b1acdcd4
078618e1-b4ab-464f-9425-165137a81554	91a8db80-f26e-460e-acfd-8b3fb99ed438
078618e1-b4ab-464f-9425-165137a81554	b2986465-fa46-41f6-8dc8-5c947af5b94d
078618e1-b4ab-464f-9425-165137a81554	d03155de-8138-4559-b5df-a02f76b47c55
078618e1-b4ab-464f-9425-165137a81554	2bf1586f-909e-4f94-8e04-5733b07324a9
078618e1-b4ab-464f-9425-165137a81554	74f44373-ff81-45a3-89bd-7db1d975a6c0
078618e1-b4ab-464f-9425-165137a81554	97ceaf41-44c1-41e0-b7d0-ae7b14c7a3cb
f916b6af-9495-4498-a6e8-3a9044fbe0eb	d377a76b-50f3-4bc0-afa4-61e8b099c512
f916b6af-9495-4498-a6e8-3a9044fbe0eb	b2986465-fa46-41f6-8dc8-5c947af5b94d
f916b6af-9495-4498-a6e8-3a9044fbe0eb	74f44373-ff81-45a3-89bd-7db1d975a6c0
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.roles (id, name) FROM stdin;
c9ccd9d5-53aa-4726-8b82-883970585d0e	SUPER_ADMIN
fde97357-2f88-41d7-9295-e4d07a5cc594	HOLDING_MANAGER
078618e1-b4ab-464f-9425-165137a81554	EDITOR_IN_CHIEF
f916b6af-9495-4498-a6e8-3a9044fbe0eb	EMPLOYEE
77ed0e4a-b6e4-423d-9f00-3f77720a1890	VIP_SUBSCRIBER
7499bfe2-d5d8-43d3-b1f0-511603d1daa4	NORMAL_USER
\.


--
-- Data for Name: salary_profiles; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.salary_profiles (id, "employeeId", "salaryPasswordHash", "failedAttempts", "lockedUntil", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: salary_records; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.salary_records (id, "salaryProfileId", period, "grossAmount", "netAmount", currency, notes, "createdAt") FROM stdin;
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.settings (key, value, "updatedAt") FROM stdin;
brand	{"name": "KhabarFori", "locale": "fa", "direction": "rtl"}	2026-09-22 13:30:22.846
telegram:akhbarefori	{"items": [{"id": 9999, "url": "https://t.me/AkhbareFori/9999", "score": 15, "views": 100, "excerpt": "خبر تست مستقیم خبرفوری", "forwards": 5, "reactions": 10, "publishedAt": "2026-09-23T11:25:00Z"}], "scanned": 1, "complete": true, "capturedAt": "2026-09-23T11:27:59Z", "missingMetrics": 0}	2026-09-23 11:28:28.124
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.subscriptions (id, "userId", "planId", "paymentId", "startsAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.tags (id, name) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.user_roles ("userId", "roleId") FROM stdin;
2c20e705-df50-4be1-a181-06d1685e6d0d	7499bfe2-d5d8-43d3-b1f0-511603d1daa4
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.users (id, email, phone, name, "passwordHash", "tokenVersion", active, "createdAt", "lastActiveAt") FROM stdin;
2c20e705-df50-4be1-a181-06d1685e6d0d	\N	+989308320010	mahdi vazin	$2b$12$LM6cb0Dc.d/Bkei41iWwUe6iq3yVkKGPIgN7zxqPQCpL1A/gyTp42	0	t	2026-09-23 07:39:15.831	2026-09-23 07:39:15.831
\.


--
-- Data for Name: vip_plans; Type: TABLE DATA; Schema: public; Owner: khabarfori
--

COPY public.vip_plans (id, name, months, amount, currency, active) FROM stdin;
monthly	ماهانه	1	1490000	IRR	t
quarterly	سه‌ماهه	3	3990000	IRR	t
yearly	سالانه	12	13900000	IRR	t
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: admin_logs admin_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_pkey PRIMARY KEY (id);


--
-- Name: analytics analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.analytics
    ADD CONSTRAINT analytics_pkey PRIMARY KEY (id);


--
-- Name: bookmarks bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_pkey PRIMARY KEY ("userId", "newsId");


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: devices devices_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_pkey PRIMARY KEY (id);


--
-- Name: editor_messages editor_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.editor_messages
    ADD CONSTRAINT editor_messages_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: news news_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- Name: news_tags news_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.news_tags
    ADD CONSTRAINT news_tags_pkey PRIMARY KEY ("newsId", "tagId");


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: reactions reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_pkey PRIMARY KEY ("newsId", "userId");


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY ("roleId", "permissionId");


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: salary_profiles salary_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.salary_profiles
    ADD CONSTRAINT salary_profiles_pkey PRIMARY KEY (id);


--
-- Name: salary_records salary_records_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.salary_records
    ADD CONSTRAINT salary_records_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (key);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY ("userId", "roleId");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vip_plans vip_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.vip_plans
    ADD CONSTRAINT vip_plans_pkey PRIMARY KEY (id);


--
-- Name: admin_logs_actorId_createdAt_idx; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE INDEX "admin_logs_actorId_createdAt_idx" ON public.admin_logs USING btree ("actorId", "createdAt");


--
-- Name: admin_logs_entity_entityId_createdAt_idx; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE INDEX "admin_logs_entity_entityId_createdAt_idx" ON public.admin_logs USING btree (entity, "entityId", "createdAt");


--
-- Name: analytics_event_createdAt_idx; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE INDEX "analytics_event_createdAt_idx" ON public.analytics USING btree (event, "createdAt");


--
-- Name: analytics_newsId_createdAt_idx; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE INDEX "analytics_newsId_createdAt_idx" ON public.analytics USING btree ("newsId", "createdAt");


--
-- Name: categories_name_key; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: comments_newsId_createdAt_idx; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE INDEX "comments_newsId_createdAt_idx" ON public.comments USING btree ("newsId", "createdAt");


--
-- Name: departments_name_key; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE UNIQUE INDEX departments_name_key ON public.departments USING btree (name);


--
-- Name: devices_token_key; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE UNIQUE INDEX devices_token_key ON public.devices USING btree (token);


--
-- Name: devices_userId_idx; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE INDEX "devices_userId_idx" ON public.devices USING btree ("userId");


--
-- Name: editor_messages_status_createdAt_idx; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE INDEX "editor_messages_status_createdAt_idx" ON public.editor_messages USING btree (status, "createdAt" DESC);


--
-- Name: editor_messages_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE INDEX "editor_messages_userId_createdAt_idx" ON public.editor_messages USING btree ("userId", "createdAt" DESC);


--
-- Name: employees_departmentId_fullName_idx; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE INDEX "employees_departmentId_fullName_idx" ON public.employees USING btree ("departmentId", "fullName");


--
-- Name: employees_employeeCode_key; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE UNIQUE INDEX "employees_employeeCode_key" ON public.employees USING btree ("employeeCode");


--
-- Name: news_authorId_status_idx; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE INDEX "news_authorId_status_idx" ON public.news USING btree ("authorId", status);


--
-- Name: news_categoryId_status_publishedAt_idx; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE INDEX "news_categoryId_status_publishedAt_idx" ON public.news USING btree ("categoryId", status, "publishedAt" DESC);


--
-- Name: news_status_publishedAt_id_idx; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE INDEX "news_status_publishedAt_id_idx" ON public.news USING btree (status, "publishedAt" DESC, id);


--
-- Name: news_status_views_idx; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE INDEX news_status_views_idx ON public.news USING btree (status, views DESC);


--
-- Name: news_tags_tagId_idx; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE INDEX "news_tags_tagId_idx" ON public.news_tags USING btree ("tagId");


--
-- Name: notifications_userId_readAt_createdAt_idx; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE INDEX "notifications_userId_readAt_createdAt_idx" ON public.notifications USING btree ("userId", "readAt", "createdAt" DESC);


--
-- Name: password_resets_hash_key; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE UNIQUE INDEX password_resets_hash_key ON public.password_resets USING btree (hash);


--
-- Name: payments_idempotencyKey_key; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE UNIQUE INDEX "payments_idempotencyKey_key" ON public.payments USING btree ("idempotencyKey");


--
-- Name: payments_providerReference_key; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE UNIQUE INDEX "payments_providerReference_key" ON public.payments USING btree ("providerReference");


--
-- Name: payments_transactionId_key; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE UNIQUE INDEX "payments_transactionId_key" ON public.payments USING btree ("transactionId");


--
-- Name: payments_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE INDEX "payments_userId_createdAt_idx" ON public.payments USING btree ("userId", "createdAt" DESC);


--
-- Name: permissions_name_key; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE UNIQUE INDEX permissions_name_key ON public.permissions USING btree (name);


--
-- Name: refresh_tokens_hash_key; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE UNIQUE INDEX refresh_tokens_hash_key ON public.refresh_tokens USING btree (hash);


--
-- Name: refresh_tokens_userId_idx; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE INDEX "refresh_tokens_userId_idx" ON public.refresh_tokens USING btree ("userId");


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: salary_profiles_employeeId_key; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE UNIQUE INDEX "salary_profiles_employeeId_key" ON public.salary_profiles USING btree ("employeeId");


--
-- Name: salary_records_period_idx; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE INDEX salary_records_period_idx ON public.salary_records USING btree (period);


--
-- Name: salary_records_salaryProfileId_period_key; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE UNIQUE INDEX "salary_records_salaryProfileId_period_key" ON public.salary_records USING btree ("salaryProfileId", period);


--
-- Name: subscriptions_paymentId_key; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE UNIQUE INDEX "subscriptions_paymentId_key" ON public.subscriptions USING btree ("paymentId");


--
-- Name: subscriptions_userId_expiresAt_idx; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE INDEX "subscriptions_userId_expiresAt_idx" ON public.subscriptions USING btree ("userId", "expiresAt");


--
-- Name: tags_name_key; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);


--
-- Name: user_roles_roleId_idx; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE INDEX "user_roles_roleId_idx" ON public.user_roles USING btree ("roleId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_lastActiveAt_idx; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE INDEX "users_lastActiveAt_idx" ON public.users USING btree ("lastActiveAt");


--
-- Name: users_phone_key; Type: INDEX; Schema: public; Owner: khabarfori
--

CREATE UNIQUE INDEX users_phone_key ON public.users USING btree (phone);


--
-- Name: admin_logs admin_logs_actorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT "admin_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: analytics analytics_newsId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.analytics
    ADD CONSTRAINT "analytics_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES public.news(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: analytics analytics_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.analytics
    ADD CONSTRAINT "analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bookmarks bookmarks_newsId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT "bookmarks_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES public.news(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bookmarks bookmarks_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_newsId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES public.news(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: devices devices_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT "devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: editor_messages editor_messages_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.editor_messages
    ADD CONSTRAINT "editor_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: employees employees_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: news news_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT "news_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: news news_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT "news_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: news_tags news_tags_newsId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.news_tags
    ADD CONSTRAINT "news_tags_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES public.news(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: news_tags news_tags_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.news_tags
    ADD CONSTRAINT "news_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: password_resets password_resets_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT "password_resets_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_planId_fkey" FOREIGN KEY ("planId") REFERENCES public.vip_plans(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments payments_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reactions reactions_newsId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT "reactions_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES public.news(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reactions reactions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT "reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: salary_profiles salary_profiles_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.salary_profiles
    ADD CONSTRAINT "salary_profiles_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: salary_records salary_records_salaryProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.salary_records
    ADD CONSTRAINT "salary_records_salaryProfileId_fkey" FOREIGN KEY ("salaryProfileId") REFERENCES public.salary_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public.payments(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: subscriptions subscriptions_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES public.vip_plans(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: subscriptions subscriptions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_roles user_roles_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khabarfori
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: analytics; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: bookmarks; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: comments; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

--
-- Name: departments; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

--
-- Name: devices; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

--
-- Name: editor_messages; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.editor_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: employees; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

--
-- Name: news; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

--
-- Name: news_tags; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.news_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: password_resets; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: permissions; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: reactions; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: role_permissions; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: roles; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

--
-- Name: settings; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

--
-- Name: subscriptions; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: tags; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: vip_plans; Type: ROW SECURITY; Schema: public; Owner: khabarfori
--

ALTER TABLE public.vip_plans ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict siWwl1cTocTNWdn1lfv3vcjBs0dB3YaIV0cyB0jARffsM2vpZlDlKV7WCFiBhlO

