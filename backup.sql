PGDMP  3    /                }            projet_equipes    17.2    17.2 7    ]           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            ^           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            _           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            `           1262    98113    projet_equipes    DATABASE     ü   CREATE DATABASE projet_equipes WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'French_France.1252';
    DROP DATABASE projet_equipes;
                     postgres    false                        2615    103784    public    SCHEMA     2   -- *not* creating schema, since initdb creates it
 2   -- *not* dropping schema, since initdb creates it
                     postgres    false            a           0    0 
   SCHEMA public    COMMENT         COMMENT ON SCHEMA public IS '';
                        postgres    false    6            b           0    0 
   SCHEMA public    ACL     +   REVOKE USAGE ON SCHEMA public FROM PUBLIC;
                        postgres    false    6                        3079    113237 	   uuid-ossp 	   EXTENSION     ?   CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
    DROP EXTENSION "uuid-ossp";
                        false    6            c           0    0    EXTENSION "uuid-ossp"    COMMENT     W   COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';
                             false    2            e           1247    103795    Role    TYPE     ^   CREATE TYPE public."Role" AS ENUM (
    'EMPLOYE',
    'RESPONSABLE',
    'ADMINISTRATEUR'
);
    DROP TYPE public."Role";
       public               postgres    false    6            â           1247    104900    Statut    TYPE     S   CREATE TYPE public."Statut" AS ENUM (
    'PRESENT',
    'ABSENT',
    'RETARD'
);
    DROP TYPE public."Statut";
       public               postgres    false    6            h           1247    103802 
   StatutDemande    TYPE     ^   CREATE TYPE public."StatutDemande" AS ENUM (
    'SOUMISE',
    'APPROUVEE',
    'REJETEE'
);
 "   DROP TYPE public."StatutDemande";
       public               postgres    false    6            ë           1247    109272    StatutTache    TYPE     \   CREATE TYPE public."StatutTache" AS ENUM (
    'A_FAIRE',
    'EN_COURS',
    'TERMINEE'
);
     DROP TYPE public."StatutTache";
       public               postgres    false    6            k           1247    103810    TypeResponsable    TYPE     N   CREATE TYPE public."TypeResponsable" AS ENUM (
    'RH',
    'CHEF_EQUIPE'
);
 $   DROP TYPE public."TypeResponsable";
       public               postgres    false    6            Ì            1259    103836    Administrateur    TABLE     ?   CREATE TABLE public."Administrateur" (
    id text NOT NULL
);
 $   DROP TABLE public."Administrateur";
       public         heap r       postgres    false    6            Ó            1259    103850    Demande    TABLE     =  CREATE TABLE public."Demande" (
    id text NOT NULL,
    "employeId" text NOT NULL,
    type text NOT NULL,
    "dateDebut" timestamp(3) without time zone NOT NULL,
    "dateFin" timestamp(3) without time zone,
    statut public."StatutDemande" DEFAULT 'SOUMISE'::public."StatutDemande" NOT NULL,
    raison text
);
    DROP TABLE public."Demande";
       public         heap r       postgres    false    872    6    872            ▄            1259    103822    Employe    TABLE     ´   CREATE TABLE public."Employe" (
    id text NOT NULL,
    "responsableId" text,
    "heuresSupp" double precision DEFAULT 0 NOT NULL,
    "heuresTravail" double precision DEFAULT 0 NOT NULL,
    "soldeConges" integer DEFAULT 0 NOT NULL
);
    DROP TABLE public."Employe";
       public         heap r       postgres    false    6            ß            1259    103858    Notification    TABLE       CREATE TABLE public."Notification" (
    id text NOT NULL,
    message text NOT NULL,
    "employeId" text,
    "responsableId" text,
    "dateEnvoi" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    lu boolean DEFAULT false NOT NULL
);
 "   DROP TABLE public."Notification";
       public         heap r       postgres    false    6            ▀            1259    103843    Pointage    TABLE     À  CREATE TABLE public."Pointage" (
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
    DROP TABLE public."Pointage";
       public         heap r       postgres    false    6    899            ¦            1259    103829    Responsable    TABLE     ë   CREATE TABLE public."Responsable" (
    id text NOT NULL,
    "typeResponsable" public."TypeResponsable",
    "administrateurId" text
);
 !   DROP TABLE public."Responsable";
       public         heap r       postgres    false    875    6            Ô            1259    108609    Tache    TABLE     S  CREATE TABLE public."Tache" (
    id text NOT NULL,
    "employeId" text NOT NULL,
    titre text NOT NULL,
    description text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    statut public."StatutTache" DEFAULT 'A_FAIRE'::public."StatutTache" NOT NULL,
    "dateLimite" timestamp(3) without time zone
);
    DROP TABLE public."Tache";
       public         heap r       postgres    false    905    6    905            █            1259    103815    Utilisateur    TABLE     ø  CREATE TABLE public."Utilisateur" (
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
 !   DROP TABLE public."Utilisateur";
       public         heap r       postgres    false    6    869            ┌            1259    103785    _prisma_migrations    TABLE     ì  CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);
 &   DROP TABLE public._prisma_migrations;
       public         heap r       postgres    false    6            Ò            1259    113610    notification    TABLE       CREATE TABLE public.notification (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "employeId" character varying NOT NULL,
    "responsableId" character varying,
    message character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);
     DROP TABLE public.notification;
       public         heap r       postgres    false    2    6    6            U          0    103836    Administrateur 
   TABLE DATA           .   COPY public."Administrateur" (id) FROM stdin;
    public               postgres    false    222            W          0    103850    Demande 
   TABLE DATA           b   COPY public."Demande" (id, "employeId", type, "dateDebut", "dateFin", statut, raison) FROM stdin;
    public               postgres    false    224            S          0    103822    Employe 
   TABLE DATA           f   COPY public."Employe" (id, "responsableId", "heuresSupp", "heuresTravail", "soldeConges") FROM stdin;
    public               postgres    false    220            X          0    103858    Notification 
   TABLE DATA           d   COPY public."Notification" (id, message, "employeId", "responsableId", "dateEnvoi", lu) FROM stdin;
    public               postgres    false    225            V          0    103843    Pointage 
   TABLE DATA           ô   COPY public."Pointage" (id, "employeId", date, "heureArrivee", "heureDepart", statut, "heureDepartDej", "heureRetourDej", "deletedAt") FROM stdin;
    public               postgres    false    223            T          0    103829    Responsable 
   TABLE DATA           R   COPY public."Responsable" (id, "typeResponsable", "administrateurId") FROM stdin;
    public               postgres    false    221            Y          0    108609    Tache 
   TABLE DATA           b   COPY public."Tache" (id, "employeId", titre, description, date, statut, "dateLimite") FROM stdin;
    public               postgres    false    226            R          0    103815    Utilisateur 
   TABLE DATA           ó   COPY public."Utilisateur" (id, nom, prenom, email, role, "motDePasse", matricule, datedenaissance, "isActive", "registrationToken", "tokenExpiresAt") FROM stdin;
    public               postgres    false    219            Q          0    103785    _prisma_migrations 
   TABLE DATA           Ä   COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
    public               postgres    false    218            Z          0    113610    notification 
   TABLE DATA           ^   COPY public.notification (id, "employeId", "responsableId", message, "createdAt") FROM stdin;
    public               postgres    false    227            ½           2606    103842 "   Administrateur Administrateur_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public."Administrateur"
    ADD CONSTRAINT "Administrateur_pkey" PRIMARY KEY (id);
 P   ALTER TABLE ONLY public."Administrateur" DROP CONSTRAINT "Administrateur_pkey";
       public                 postgres    false    222            »           2606    103857    Demande Demande_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public."Demande"
    ADD CONSTRAINT "Demande_pkey" PRIMARY KEY (id);
 B   ALTER TABLE ONLY public."Demande" DROP CONSTRAINT "Demande_pkey";
       public                 postgres    false    224            º           2606    103828    Employe Employe_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public."Employe"
    ADD CONSTRAINT "Employe_pkey" PRIMARY KEY (id);
 B   ALTER TABLE ONLY public."Employe" DROP CONSTRAINT "Employe_pkey";
       public                 postgres    false    220            ▒           2606    103865    Notification Notification_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);
 L   ALTER TABLE ONLY public."Notification" DROP CONSTRAINT "Notification_pkey";
       public                 postgres    false    225            Á           2606    113618 +   notification PK_705b6c7cdf9b2c2ff7ac7872cb7 
   CONSTRAINT     k   ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY (id);
 W   ALTER TABLE ONLY public.notification DROP CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7";
       public                 postgres    false    227            ¡           2606    103849    Pointage Pointage_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public."Pointage"
    ADD CONSTRAINT "Pointage_pkey" PRIMARY KEY (id);
 D   ALTER TABLE ONLY public."Pointage" DROP CONSTRAINT "Pointage_pkey";
       public                 postgres    false    223            ®           2606    103835    Responsable Responsable_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public."Responsable"
    ADD CONSTRAINT "Responsable_pkey" PRIMARY KEY (id);
 J   ALTER TABLE ONLY public."Responsable" DROP CONSTRAINT "Responsable_pkey";
       public                 postgres    false    221            │           2606    108617    Tache Tache_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public."Tache"
    ADD CONSTRAINT "Tache_pkey" PRIMARY KEY (id);
 >   ALTER TABLE ONLY public."Tache" DROP CONSTRAINT "Tache_pkey";
       public                 postgres    false    226            Ñ           2606    103821    Utilisateur Utilisateur_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public."Utilisateur"
    ADD CONSTRAINT "Utilisateur_pkey" PRIMARY KEY (id);
 J   ALTER TABLE ONLY public."Utilisateur" DROP CONSTRAINT "Utilisateur_pkey";
       public                 postgres    false    219            ó           2606    103793 *   _prisma_migrations _prisma_migrations_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public._prisma_migrations DROP CONSTRAINT _prisma_migrations_pkey;
       public                 postgres    false    218            ú           1259    103866    Utilisateur_email_key    INDEX     Y   CREATE UNIQUE INDEX "Utilisateur_email_key" ON public."Utilisateur" USING btree (email);
 +   DROP INDEX public."Utilisateur_email_key";
       public                 postgres    false    219            ║           2606    103887 %   Administrateur Administrateur_id_fkey 
   FK CONSTRAINT     ░   ALTER TABLE ONLY public."Administrateur"
    ADD CONSTRAINT "Administrateur_id_fkey" FOREIGN KEY (id) REFERENCES public."Utilisateur"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 S   ALTER TABLE ONLY public."Administrateur" DROP CONSTRAINT "Administrateur_id_fkey";
       public               postgres    false    4773    222    219            ╝           2606    103897    Demande Demande_employeId_fkey 
   FK CONSTRAINT     «   ALTER TABLE ONLY public."Demande"
    ADD CONSTRAINT "Demande_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES public."Employe"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 L   ALTER TABLE ONLY public."Demande" DROP CONSTRAINT "Demande_employeId_fkey";
       public               postgres    false    4775    224    220            Â           2606    103867    Employe Employe_id_fkey 
   FK CONSTRAINT     ó   ALTER TABLE ONLY public."Employe"
    ADD CONSTRAINT "Employe_id_fkey" FOREIGN KEY (id) REFERENCES public."Utilisateur"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 E   ALTER TABLE ONLY public."Employe" DROP CONSTRAINT "Employe_id_fkey";
       public               postgres    false    220    4773    219            À           2606    117851 "   Employe Employe_responsableId_fkey 
   FK CONSTRAINT     ¿   ALTER TABLE ONLY public."Employe"
    ADD CONSTRAINT "Employe_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES public."Responsable"(id) ON DELETE SET NULL;
 P   ALTER TABLE ONLY public."Employe" DROP CONSTRAINT "Employe_responsableId_fkey";
       public               postgres    false    4777    220    221            ¢           2606    103902 (   Notification Notification_employeId_fkey 
   FK CONSTRAINT     ©   ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES public."Employe"(id) ON UPDATE CASCADE ON DELETE SET NULL;
 V   ALTER TABLE ONLY public."Notification" DROP CONSTRAINT "Notification_employeId_fkey";
       public               postgres    false    4775    220    225            ¥           2606    103907 ,   Notification Notification_responsableId_fkey 
   FK CONSTRAINT     ─   ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES public."Responsable"(id) ON UPDATE CASCADE ON DELETE SET NULL;
 Z   ALTER TABLE ONLY public."Notification" DROP CONSTRAINT "Notification_responsableId_fkey";
       public               postgres    false    225    4777    221            ╗           2606    103892     Pointage Pointage_employeId_fkey 
   FK CONSTRAINT     ░   ALTER TABLE ONLY public."Pointage"
    ADD CONSTRAINT "Pointage_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES public."Employe"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 N   ALTER TABLE ONLY public."Pointage" DROP CONSTRAINT "Pointage_employeId_fkey";
       public               postgres    false    223    220    4775            ©           2606    103926 -   Responsable Responsable_administrateurId_fkey 
   FK CONSTRAINT     ╦   ALTER TABLE ONLY public."Responsable"
    ADD CONSTRAINT "Responsable_administrateurId_fkey" FOREIGN KEY ("administrateurId") REFERENCES public."Administrateur"(id) ON UPDATE CASCADE ON DELETE SET NULL;
 [   ALTER TABLE ONLY public."Responsable" DROP CONSTRAINT "Responsable_administrateurId_fkey";
       public               postgres    false    222    221    4779            ╣           2606    103921    Responsable Responsable_id_fkey 
   FK CONSTRAINT     ¬   ALTER TABLE ONLY public."Responsable"
    ADD CONSTRAINT "Responsable_id_fkey" FOREIGN KEY (id) REFERENCES public."Utilisateur"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 M   ALTER TABLE ONLY public."Responsable" DROP CONSTRAINT "Responsable_id_fkey";
       public               postgres    false    221    219    4773            ┐           2606    108618    Tache Tache_employeId_fkey 
   FK CONSTRAINT     ¬   ALTER TABLE ONLY public."Tache"
    ADD CONSTRAINT "Tache_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES public."Employe"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 H   ALTER TABLE ONLY public."Tache" DROP CONSTRAINT "Tache_employeId_fkey";
       public               postgres    false    220    226    4775            U   
   x£ïÐÒÔÔ ┼ ®      W   H  x£┼öMnÈ@àÎ÷)|üBı?¯ƒý ìHÉ(!Y!í¬¯j░4▒#{&ND╬æïÐæ3be½W»█‗W»▀│Éë=¢│âÞ▓,æúBØ¿ß ┼▓rÉ1%░J¸è▓¯Ø1─ø¸º_>¼ìu
¿ð!×<¼'MÒ^╗8¢³³±bı╝ôeã.K7╦═┤tt3▀ ^║Ý(¦═²¦<Lug72.▓;┤ÖÚûåuï«ÃÌé@&Ç5¥beü(bg╦Üè	
┤§VÛöAù┼(¶:9»┌nªy°Eøa┐/Ë╝õ/░¡╠Ø6CT═¯ÁÃ!nçeÏHw-yH┤ûÂòb╩&Z6ôÊ┘â┬PçÆ┘ÏÎúË┼E½bé¿Ø½Ìe1k├&TÚ§Þ82º¿"öX_▓─éÒ\├├Ì▒"Ch▓░MÔkV¡ºHt
zÛ¬"ûèmêË#æTØèDv*£┐Ë╬WƒV_W½µÜµ2m¾¤╩4vAµnaÔÍäzÑIz`ºjé¡ƒ*Ç┘ZØ▓±A╦¾©Ê4■©┐{2Ñ"ıho¤╬╬O/»*Ï%¬ıÆîÒVÍkY┌╚╔kRÁ¢©]3P‗EíK9ª└°L¬CÀ,ÞZ`uîÑ÷┌+¦r½ì6¥¶╔&¬ëW(jù£±9Gè^õ║Ò ê¡5┌k qºð§░hgÅù╚éıo▓®üÜ±]óîFg£vA¢ Ù!KXsÄ▓┤ËÔ┐YÜÛË~{ËÂÝ¾Ëi╬      S   +  x£òÉ╗¡e1EÒs{aÿÅ¦─T­░í ãG║Ê─ON6╦øÁg÷─u└À"H£ë┬└,Ë%▓zÙ3mæbM╚)$ÎØd.8Á=wÜ·â´¹ð<ò▓╩âx(L4
ØH]-┐ßÕ¼û$ââ{â_^W@a▓┌æ╣×U+=`h╚╚å8å░©Xð0ÄÅ/OÆúÃ$`±®vÿ▄ÀÍ tÌµ¶Þ
┐âé╗G╠ßæ¬úHK©¥╝nvrn©Uê°²USÇpQ'╗╬þþ´7¢ØiÌF▄»m┌r=═¢kt▒RÊ ¶±l:Mð¶jb7X┤6hWÝ!{Uõ#Õªc░{Í-0ÆTüVº_í6}yeÂ▀U¥ê¥Qk╣ÍNÄr°ù?>ƒ¤?ùfï±      X   
   x£ïÐÒÔÔ ┼ ®      V   W  x£═û;nIåcÚs6èE▓èý╠ïUjZçNÛ┼¹a9Æ╝û==░z#â■.┐µÒgYË¼Bãt^Ê┴d ­0I#5╩┌åvÎdÛÉ▄&AO£!gÍ╩¡/‗ÉSH0_R¦Sè▀´4³«}y~·þÚ¾Îçoƒ_ÅÍ█¬Ê°§┴µ
ZrÃÑäyL&|Þ║£;ÿi`î U_
VÛY
QÙ¦Ì┬á\^b²@xıtº_Á ░×ƒ¥~z■¹òSO2;Ã!»└5hìé¬u'+Ñ═R¤Qe¢Ñ║jz½¦$Ù²╗|p×Ì┤ oÍê·è»├9ü¢Fif¿¢a┬┼+═|\ÌR¸>Þ]Ý°Ù╗|p■©╠┤ð│âîM┘æ┴ÜH<qÑÝºÙL{Ffý Òv╔©úÝ(øõr¡÷º┐~n╚▄½¹Ï«Ë!jáÏ2©«U&%O¥■╚«>Wóó0Mc└█¿Q·b0ñMk¡-{@Ø½¾H░jtÎÓ® HMÞïø¾Ã3Hvö┴òð┤54▒╚`rÞ¡ã­XV¾¥ÿ ╚qÊ	Yû sØð4U¿Èı*╬ýÖ╬Ç¾ü±°╦{Ý8Ç¾»ÓÈ╩,Ñ;õf&¬║öuÖV»%ÙI╗·]ÚÖKo╦c,WLõk{uµSÛ┌k¯¦ÝT	(]"b*╗õ-Ð=9ó▀X° öR2H§╚╔
¾êÑÎçú%õ▓╬ì├[╠║g┘j¥A<È´-ÿ&▓╝öÙ9	ùA×á#÷‗
¹÷ûÍZ
¤ð1$╝ ´Xv─
U?ñù=Ë.i½è7äcÂh{O +FÖqe0÷>øìÁ▓Í:Nã= ]ù0Òº>ñÒN▓ônÿÙ
atK‗┘Ô■>c3*,¥CJ╦à├l³╠╩xëx3«W
¦Ñ¯R6│|È§$µ9<q3ÿá┼ëò9ß®V¹▀ VÒ[g£¡▄»ôVÍkÏQ¼æÿÐN][>‗^ÀØÞ:ô*xCç5┬T3,1æÕj»ÏÛî═ı¹*Ú$]ÆÝnZ7ÆrW?░ç5#U>èª(GÜJÔÓs¤kæÍv▓f▀âÆmò¯ÙG^eúç#╠JñÎ┼ù▀	R©Y6)C¾Iÿù½%┼é─═¶×|Ç‗m{||³¶Ãë      T   ¢   x£]Å9N1DÒÖ╗4‗Êkî}Hd_Bmw¹■G└ñôUP»¶J┘*òTè8l'Tâ╚)c:&9^Î█´§§¾■y¤ÅËÊFqÞ┤░Å\└Z6,\<ñ▀2ù╔BÇ┴
P╗Çº3° ÛY)▒ÕØ┴ª«xuDuò¬¡![É{È;ôömF½É█0U└Éb╗¨êò]╣Ï±²°»«90ë¸âÉ $¦-Ö
iÔ¢Õ©¤?_╬¾³Ã┘O      Y   ╦  x£ìÆ┴j▄0å¤Ìºð¡º1IûG¥à▓üÜ┬6¢é,ì7Y{±z¹N}Ä¥XÃ!eIBaà@0¾kµø_┬&6ä¥ïDÓêz Í¼Aã╚ö*ñ╠¢K©═\ ÝÍ╗╗X\uÃ¾~yV¤¼µx8L¾ó2½¤eÜ¸qL\Ý■³╬├âHNÒ$Û0Ø^*,¾░þÒ2s]mð┤WÏtû:lk	UW¸ÎW7╗Ý9O
®ËZ÷ªöQ;éá%Ò╝i!°l!┤ì¤╣▒hm©l,aãç*╩zCÔ;Ù;ÎÈ(àÂÀ¸ƒ┐~▀}{#pÔèb15[ÂéB=¡P«5%¼Ù/C¹NÒ0ìÛæ¹<ÝcÄ├╠þÞïuy8ªË"ï»¤ƒÔ»ıÈ=Å½¤Guÿºƒ╝Å*ë°X┐ûí\Ý®¡¯Â╗/7À█│╣¿┌Ws)4,├­╣ApÞ6`üRÆKl
µÏV=qq=z╚:%I*üuoomý¹P-1=2Ve×ãàÃ|¯å
ÑòÙı&|xiIÙðÚògôBÓVÜBpQ>p2('éýBû3ÆÅwLËË
±´|c;kÙ`?>÷JC»4?Û═f¾£[Õ╣      R   Õ  x£}û█nÛ:å»│×b_¼½%9§┘╬¦ÔTháäc8h▀ÏÄ
ö
y·mh½ÊnÁQö+¾1 ?ú@┴"!8ÿP¿(!@▄)╩%┴ü=®@█§9■ØÕj▒
═&zÁ~'i¸KÕVÝ³a‗'°À}¥¦k³eñvFåA@UFÇåÈÎ┬T
¬┤uåO*À¾ Ì╠Î»Ú_{T¨ve/5j¸ØV2®¢¥±¥@2│Ü¼╚0áB1 !GÇ)&!rû*Gò/ÍÛ·y§Ì 7Í┐³=¡╠│M¦Û«]­dÅøåN¼eïtùµ╗	ì¹Dõ6×L├╔«║Ç
Î½§/LZZG5Ô âã è░grV5f£Ñu╠ıjæ½¤ß{,Wî+E▄`Þ4|«ÍCÄÚ╠à┘á²2¡▀´G&GÚ­8Z¡Ëºp<Wi?¢Mj¨,¬▒rD"Ç®ÎÿZ'Ç─.Zéá└ådø¢
lQ¿¦%²×¿<¥à­ÕÉWa|(2ZÐ¸O▒╦╦ã░╚,ÒòU▓d«'ÔíÚÿ┼ÂòVq¸%³BõH`|O2@®Ç bÜ#õ4BAÿ╣:wÞòÚ§­=ıÍNÙ¯6Yà
}{4d»ukB;\<Ûó'¹Õ▓|LÆÚVıÏ±aø╩.j╗Ñ
àö	DEá│=?,0Ærá░;;á¿ÀÜ4ãg1Cy¨‗Eª.ß- ±ÑÿªS┌#÷µí¹ð│b:r¹█DÀï¹╣{Ö¯▄┬ÌJÐôC5M^¬e§u═^²á╩3"É╚?äÁé3"	Ó^^▀F®ÇFî9-2k8╔PpROOÌ·_Ò7Ë³ãzTT+Á┬,'Z▄ÁCqC┬¯æ├®øws]z4]╚+²¿nÂËÒÒ²}²¢Ø°Zj)ß
ã ═³¬íÆá¼‗]ıîïÿÑÏàÜ´È?~ÈW+Ù;y9■ÿ%ÙfeÏoÝyÌtHË└"
╗ı;┼┘¬2▓Ãl4GËþÒ·┤\ØÎI╣[╩?¶¥ö<BZ	┤ñ~&┤7éª2¥B┼!g"P+,wÛYØ│░╣¹┤®«±³óóî y»D»+E6Ê
sPóP¸ÍÃ{úAò	4ınß¡s1²‗£o¿õê&	█─s÷|Zþj5iV¬¤6ÑO╔rƒ5§8êÒq¸±÷╗ùË╝·.FÎdûYl2îÇ§~CH"╩2Oªtµ,æF~7¹¦f┐³‗│TÝê¦Lôù┴¦D%ÿm‗dZë~<ÛÒA>ØVâª╝ÖÑÁ¡GÐ¬5k┐Å&■õÑLhç2çÇCg®░Ó Bæ╠Yk5æU:¨ìÜÕ═Ì®¨â
^╬G¹}klOq▄»N¿ÞÀ{§┤#GçØE=XÕà│ıXÅ·ÜÔ¨vq3N╩│¹Ûc╝ôY\ªÆ(«çÕ▄£ü å ╩╬S╔§¬gÜhà'0PJà┐╬╔█=«├únßC7Ió╬)┴¸│VÿlK®[.órÕW¦v£äÐ░Î┼°╣¾8yâ╗░ ²Ê@ïÎhÛù┤w_&▓3øÎX	xf#û	E░ıüÀÆ]^?Í¸«=tÂú²¼q7û3█Pt8hÝKÁÂ¬ui╔VÚøº6¤½kWƒı'§>Ãï7╚(
0¶▀ƒ) 
²·§║▀z(      Q   ╠  x£òW┘NcG}÷|´Qú«Á╗²¨éHV»"ûÿH¨¹£f░	3╩ ,¼█«Sg®jwË‗
â╦*╦CikäÖÍ"2½║l7\¡ÂóàWï9[jÜññ▓£¦─·b-¯sîds┤¼£Ò­Èkì)rô╝Ò╚óèW,{±¢Ñkr/Ü~ï¶‗iö(D"&çø¹øÒ¯Å▀ÀÎº¤Es~yÄ¥¶ö±
C├7%ôP)ªÓ½¸W¼ïtù'uÐh«*─qFƒÊzoú-½®Ï%█î¢ONSV÷5(Ô`mL6╦¸*ÿ«H¸d¹¿Î¿ùÚ¼zF±dQ§»çþÒßÚXÅ°s¼²Ù³ÇÕÔF╩+ûÆHz¼©Á,=à2WÔC'2Î╣k╣/¡}ñD:║Á>╚╝J5¡àg`SðÎn½ø©w´öbô┬$▒Ä¤;Ü8╩ëAò├¾ÀQÅ¾­w§gîxªý»("W¯=ÑÇ~Èá:ZhòV╚}û¢ÀXÙþú@╦mô¶Rå]/^sãþÛ¥hi╬ElpY@H7/▒Â8¿┘Páùtú@)ã▀aÈ██C Z´ £O?├Æ ~┼┬É³ÊÍBÁh%ûPóxê─╦┤─2s¦ÐÇhïÄÕl òÌñºO­é│î┤;õiı*'▄cHâú©KƒWæ	']`ü7XÅ¾¯ßo`wp╔Ë±└×7Ò░¯­ÚËÀç¹º┌n?è¯bB╦_!Zcy9└Ñákõ*┤ð¨.ÖWQ‗Ø']ddó═s5â Gö┴sz®Z3øÜð╩mãT╩¿¼Q±B·ð¢lÊ¤û]²┬@
á▀!~░y│m6z¼Îø█Oî¶~ÜÆµôæ╩téâ
┌hÇÂY4$DæÈJ¡òÁ+ú ╣4#÷─'ü┼1!┤9-¿.û,ô┬B½®¸Qä╗╬ÌºK·QñæKr4I┐¿└╠╚ñW(¡#▒kRzð^F╚y┼áB£2xW¹äSµ┘RìH│Q│ögƒ 1╗ñL­4M.PgôÛZáÌæ±ƒVüD└sùXä═KQ{úÑ«┌ÙäÈÊ*Ztà┌,åê^4VÓå¦è1OGÀ.½¡èXÃLÛFªåöX2█╚9UJêë12s¬Æø═«Ýs, Ö¶ïü¦_├*ÖN╔É$
ƒµü{╦AïòP;ò@uDÑ▓Í\┤ËJÞ6ÿ'RQÀ'WDvÛE‗(xvÀ╝á£Æb╝÷ñV░ôã¶wí¾Và&╝«=1º3ì1~4Úw,¾¯█Ý├?¾<
­■Âo¯?·þ³Xê {¼öÀ0a§ütHØ%÷Z£!7┌5ºòzZÿ/ÞK─4ÆfC±i!w;|û¾=ª!Ól┴<	┌l¥ :¨Q°è|Aöã¿┐ß`®d=ìúë°═+çióA█ÿ!ºýíoåGQ┘É└ÈÂÿª<2maÍyBU▒m{Që1!/¿g0ZY│p│aî╠q╚ð§¢
$´ÖÀD"¼^Ì▒`ó¾Â îqZ×Ãç├Àçø¹c²¾?ü}~TTîÉW@#┬
ßðsàïÔ░É!¢ðâs5öM ä─åºµ [┼═<Ä9À;¦B4+█@HfjÈ\6ı┬«òeÄ│Ö─W▒ýı÷fÎÑ╔Y" █▓Ü┘iÒy├q┬÷╬¨AäÆÞ─Oiè(ÏFlnàÔíóÏ└é|jÕeÄýó
î¢!ç[ûëw¶╠ýxk½3r[:¸Ê4ËÆëPõw┼þ+é▄╦×Õ:║#k╬îö╔▒Ó╩?Å¾XO4}ö┌Õ!HÙôm<é`d*TÂ­╦øÅÅûÈ6Íµu¸å\0`ñVQ{±%PuÓ¡æ#là┼(ÕÍ,ÅÐÁcÐï0┘└ ^´
Á+ª¢µ¢·5H@é£1cðYVcª>?mô¶»¨|??sqòËb=ußîª┴b┼U┴KßÇx¬xÕ3´─hïÍÑ}ªXÂ┼{EriÂ3,Õ^░x;q─£+vàëÁ┬░aà-¡^Lr┘│´┼«Us)ù{│╦ø╠^6Û Pr■<×ÓôY$b╗vµÓÍ
Ælb|ÜP¿YDè§-¤¦é¶░[ýfÆù%Üy"¥ÀR1HÐ╠ò"µ³^╩Âµ`msÂÍ<%×¬█32Û;ƒ
1N ´z­~JLÚ┤®§üUx5
©gl®<qQ├7üÜp├╩╝├\▓YKªÊ5<Ëíq┬¦èâ~h­9õ
À7­üu¤ß»æ´Î.[×nMìÎ╠CþKa\&8¥8e╠█y£ÒPÅ?	│╦Ë─▀,¾Ã§ù/_■▀ƒò      Z   
   x£ïÐÒÔÔ ┼ ®     
